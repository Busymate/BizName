import AdSlot from './AdSlot';
import '../styles/Auth.css';

// Shared shell for Login/Signup — illustration panel on the left, form
// panel on the right, both inside one rounded card. Original SVG
// illustrations (not stock photos): no licensing risk, crisp at any size,
// matches the BizName brand blue.
export default function AuthLayout({ title, subtitle, children, variant = 'signup', footer }) {
  return (
    <div className="bn-auth-shell">
      <div className="bn-auth-card">
        <div className="bn-auth-illustration" aria-hidden="true">
          <div className="bn-auth-logo">
            <BizNameLogo />
            <span>BizName</span>
          </div>
          <div className="bn-auth-illustration-art">
            {variant === 'signup' ? <SignupIllustration /> : <LoginIllustration />}
          </div>
          <div className="bn-auth-illustration-text">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <div className="bn-auth-panel">
          <div className="bn-auth-form-wrap">{children}</div>
        </div>
      </div>
      {footer && <div className="bn-auth-below">{footer}</div>}

      {/* Kept below the card, never above or beside the form, so it can
          never be mistaken for part of sign-in/sign-up or slow down
          completing it. */}
      <div style={{ width: '100%', maxWidth: 420, margin: '0.5rem auto 0' }}>
        <AdSlot type="banner" label="Advertisement" />
      </div>
    </div>
  );
}

function BizNameLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="var(--bn-primary)" />
      <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">B</text>
    </svg>
  );
}

function SignupIllustration() {
  return (
    <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" className="bn-auth-svg">
      <circle cx="150" cy="130" r="115" fill="var(--bn-primary-soft)" />
      <rect x="105" y="35" width="90" height="170" rx="16" fill="#fff" stroke="var(--bn-primary)" strokeWidth="3" />
      <rect x="118" y="55" width="64" height="40" rx="6" fill="var(--bn-primary-soft)" />
      <circle cx="136" cy="72" r="8" fill="var(--bn-primary)" />
      <rect x="150" y="66" width="26" height="5" rx="2.5" fill="var(--bn-primary)" opacity="0.6" />
      <rect x="150" y="76" width="20" height="5" rx="2.5" fill="var(--bn-primary)" opacity="0.4" />
      <rect x="118" y="105" width="64" height="8" rx="4" fill="var(--bn-border)" />
      <rect x="118" y="120" width="44" height="8" rx="4" fill="var(--bn-border)" />
      <circle cx="150" cy="165" r="16" fill="var(--bn-success)" opacity="0.15" />
      <path d="M142 165 l6 6 l12 -13" stroke="var(--bn-success)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(58,150)">
        <circle r="26" fill="var(--bn-primary)" opacity="0.12" />
        <circle r="20" fill="#fff" stroke="var(--bn-primary)" strokeWidth="2.5" />
        <path d="M-8 2 a8 8 0 0 1 16 0" fill="none" stroke="var(--bn-primary)" strokeWidth="2.5" strokeLinecap="round" />
        <circle r="6" cy="-6" fill="var(--bn-primary)" />
      </g>
      <g transform="translate(228,60)">
        <rect x="-16" y="-16" width="32" height="32" rx="8" fill="#fff" stroke="var(--bn-primary)" strokeWidth="2" />
        <path d="M-7 0 L-2 6 L8 -8" stroke="var(--bn-primary)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx="245" cy="180" r="10" fill="var(--bn-warning)" opacity="0.3" />
      <circle cx="60" cy="60" r="7" fill="var(--bn-primary)" opacity="0.25" />
    </svg>
  );
}

function LoginIllustration() {
  return (
    <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" className="bn-auth-svg">
      <circle cx="150" cy="130" r="115" fill="var(--bn-primary-soft)" />
      <rect x="70" y="140" width="160" height="12" rx="6" fill="var(--bn-primary-dark)" />
      <path d="M85 140 L100 90 L200 90 L215 140 Z" fill="#fff" stroke="var(--bn-primary)" strokeWidth="3" />
      <rect x="112" y="100" width="76" height="30" rx="4" fill="var(--bn-primary-soft)" />
      <g transform="translate(150,155)">
        <rect x="-26" y="-6" width="52" height="42" rx="10" fill="var(--bn-primary)" />
        <path d="M-15 -6 v-14 a15 15 0 0 1 30 0 v14" fill="none" stroke="var(--bn-primary)" strokeWidth="7" />
        <circle r="6" cy="14" fill="#fff" />
      </g>
      <g transform="translate(228,175)">
        <path d="M0 -22 L20 -14 V4 C20 18 10 26 0 30 C-10 26 -20 18 -20 4 V-14 Z" fill="#fff" stroke="var(--bn-primary)" strokeWidth="2.5" />
        <path d="M-7 3 L-2 9 L9 -6" stroke="var(--bn-success)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx="66" cy="70" r="8" fill="var(--bn-primary)" opacity="0.25" />
      <circle cx="60" cy="185" r="6" fill="var(--bn-warning)" opacity="0.3" />
    </svg>
  );
}
