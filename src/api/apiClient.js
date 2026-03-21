/**
 * Firebase-backed API client for Deborah Ceramics.
 * 
 */
import { createFirestoreEntity } from '@/firebase/firestore';
import { uploadFile } from '@/firebase/storage';
import { auth } from '@/firebase/config';
import { loginWithEmail, logout as firebaseLogout } from '@/firebase/auth';

// ─── Entities ────────────────────────────────────────────────────────────────

export const entities = {
  Product:       createFirestoreEntity('products'),
  Blog:          createFirestoreEntity('blog_posts'),
  Order:         createFirestoreEntity('orders'),
  PersonalOrder: createFirestoreEntity('personal_orders'),
  Review:        createFirestoreEntity('reviews'),
};

// ─── Auth ────────────────────────────────────────────────────────────────────

const authModule = {
  isAuthenticated: () => Promise.resolve(!!auth.currentUser),

  me: () => {
    const user = auth.currentUser;
    if (!user) return Promise.resolve(null);
    return Promise.resolve({
      id: user.uid,
      email: user.email,
      full_name: user.displayName || user.email?.split('@')[0] || 'Admin',
      role: 'admin',
    });
  },

  login: (email, password) => loginWithEmail(email, password),

  logout: async () => {
    await firebaseLogout();
    window.location.href = '/';
  },

  redirectToLogin: (returnUrl) => {
    window.location.href = `/AdminLogin?return=${encodeURIComponent(returnUrl || '')}`;
  },
};

// ─── Integrations ────────────────────────────────────────────────────────────

const integrations = {
  Core: {
    UploadFile: ({ file }) => uploadFile({ file }),
    InvokeLLM:     async () => ({ result: '' }),
    SendEmail:     async () => ({ success: true }),
    SendSMS:       async () => ({ success: true }),
    GenerateImage: async () => ({ image_url: '' }),
  },
};

// ─── Exported client ─────────────────────────────────────────────────────────

export const api = {
  entities,
  integrations,
  auth: authModule,
  appLogs: { logUserInApp: async () => {} },
};
