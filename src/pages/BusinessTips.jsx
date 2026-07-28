import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Button from '../components/Button';
import AdSlot from '../components/AdSlot';
import blogPosts, { blogCategories } from '../data/blogPosts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { askAI } from '../lib/ai';
import '../styles/BusinessTips.css';

// Fallback only — shown if there's no AI-generated tip yet (e.g. nobody's
// triggered generation, or the AI provider is temporarily unavailable).
const FALLBACK_TIPS = [
  { icon: 'chart-line', title: 'Track Your Expenses Regularly', text: 'Know where your money goes every month.' },
  { icon: 'people-group', title: 'Know Your Customers', text: 'Understand their needs and solve their problems.' },
  { icon: 'tag', title: "Don't Compete on Price Alone", text: 'Focus on value, quality and experience.' },
  { icon: 'clipboard-list', title: 'Use Simple Systems and Tools', text: 'Automate and simplify your daily tasks.' },
  { icon: 'sack-dollar', title: 'Reinvest Profits Wisely', text: 'Put your profits back into growth activities.' },
  { icon: 'comments', title: 'Ask for Customer Feedback', text: 'It helps you improve and build trust.' },
];

export default function BusinessTips() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const { session } = useAuth();
  const [aiTips, setAiTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const loadTips = async () => {
    setTipsLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_tips')
        .select('*')
        .is('user_id', null)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      setAiTips(data || []);
    } catch {
      setAiTips([]);
    } finally {
      setTipsLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  const generateTip = async () => {
    if (!session) {
      setGenerateError('Log in (free) to generate a fresh AI tip.');
      return;
    }
    setGenerating(true);
    setGenerateError('');
    try {
      await askAI({ feature: 'business_tips', context: { personalized: false } });
      await loadTips();
    } catch (err) {
      setGenerateError(err.message || 'Could not generate a tip right now — showing existing tips.');
    } finally {
      setGenerating(false);
    }
  };

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (query && !`${p.title} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, category]);

  return (
    <div className="bn-container bn-tips-page">
      <SEO title="Business Tips & Guides" description="Practical advice, strategies, and insights to help you run and grow your business smarter." path="/business-tips" />

      <div className="bn-tips-header">
        <h1>Business <span className="bn-text-accent">Tips &amp; Guides</span></h1>
        <p>Practical advice, strategies, and insights to help you run and grow your business smarter.</p>
        <div className="bn-tips-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input type="text" placeholder="Search tips, guides and articles..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <AdSlot type="banner" label="Advertisement" />

      <div className="bn-blog-categories">
        <button className={category === 'All' ? 'active' : ''} onClick={() => setCategory('All')}>All Categories</button>
        {blogCategories.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <h2 className="bn-tips-subhead">Featured Articles</h2>
      <div className="bn-grid bn-grid-4">
        {filtered.slice(0, 4).map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.slug} className="bn-blog-card" data-aos="fade-up">
            <div className="bn-blog-thumb">{post.image ? <img src={post.image} alt={post.title} /> : <i className="fa-solid fa-newspaper" />}</div>
            <span className="bn-article-cat">{post.category}</span>
            <h4>{post.title}</h4>
            <p>{post.excerpt}</p>
            <span className="bn-article-meta">{post.date} · {post.readTime}</span>
          </Link>
        ))}
      </div>

      <div className="bn-tips-subhead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}><i className="fa-solid fa-wand-magic-sparkles" /> AI Business Tips</h2>
        <Button variant="outline" size="sm" icon="fa-arrows-rotate" onClick={generateTip} disabled={generating}>
          {generating ? 'Generating…' : 'Generate New Tip'}
        </Button>
      </div>
      {generateError && <p className="bn-newsletter-error">{generateError}</p>}
      <div className="bn-grid bn-grid-3">
        {tipsLoading ? (
          <p>Loading tips…</p>
        ) : aiTips.length > 0 ? (
          aiTips.map((tip) => (
            <div className="bn-quick-tip" key={tip.id} data-aos="fade-up">
              <i className="fa-solid fa-wand-magic-sparkles" />
              <h4>{tip.title}</h4>
              <p>{tip.content}</p>
            </div>
          ))
        ) : (
          FALLBACK_TIPS.map((tip) => (
            <div className="bn-quick-tip" key={tip.title} data-aos="fade-up">
              <i className={`fa-solid fa-${tip.icon}`} />
              <h4>{tip.title}</h4>
              <p>{tip.text}</p>
            </div>
          ))
        )}
      </div>

      <h2 className="bn-tips-subhead">All Guides</h2>
      <div className="bn-grid bn-grid-4">
        {filtered.map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.slug} className="bn-blog-card" data-aos="fade-up">
            <div className="bn-blog-thumb">{post.image ? <img src={post.image} alt={post.title} /> : <i className="fa-solid fa-book-open" />}</div>
            <span className="bn-article-cat">{post.category}</span>
            <h4>{post.title}</h4>
            <p>{post.excerpt}</p>
            <span className="bn-article-meta">{post.readTime}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
