import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import ToolCard from '../components/ToolCard';
import Button from '../components/Button';
import AdSlot from '../components/AdSlot';
import tools, { categories } from '../data/tools';
import { getFeaturedPosts } from '../data/blogPosts';
import '../styles/Home.css';
import image from '../assets/section.jpeg'
import article from '../assets/article.jpeg'

const POPULAR_SLUGS = ['invoice-generator', 'receipt-generator', 'profit-calculator', 'vat-calculator', 'pricing-calculator'];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const popularTools = POPULAR_SLUGS.map((s) => tools.find((t) => t.slug === s)).filter(Boolean);
  const featuredPosts = getFeaturedPosts().slice(0, 4);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/tools${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  const categoryIcons = {
    'Financial Tools': 'dollar-sign',
    'Invoice & Documents': 'file-lines',
    'Marketing Tools': 'bullhorn',
    'QR & Barcode Tools': 'qrcode',
    Templates: 'file',
  };

  return (
    <>
      <SEO
        title={null}
        description="Free Business Tools — Everything small businesses need in one place. Invoices, calculators, templates and more, 100% free, no sign-up."
        path="/"
      />

      <section className="bn-hero">
        <div className="bn-container bn-hero-inner">
          <div className="bn-hero-text" data-aos="fade-right">
            <h1>Free <span className="bn-text-accent">Business</span> Tools</h1>
            <p>Everything small businesses need in one place.</p>
            <form className="bn-hero-search" onSubmit={handleSearch}>
              <div className="bn-hero-search-field">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search for a tool..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary">Search</Button>
            </form>
            <div className="bn-hero-badges">
              <span><i className="fa-solid fa-circle-check" /> 100% Free</span>
              <span><i className="fa-solid fa-bolt" /> Easy to Use</span>
              <span><i className="fa-solid fa-user-slash" /> No Sign Up</span>
            </div>
          </div>
          <div className="bn-hero-visual" data-aos="fade-left">
            <div className="bn-hero-visual-card">
              <img src={image} alt="" />
            </div>
          </div>
        </div>
      </section>

      <div className="bn-container">
        <AdSlot type="banner" />
      </div>

      <section className="bn-section bn-container">
        <div className="bn-section-head">
          <h2>Popular</h2>
          <Link to="/tools" className="bn-section-link">View all tools <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <div className="bn-grid bn-grid-5">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="bn-section bn-container">
        <div className="bn-grid bn-grid-5 bn-category-strip">
          {categories.slice(0, 4).map((cat) => (
            <Link key={cat} to={`/tools?category=${encodeURIComponent(cat)}`} className="bn-category-card" data-aos="fade-up">
              <i className={`fa-solid fa-${categoryIcons[cat] || 'layer-group'}`} />
              <h4>{cat}</h4>
              <p>Free tools & resources</p>
            </Link>
          ))}
          <Link to="/templates" className="bn-category-card" data-aos="fade-up">
            <i className="fa-solid fa-file" />
            <h4>Templates</h4>
            <p>Ready-to-use templates</p>
          </Link>
        </div>
      </section>

      <section className="bn-section bn-container">
        <div className="bn-section-head">
          <h2>Business Tips</h2>
          <Link to="/business-tips" className="bn-section-link">View all tips <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <div className="bn-grid bn-grid-4">
          <div className="bn-tip-card bn-tip-blue" data-aos="fade-up">
            <i className="fa-solid fa-rocket" />
            <h4>Boost Your Profit</h4>
            <p>Learn strategies to increase profit and reduce costs.</p>
          </div>
          <div className="bn-tip-card bn-tip-green" data-aos="fade-up">
            <i className="fa-solid fa-people-group" />
            <h4>Manage Cash Flow</h4>
            <p>Tips to keep your business cash flow healthy.</p>
          </div>
          <div className="bn-tip-card bn-tip-purple" data-aos="fade-up">
            <i className="fa-solid fa-shield" />
            <h4>Save on Taxes</h4>
            <p>Understand taxes and save legally on every invoice.</p>
          </div>
          <div className="bn-tip-card bn-tip-orange" data-aos="fade-up">
            <i className="fa-solid fa-bullseye" />
            <h4>Set the Right Price</h4>
            <p>Pricing tips to win clients and grow your business.</p>
          </div>
        </div>
      </section>

      <section className="bn-section bn-container">
        <div className="bn-section-head">
          <h2>Latest Articles</h2>
          <Link to="/blog" className="bn-section-link">View all articles <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <div className="bn-grid bn-grid-4">
          {featuredPosts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.slug} className="bn-article-card" data-aos="fade-up">
              <div className="bn-article-thumb"><img src={post.image} alt="" /></div>
              <span className="bn-article-cat">{post.category}</span>
              <h4>{post.title}</h4>
              <p>{post.excerpt}</p>
              <span className="bn-article-meta">{post.date} · {post.readTime}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
