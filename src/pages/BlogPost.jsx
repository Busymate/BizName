import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO';
import AdSlot from '../components/AdSlot';
import { getPostBySlug } from '../data/blogPosts';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import '../styles/BlogPost.css';

// Parses the lightweight "## Heading" + blank-line-separated paragraphs
// convention used in blogPosts.js into real heading/paragraph blocks.
function renderContent(content) {
  const blocks = content.trim().split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return <h2 key={i}>{trimmed.replace(/^##\s*/, '')}</h2>;
    }
    return <p key={i}>{trimmed}</p>;
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const { session } = useAuth();

  // Powers the Dashboard's "Articles Read" counter — this is the one
  // page both Blog and Business Tips article links land on, so tracking
  // it here covers reading either. Silently skipped for signed-out
  // visitors (there's no per-account counter to attribute it to) and
  // never blocks reading either way — it's a count, not a gate.
  useEffect(() => {
    if (!session || !post) return;
    api.consumeQuota('article_view').catch(() => {
      /* usage tracking is best-effort — never worth surfacing an error over */
    });
  }, [slug, session, post]);

  if (!post) return <Navigate to="/404" replace />;

  return (
    <div className="bn-container bn-blog-post">
      <SEO title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} />

      <div className="bn-breadcrumb">
        <Link to="/">Home</Link> <i className="fa-solid fa-chevron-right" /> <Link to="/blog">Blog</Link> <i className="fa-solid fa-chevron-right" /> <span>{post.title}</span>
      </div>

      <span className="bn-article-cat">{post.category}</span>
      <h1>{post.title}</h1>
      <span className="bn-article-meta">{post.date} · {post.readTime}</span>

      <AdSlot type="banner" label="Advertisement" />

      <div className="bn-blog-post-thumb">
        {post.image ? <img src={post.image} alt={post.title} /> : <i className="fa-solid fa-newspaper" />}
      </div>

      <div className="bn-blog-post-content">
        {renderContent(post.content)}
      </div>

      <Link to="/blog" className="bn-back-link"><i className="fa-solid fa-arrow-left" /> Back to Blog</Link>
    </div>
  );
}
