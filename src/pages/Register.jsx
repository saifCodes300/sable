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

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name is required.'),
    lastName: z.string().min(2, 'Last name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const from = location.state?.from?.pathname || '/account';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values) => {
    setAuthError('');
    try {
      const user = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      toast.success(`Welcome to SABLE, ${user.firstName}.`);
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err?.message || 'Unable to create account.');
    }
  };

  return (
    <div className="min-h-[82vh] grid grid-cols-1 lg:grid-cols-2">
      <Helmet>
        <title>Create Account — SABLE</title>
      </Helmet>

      {/* Editorial Left Panel */}
      <div className="hidden lg:flex bg-sable-beige border-r border-sable-border p-14 flex-col justify-between">
        <SableSeal size={60} />
        <div className="max-w-md space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown">
            JOIN THE MAISON
          </p>
          <h1 className="font-serif text-4xl xl:text-5xl leading-tight text-sable-black">
            Private previews, saved tailoring details, seamless checkout.
          </h1>
          <p className="text-sm text-sable-muted leading-relaxed">
            Create a SABLE client profile to manage addresses, track deliveries, and receive early
            access to small-batch capsules.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">
          COMPLIMENTARY 30-DAY RETURNS
        </p>
      </div>

      {/* Form Right Panel */}
      <div className="flex items-center justify-center px-4 sm:px-8 py-14 bg-sable-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown mb-2">
              CREATE ACCOUNT
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-sable-black">Client registration</h2>
            <p className="text-sm text-sable-muted mt-2">
              Already have an account?{' '}
              <Link to="/login" state={location.state} className="text-sable-brown hover:underline">
                Sign in
              </Link>
            </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First name"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@domain.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
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

            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              CREATE ACCOUNT
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
