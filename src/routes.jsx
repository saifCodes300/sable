import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './store/authStore';

const Home = lazy(() => import('./pages/Home'));
const Listing = lazy(() => import('./pages/Listing'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Bag = lazy(() => import('./pages/Bag'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
      <span className="font-serif font-black text-2xl tracking-logo text-sable-black animate-pulse">
        SABLE
      </span>
      <span className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
        Loading...
      </span>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/clothing" element={<Listing key="clothing" category="clothing" />} />
          <Route path="/shoes" element={<Listing key="shoes" category="shoes" />} />
          <Route path="/bags" element={<Listing key="bags" category="bags" />} />
          <Route path="/accessories" element={<Listing key="accessories" category="accessories" />} />
          <Route path="/search" element={<Listing key="search" category="search" />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
