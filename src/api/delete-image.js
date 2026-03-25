// api/delete-image.js — Vercel serverless function
// Receives a list of Cloudinary public_ids and deletes them server-side
// CLOUDINARY_API_SECRET is only available here, never in the browser

const https = require('https');
const crypto = require('crypto');

const CLOUD_NAME  = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;

// Extract public_id from a Cloudinary URL
// e.g. https://res.cloudinary.com/mycloudname/image/upload/v123/folder/abc123.jpg → folder/abc123
const extractPublicId = (url) => {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)
      .digest('hex');

    const body = JSON.stringify({
      public_id: publicId,
      signature,
      api_key:   API_KEY,
      timestamp,
    });

    const req = https.request({
      hostname: 'api.cloudinary.com',
      path:     `/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
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
    return res.status(500).json({ error: 'Cloudinary credentials not configured' });
  }

  const { urls = [] } = req.body;

  if (!urls.length) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const publicId = extractPublicId(url);
      if (!publicId) return { url, status: 'skipped' };

      // Detect resource type from URL
      const resourceType = url.includes('/video/') ? 'video' : 'image';
      const result = await deleteFromCloudinary(publicId, resourceType);
      return { url, publicId, result };
    })
  );

  res.status(200).json({ results });
};