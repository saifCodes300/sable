import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  email: z.string().email('Valid email required.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

export default function Account() {
  const navigate = useNavigate();
  const { user, loading, updateUserProfile, logout } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || user?.savedAddress?.phone || '',
      address: user?.savedAddress?.address || '',
      city: user?.savedAddress?.city || '',
      state: user?.savedAddress?.state || '',
      zip: user?.savedAddress?.zip || '',
      country: user?.savedAddress?.country || 'United States',
    },
  });

  const onSubmit = async (values) => {
    try {
      await updateUserProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || '',
        savedAddress: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          address: values.address?.trim() || '',
          city: values.city?.trim() || '',
          state: values.state?.trim() || '',
          zip: values.zip?.trim() || '',
          country: values.country?.trim() || 'United States',
          phone: values.phone?.trim() || '',
        },
      });
      toast.success('Profile and address saved.');
    } catch (err) {
      toast.error(err?.message || 'Unable to save profile.');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>My Account — SABLE</title>
      </Helmet>

      <div className="bg-sable-beige border-b border-sable-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-sable-black">
                Hello, {user?.firstName}
              </h1>
              <p className="text-sm text-sable-muted mt-1">{user?.email}</p>
            </div>
            <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-btn">
              <Link to="/account" className="text-sable-black border-b border-sable-black pb-1">
                Profile
              </Link>
              <Link to="/orders" className="text-sable-muted hover:text-sable-black pb-1">
                Orders
              </Link>
              <Link to="/wishlist" className="text-sable-muted hover:text-sable-black pb-1">
                Wishlist
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sable-pink-text hover:underline pb-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <section className="border border-sable-border bg-sable-white p-6 sm:p-8 space-y-5">
            <h2 className="font-serif text-2xl text-sable-black pb-3 border-b border-sable-border">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email address"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (212) 555-0194"
                {...register('phone')}
              />
            </div>
          </section>

          <section className="border border-sable-border bg-sable-white p-6 sm:p-8 space-y-5">
            <h2 className="font-serif text-2xl text-sable-black pb-3 border-b border-sable-border">
              Saved Shipping Address
            </h2>
            <Input
              label="Street address"
              placeholder="42 Mercer Street, Apt 5B"
              {...register('address')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City" placeholder="New York" {...register('city')} />
              <Input label="State / Region" placeholder="NY" {...register('state')} />
              <Input label="ZIP / Postal" placeholder="10013" {...register('zip')} />
            </div>
            <Input label="Country" placeholder="United States" {...register('country')} />
          </section>

          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={loading}>
              SAVE CHANGES
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
