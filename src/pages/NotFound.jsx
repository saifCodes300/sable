import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EmptyState } from '../components/ui/EmptyState';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Helmet>
        <title>Page Not Found — SABLE</title>
      </Helmet>
      <EmptyState
        eyebrow="ERROR 404"
        title="The page you are looking for does not exist"
        description="Return to the SABLE atelier homepage or browse our latest seasonal pieces."
        actionLabel="RETURN HOME"
        onAction={() => navigate('/')}
      />
    </div>
  );
}
