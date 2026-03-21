/**
 * Cloudinary upload helper
 * Uses unsigned uploads — no API secret exposed in the browser.
 * Returns { file_url } to match the original UploadFile interface.
 *
 * Setup:
 *  1. Create a free account at cloudinary.com
 *  2. Dashboard → Settings → Upload → Upload Presets → Add preset
 *     - Signing mode: Unsigned
 *     - Name: ceramics_uploads  (or whatever you set in VITE_CLOUDINARY_UPLOAD_PRESET)
 *  3. Add to .env:
 *     VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *     VITE_CLOUDINARY_UPLOAD_PRESET=ceramics_uploads
 */

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadFile = async ({ file }) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and ' +
      'VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'deborah-ceramics');

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(url, { method: 'POST', body: formData });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Upload failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  return { file_url: data.secure_url };
};
