import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import Layout from './Layout';

// Public pages
import Home          from './pages/Home';
import About         from './pages/About';
import Bowls         from './pages/Bowls';
import Vases         from './pages/Vases';
import Mugs          from './pages/Mugs';
import Plates        from './pages/Plates';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Blog          from './pages/Blog';
import BlogPost      from './pages/BlogPost';
import CustomOrder   from './pages/CustomOrder';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutFailed  from './pages/CheckoutFailed';

// Admin
import AdminLogin      from './pages/AdminLogin';
import AdminDashboard  from './pages/AdminDashboard';
import AdminProducts   from './pages/AdminProducts';
import AdminProductEdit from './pages/AdminProductEdit';
import AdminOrders     from './pages/AdminOrders';
import AdminBlog       from './pages/AdminBlog';
import AdminBlogEdit   from './pages/AdminBlogEdit';
import AdminReviews    from './pages/AdminReviews';

/** Scrolls to top on every route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/** Listens for Konami code globally and redirects to /AdminLogin */
function KonamiListener() {
  useKonamiCode();
  return null;
}

/** Wraps admin routes — unauthenticated users go to home, not login */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <KonamiListener />
            <Routes>
              <Route element={<Layout />}>
                {/* ── Public ── */}
                <Route path="/"               element={<Home />} />
                <Route path="/About"          element={<About />} />
                <Route path="/Bowls"          element={<Bowls />} />
                <Route path="/Vases"          element={<Vases />} />
                <Route path="/Mugs"           element={<Mugs />} />
                <Route path="/Plates"         element={<Plates />} />
                <Route path="/ProductDetail"  element={<ProductDetail />} />
                <Route path="/Cart"           element={<Cart />} />
                <Route path="/Checkout"       element={<Checkout />} />
                <Route path="/Blog"           element={<Blog />} />
                <Route path="/BlogPost"       element={<BlogPost />} />
                <Route path="/CustomOrder"    element={<CustomOrder />} />
                <Route path="/CheckoutSuccess" element={<CheckoutSuccess />} />
                <Route path="/CheckoutFailed"  element={<CheckoutFailed />} />

                {/* ── Auth ── */}
                <Route path="/AdminLogin" element={<AdminLogin />} />

                {/* ── Admin (protected) ── */}
                <Route path="/AdminDashboard"   element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/AdminProducts"    element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                <Route path="/AdminProductEdit" element={<ProtectedRoute><AdminProductEdit /></ProtectedRoute>} />
                <Route path="/AdminOrders"      element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                <Route path="/AdminBlog"        element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
                <Route path="/AdminBlogEdit"    element={<ProtectedRoute><AdminBlogEdit /></ProtectedRoute>} />
                <Route path="/AdminReviews"     element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}