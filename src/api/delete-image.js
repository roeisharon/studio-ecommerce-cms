// api/delete-image.js — Vercel serverless function

const https  = require('https');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const API_KEY    = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  // Log env var presence (not values) for debugging
  console.log('Env check:', {
    CLOUD_NAME: CLOUD_NAME ? `set (${CLOUD_NAME})` : 'MISSING',
    API_KEY:    API_KEY    ? 'set'                  : 'MISSING',
    API_SECRET: API_SECRET ? 'set'                  : 'MISSING',
  });

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return res.status(500).json({
      error: 'Missing Cloudinary credentials',
      missing: {
        CLOUDINARY_CLOUD_NAME: !CLOUD_NAME,
        CLOUDINARY_API_KEY:    !API_KEY,
        CLOUDINARY_API_SECRET: !API_SECRET,
      }
    });
  }

  const { urls = [] } = req.body;
  console.log('URLs to delete:', urls);

  if (!urls.length) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  // Extract public_id from Cloudinary URL
  // https://res.cloudinary.com/cloud/image/upload/v123/folder/file.jpg → folder/file
  const extractPublicId = (url) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  };

  const deleteOne = (publicId, resourceType) => new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)
      .digest('hex');

    const body = new URLSearchParams({
      public_id: publicId,
      signature,
      api_key:   API_KEY,
      timestamp: String(timestamp),
    }).toString();

    console.log(`Deleting ${resourceType}/${publicId}...`);

    const req2 = https.request({
      hostname: 'api.cloudinary.com',
      path:     `/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (r) => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => {
        console.log(`Cloudinary response for ${publicId}:`, data);
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });

    req2.on('error', reject);
    req2.write(body);
    req2.end();
  });

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const publicId = extractPublicId(url);
      if (!publicId) {
        console.log('Could not extract public_id from:', url);
        return { url, status: 'skipped', reason: 'could not extract public_id' };
      }
      const resourceType = url.includes('/video/') ? 'video' : 'image';
      const result = await deleteOne(publicId, resourceType);
      return { url, publicId, resourceType, result };
    })
  );

  res.status(200).json({ results });
};