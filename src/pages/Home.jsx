import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import ToolCard from '../components/ToolCard';
import Button from '../components/Button';
import AdSlot from '../components/AdSlot';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import Faq from '../components/Faq';
import { useAuth } from '../context/AuthContext';
import tools, { categories } from '../data/tools';
import templates from '../data/templates';
import { getFeaturedPosts } from '../data/blogPosts';
import '../styles/Home.css';
import '../styles/ImageWithSkeleton.css';
import image from '../assets/section.jpeg';

const POPULAR_SLUGS = ['invoice-generator', 'receipt-generator', 'profit-calculator', 'vat-calculator', 'pricing-calculator'];

// A second, differently-badged set of tools so the "Featured Tools"
// section reads as a distinct rail from "Popular" above it rather than
// a duplicate of the same five cards.
const FEATURED_TOOLS = [
  { slug: 'ad-copy-generator', badge: 'AI' },
  { slug: 'qr-code-generator', badge: 'New' },
  { slug: 'swot-analysis', badge: 'Popular' },
  { slug: 'social-media-post-generator', badge: 'New' },
];

const TEMPLATE_SLUGS = ['modern-invoice-template', 'quotation-template', 'business-plan-template', 'timesheet-template'];

const TESTIMONIALS = [
  {
    name: 'Amaka Obi',
    role: 'Founder, Obi Fabrics',
    quote: 'BizName replaced three separate apps for me. Invoicing and pricing tools alone save me hours every single week.',
    initial: 'A',
  },
  {
    name: 'Daniel Okoye',
    role: 'Owner, Okoye Logistics',
    quote: "The AI assistant helped me price a new delivery route in minutes. It's like having a co-founder on call.",
    initial: 'D',
  },
  {
    name: 'Grace Adeyemi',
    role: 'Creative Director, GA Studio',
    quote: 'Clean templates, no sign-up friction, and everything is genuinely free. My clients think our quotes look really professional now.',
    initial: 'G',
  },
  {
    name: 'Tunde Bakare',
    role: 'Operations Lead, Bakare Foods',
    quote: 'We use the payroll and attendance calculators every pay cycle. Simple, fast, and accurate every time.',
    initial: 'T',
  },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { session } = useAuth();
  const popularTools = POPULAR_SLUGS.map((s) => tools.find((t) => t.slug === s)).filter(Boolean);
  const featuredTools = FEATURED_TOOLS.map(({ slug, badge }) => {
    const tool = tools.find((t) => t.slug === slug);
    return tool ? { tool, badge } : null;
  }).filter(Boolean);
  const featuredTemplates = TEMPLATE_SLUGS.map((s) => templates.find((t) => t.slug === s)).filter(Boolean);
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

      <div className="bn-container" style={{ margin: '1.25rem auto' }}>
        <AdSlot type="banner" />
      </div>

      <section className="bn-hero">
        <div className="bn-container bn-hero-inner">
          <div className="bn-hero-text" data-aos="fade-right">
            <h1>Free <span className="bn-text-accent">Business</span> Tools</h1>
            <p>Everything small businesses need in one place.</p>

            <div className="bn-hero-ctas">
              {session ? (
                <Button as={Link} to="/dashboard" variant="primary" size="lg" className="bn-hero-cta-primary">
                  Go to Dashboard <i className="fa-solid fa-arrow-right" />
                </Button>
              ) : (
                <Button as={Link} to="/signup" variant="primary" size="lg" className="bn-hero-cta-primary">
                  Get Started Free <i className="fa-solid fa-arrow-right" />
                </Button>
              )}
              <Button as={Link} to="/tools" variant="outline" size="lg">
                Explore Tools
              </Button>
            </div>

            <form className="bn-hero-search" onSubmit={handleSearch}>
              <div className="bn-hero-search-field">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search for a tool..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search for a tool"
                />
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>

            <div className="bn-hero-badges">
              <span><i className="fa-solid fa-circle-check" /> 100% Free</span>
              <span><i className="fa-solid fa-bolt" /> Easy to Use</span>
              <span><i className="fa-solid fa-user-slash" /> No Sign Up</span>
            </div>
          </div>
          <div className="bn-hero-visual" data-aos="fade-left">
            <div className="bn-hero-visual-card">
              <ImageWithSkeleton src={image} alt="" imgClassName="bn-hero-visual-img" />
            </div>
          </div>
        </div>
      </section>

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

      <section className="bn-section bn-section-tinted">
        <div className="bn-container">
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
        </div>
      </section>

      <section className="bn-section bn-container">
        <div className="bn-section-head">
          <h2>Featured Tools</h2>
          <Link to="/tools" className="bn-section-link">View all tools <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <div className="bn-grid bn-grid-4">
          {featuredTools.map(({ tool, badge }) => (
            <ToolCard key={tool.slug} tool={tool} badge={badge} />
          ))}
        </div>
      </section>

      <section className="bn-section bn-container">
        <div className="bn-ai-panel" data-aos="fade-up">
          <div className="bn-ai-panel-icon">
            <i className="fa-solid fa-wand-magic-sparkles" />
          </div>
          <div className="bn-ai-panel-text">
            <span className="bn-ai-panel-eyebrow">AI Business Assistant</span>
            <h2>Get instant answers for your business</h2>
            <p>Ask about pricing, cash flow, invoicing or growth strategy and get clear, practical answers in seconds — free, no sign-up required to try it.</p>
            <Button as={Link} to="/ai-assistant" variant="primary" size="lg">
              Chat with the AI Assistant <i className="fa-solid fa-arrow-right" />
            </Button>
          </div>
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

      <section className="bn-section bn-section-tinted">
        <div className="bn-container">
          <div className="bn-section-head">
            <h2>Latest Articles</h2>
            <Link to="/blog" className="bn-section-link">View all articles <i className="fa-solid fa-arrow-right" /></Link>
          </div>
          <div className="bn-grid bn-grid-4">
            {featuredPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.slug} className="bn-article-card" data-aos="fade-up">
                <div className="bn-article-thumb"><ImageWithSkeleton src={post.image} alt="" /></div>
                <span className="bn-article-cat">{post.category}</span>
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
                <span className="bn-article-meta"><i className="fa-regular fa-calendar" /> {post.date} <span className="bn-article-meta-dot">·</span> <i className="fa-regular fa-clock" /> {post.readTime}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bn-section bn-container">
        <div className="bn-section-head">
          <h2>Templates</h2>
          <Link to="/templates" className="bn-section-link">View all templates <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <div className="bn-grid bn-grid-4">
          {featuredTemplates.map((tpl) => (
            <Link to="/templates" key={tpl.slug} className="bn-template-card" data-aos="fade-up">
              <span className="bn-template-badge">Free</span>
              <div className="bn-template-thumb" style={{ background: `${tpl.color}14`, color: tpl.color }}>
                <i className={`fa-solid ${tpl.icon}`} />
              </div>
              <h4>{tpl.name}</h4>
              <p>{tpl.description}</p>
              <span className="bn-template-formats">{tpl.formats.join(' · ')}</span>
              <span className="bn-template-download">
                <i className="fa-solid fa-download" /> Get Template
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bn-section bn-section-tinted">
        <div className="bn-container">
          <div className="bn-section-head">
            <h2>What Business Owners Say</h2>
          </div>
          <div className="bn-testimonial-scroller">
            {TESTIMONIALS.map((t) => (
              <div className="bn-testimonial-card" key={t.name} data-aos="fade-up">
                <i className="fa-solid fa-quote-left bn-testimonial-quote-icon" />
                <p className="bn-testimonial-quote">{t.quote}</p>
                <div className="bn-testimonial-author">
                  <span className="bn-testimonial-avatar">{t.initial}</span>
                  <span className="bn-testimonial-author-text">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bn-section bn-container">
        <div className="bn-section-head">
          <h2>Frequently Asked Questions</h2>
        </div>
        <Faq />
      </section>
    </>
  );
}
