import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { MiniCartDrawer } from './MiniCartDrawer';
import { Footer } from './Footer';
import { StylistChatbot } from '../stylist/StylistChatbot';

export function Layout() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);

  return (
    <div className="min-h-screen flex flex-col bg-sable-white text-sable-black">
      <AnnouncementBar />
      <Navbar />
      <MobileMenu />
      <MiniCartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <StylistChatbot />
    </div>
  );
}
