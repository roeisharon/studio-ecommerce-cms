// api/delete-image.js — Vercel serverless function
// Deletes images from Cloudinary server-side using API secret
// Required env vars (no VITE_ prefix — server only):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

const https  = require('https');
const crypto = require('crypto');

const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Extract public_id from a Cloudinary URL
// https://res.cloudinary.com/cloud/image/upload/v123/deborah-ceramics/abc.jpg
//   → deborah-ceramics/abc
const extractPublicId = (url) => {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const deleteOne = (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000);

    // Signature must be over sorted params joined with API secret
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)
      .digest('hex');

    // Cloudinary destroy endpoint requires form-encoded body, not JSON
    const body = new URLSearchParams({
      public_id: publicId,
      signature,
      api_key:   API_KEY,
      timestamp: String(timestamp),
    }).toString();

    const req = https.request({
      hostname: 'api.cloudinary.com',
      path:     `/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.error('Missing Cloudinary env vars:', { CLOUD_NAME: !!CLOUD_NAME, API_KEY: !!API_KEY, API_SECRET: !!API_SECRET });
    return res.status(500).json({ error: 'Cloudinary credentials not configured on server' });
  }

  const { urls = [] } = req.body;

  if (!urls.length) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const publicId = extractPublicId(url);
      if (!publicId) return { url, status: 'skipped — could not extract public_id' };

      const resourceType = url.includes('/video/') ? 'video' : 'image';
      const result = await deleteOne(publicId, resourceType);
      return { url, publicId, resourceType, result };
    })
  );

  // Log for Vercel function logs
  console.log('Cloudinary delete results:', JSON.stringify(results, null, 2));

  res.status(200).json({
    deleted: results.filter(r => r.value?.result?.result === 'ok').length,
    results,
  });
};