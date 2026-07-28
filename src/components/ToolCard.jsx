import { Link } from 'react-router-dom';
import useFavoriteTools from '../hooks/useFavoriteTools';
import '../styles/ToolCard.css';

export default function ToolCard({ tool, badge }) {
  const iconPrefix = tool.iconPrefix || 'fa-solid';
  const { isFavorite, toggleFavorite } = useFavoriteTools();
  const favorited = isFavorite(tool.slug);

  return (
    <div className="bn-tool-card" data-aos="fade-up">
      {badge && (
        <span className={`bn-tool-badge bn-tool-badge-${badge.toLowerCase().replace(/\s+/g, '-')}`}>
          {badge}
        </span>
      )}

      <button
        type="button"
        className={`bn-tool-fav ${favorited ? 'is-fav' : ''}`}
        onClick={(e) => { e.preventDefault(); toggleFavorite(tool.slug); }}
        aria-pressed={favorited}
        aria-label={favorited ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <i className={`fa-${favorited ? 'solid' : 'regular'} fa-star`} />
      </button>

      <div className="bn-tool-icon">
        {tool.iconImage ? (
          <img src={tool.iconImage} alt="" />
        ) : (
          <i className={`${iconPrefix} fa-${tool.icon}`} />
        )}
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <Link to={`/${tool.slug}`} className="bn-tool-link">
        Use Tool <i className="fa-solid fa-arrow-right" />
      </Link>
    </div>
  );
}
