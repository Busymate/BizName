import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import AdSlot from '../components/AdSlot';
import blogPosts, { blogCategories } from '../data/blogPosts';
import '../styles/Blog.css';

export default function Blog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (query && !`${p.title} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, category]);

  const popular = blogPosts.slice(0, 5);

  return (
    <div className="bn-container bn-blog-page">
      <SEO title="Blog" description="Practical guides, tips, and expert advice to help you start, run and grow your business." path="/blog" />

      <div className="bn-blog-header">
        <h1>BizName <span className="bn-text-accent">Blog</span></h1>
        <p>Practical guides, tips, and expert advice to help you start, run and grow your business.</p>
        <div className="bn-blog-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input type="text" placeholder="Search articles, topics or keywords..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="bn-blog-categories">
        <button className={category === 'All' ? 'active' : ''} onClick={() => setCategory('All')}>All Categories</button>
        {blogCategories.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="bn-blog-layout">
        <div className="bn-blog-main">
          <div className="bn-grid bn-grid-3">
            {filtered.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.slug} className="bn-blog-card" data-aos="fade-up">
                <div className="bn-blog-thumb">
                  {post.image ? <img src={post.image} alt={post.title} /> : <i className="fa-solid fa-newspaper" />}
                </div>
                <span className="bn-article-cat">{post.category}</span>
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
                <span className="bn-article-meta">{post.date} · {post.readTime}</span>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && <p className="bn-blog-empty">No articles matched your search.</p>}
        </div>

        <aside className="bn-blog-sidebar">
          <h4>Popular Posts</h4>
          {popular.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.slug} className="bn-blog-sidebar-item">
              <div className="bn-blog-sidebar-thumb">
                {post.image ? <img src={post.image} alt={post.title} /> : <i className="fa-solid fa-newspaper" />}
              </div>
              <div>
                <p>{post.title}</p>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
          <AdSlot type="sidebar" />
        </aside>
      </div>
    </div>
  );
}
