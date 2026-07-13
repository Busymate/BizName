import SEO from '../components/SEO';
import '../styles/About.css';

const STATS = [
  { value: '50+', label: 'Free Business Tools' },
  { value: '200+', label: 'Professional Templates' },
  { value: '10,000+', label: 'Happy Users' },
  { value: '100%', label: 'Free Forever' },
];

export default function About() {
  return (
    <div className="bn-container bn-about-page">
      <SEO title="About Us" description="BizName is an all-in-one platform of free business tools, templates and resources for small businesses, freelancers and entrepreneurs." path="/about" />

      <div className="bn-about-header">
        <h1>About <span className="bn-text-accent">BizName</span></h1>
        <p className="bn-about-lead">Making business easier, faster and smarter.</p>
        <p>
          BizName is an all-in-one platform of free business tools, templates, guides and resources created
          to help small businesses, freelancers and entrepreneurs save time, cut costs and grow with confidence.
        </p>
      </div>

      <div className="bn-feature-strip" data-aos="fade-up">
        <div className="bn-feature-item">
          <span className="icon" style={{ background: '#8b5cf6' }}><i className="fa-solid fa-clock" /></span>
          <div><h4>Save Time</h4><p>Powerful tools that get the job done in seconds.</p></div>
        </div>
        <div className="bn-feature-item">
          <span className="icon" style={{ background: '#16a34a' }}><i className="fa-solid fa-sack-dollar" /></span>
          <div><h4>Save Money</h4><p>100% free tools and templates for your business.</p></div>
        </div>
        <div className="bn-feature-item">
          <span className="icon" style={{ background: '#f59e0b' }}><i className="fa-solid fa-arrow-trend-up" /></span>
          <div><h4>Grow Faster</h4><p>Practical tips and resources to scale your business.</p></div>
        </div>
        <div className="bn-feature-item">
          <span className="icon" style={{ background: '#2563eb' }}><i className="fa-solid fa-shield" /></span>
          <div><h4>Easy to Use</h4><p>Simple, clean and beginner-friendly experience.</p></div>
        </div>
      </div>

      <div className="bn-about-stats" data-aos="fade-up">
        {STATS.map((s) => (
          <div key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bn-grid bn-grid-3 bn-about-cards">
        <div className="bn-card" data-aos="fade-up">
          <h3><i className="fa-solid fa-bullseye" /> Our Mission</h3>
          <p>To empower small businesses, freelancers and entrepreneurs with easy-to-use tools, templates and knowledge that make running a business simple and more efficient.</p>
        </div>
        <div className="bn-card" data-aos="fade-up">
          <h3><i className="fa-solid fa-eye" /> Our Vision</h3>
          <p>To be the world's most trusted platform for free business tools and resources, helping millions of people build successful and sustainable businesses.</p>
        </div>
        <div className="bn-card" data-aos="fade-up">
          <h3><i className="fa-solid fa-people-group" /> Who We Help</h3>
          <ul>
            <li>Small Business Owners</li>
            <li>Freelancers &amp; Solopreneurs</li>
            <li>Startups &amp; Entrepreneurs</li>
            <li>Online Sellers &amp; Creators</li>
          </ul>
        </div>
      </div>

      <div className="bn-about-cta" data-aos="fade-up">
        <div>
          <h3><i className="fa-solid fa-lightbulb" /> We're here to help you succeed!</h3>
          <p>If you have ideas, suggestions or feedback, we'd love to hear from you.</p>
        </div>
      </div>
    </div>
  );
}
