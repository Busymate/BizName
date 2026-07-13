import { Link } from 'react-router-dom';
import useFavorites from '../hooks/useFavorites';
import '../styles/ToolCard.css';

export default function ToolCard({ tool, badge }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(tool.slug);
  const iconPrefix = tool.iconPrefix || 'fa-solid';

  return (
    <div className="bn-tool-card" data-aos="fade-up">
      {badge && <span className="bn-tool-badge">{badge}</span>}
      <button
        className={`bn-tool-fav ${fav ? 'is-fav' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(tool.slug);
        }}
        aria-label="Toggle favorite"
        type="button"
      >
        <i className={`fa-${fav ? 'solid' : 'regular'} fa-star`} />
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
