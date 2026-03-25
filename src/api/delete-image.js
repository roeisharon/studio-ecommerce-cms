// api/delete-image.js — Vercel serverless function
// Uses the official Cloudinary SDK for reliable deletion
// Required env vars (no VITE_ prefix — server only):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract public_id from a Cloudinary URL
// https://res.cloudinary.com/cloud/image/upload/v123/deborah-ceramics/abc.jpg
//   → deborah-ceramics/abc
const extractPublicId = (url) => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
};

// Try both resource types since Cloudinary requires the exact one
const deleteAsset = async (publicId, preferredType = 'image') => {
  const types = preferredType === 'video'
    ? ['video', 'image']
    : ['image', 'video'];

  for (const type of types) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: type,
        invalidate: true,
      });
      if (res?.result === 'ok' || res?.result === 'not found') {
        return { ok: true, publicId, type, result: res.result };
      }
    } catch (e) {
      // try next type
    }
  }

  // Final fallback — bulk API
  try {
    const [resImg, resVid] = await Promise.allSettled([
      cloudinary.api.delete_resources([publicId], { resource_type: 'image' }),
      cloudinary.api.delete_resources([publicId], { resource_type: 'video' }),
    ]);
    const anyOk =
      resImg.value?.deleted?.[publicId] === 'deleted' ||
      resVid.value?.deleted?.[publicId] === 'deleted';
    return { ok: anyOk, publicId, type: 'api.delete_resources', result: anyOk ? 'deleted' : 'failed' };
  } catch (e) {
    return { ok: false, publicId, error: e.message };
  }
};

module.exports = async (req, res) => {
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      env: {
        CLOUDINARY_CLOUD_NAME: process.env.VITE_CLOUDINARY_CLOUD_NAME ? `✅ "${process.env.VITE_CLOUDINARY_CLOUD_NAME}"` : '❌ missing',
        CLOUDINARY_API_KEY:    process.env.CLOUDINARY_API_KEY    ? '✅ set' : '❌ missing',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✅ set' : '❌ missing',
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { urls = [] } = req.body || {};
  if (!urls.length) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const results = await Promise.all(
    urls.map((url) => {
      const publicId = extractPublicId(url);
      if (!publicId) return { url, ok: false, error: 'Could not extract public_id' };
      const preferredType = url.includes('/video/') ? 'video' : 'image';
      return deleteAsset(publicId, preferredType);
    })
  );

  return res.status(200).json({ results });
};