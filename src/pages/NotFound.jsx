import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Button from '../components/Button';
import AdSlot from '../components/AdSlot';
import '../styles/NotFound.css';

export default function NotFound() {
  return (
    <div className="bn-container bn-notfound-page">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" />
      <div className="bn-notfound-icon"><i className="fa-solid fa-compass" /></div>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you're looking for doesn't exist or may have been moved.</p>
      <div className="bn-notfound-actions">
        <Button as={Link} to="/" variant="primary" icon="fa-house">Go Home</Button>
        <Button as={Link} to="/tools" variant="outline" icon="fa-toolbox">Browse Tools</Button>
      </div>

      <div style={{ maxWidth: 420, margin: '2rem auto 0' }}>
        <AdSlot type="banner" label="Advertisement" />
      </div>
    </div>
  );
}
