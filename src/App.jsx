import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#FFFFFF',
              color: '#0A0A0A',
              border: '1px solid #0A0A0A',
              borderRadius: '0px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: 'none',
            },
            success: {
              iconTheme: {
                primary: '#7A5230',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#7A2E1D',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  );
}
