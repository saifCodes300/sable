import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SableSeal } from '../components/ui/SableSeal';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/account';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setAuthError('');
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.firstName}.`);
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err?.message || 'Unable to sign in.');
    }
  };

  const fillDemoCredentials = () => {
    setValue('email', 'atelier@sable.co', { shouldValidate: true });
    setValue('password', 'sable2026', { shouldValidate: true });
  };

  return (
    <div className="min-h-[82vh] grid grid-cols-1 lg:grid-cols-2">
      <Helmet>
        <title>Sign In — SABLE</title>
      </Helmet>

      {/* Editorial Left Panel */}
      <div className="hidden lg:flex bg-sable-beige border-r border-sable-border p-14 flex-col justify-between">
        <SableSeal size={60} />
        <div className="max-w-md space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown">
            MEMBER ACCESS
          </p>
          <h1 className="font-serif text-4xl xl:text-5xl leading-tight text-sable-black">
            Quiet luxury, tailored to your wardrobe.
          </h1>
          <p className="text-sm text-sable-muted leading-relaxed">
            Access your order archive, saved shipping details, and private seasonal previews.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">
          MAISON SABLE · NEW YORK · MILAN
        </p>
      </div>

      {/* Form Right Panel */}
      <div className="flex items-center justify-center px-4 sm:px-8 py-14 bg-sable-white">
        <div className="w-full max-w-md space-y-7">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown mb-2">
              SIGN IN
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-sable-black">Welcome back</h2>
            <p className="text-sm text-sable-muted mt-2">
              New to SABLE?{' '}
              <Link
                to="/register"
                state={location.state}
                className="text-sable-brown hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Sign in instructions */}
          <div className="p-3.5 bg-sable-card-beige border border-sable-border flex items-center justify-between gap-3 text-xs text-sable-muted">
            <p>Sign in with your personal account or create a new client profile under any name.</p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              title="Fill demo account"
              className="font-mono text-[10px] uppercase tracking-btn text-sable-brown hover:underline shrink-0 cursor-pointer"
            >
              Demo Fill
            </button>
          </div>

          {authError && (
            <div
              role="alert"
              className="p-3.5 bg-sable-pink border border-sable-pink-text/20 text-xs text-sable-pink-text"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="atelier@sable.co"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-sable-muted hover:text-sable-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              SIGN IN
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
