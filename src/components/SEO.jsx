import { Helmet } from 'react-helmet-async';
import { APP_VERSION } from '../config/version';

/**
 * Drop this at the top of any page to set per-page meta tags.
 * Usage: <SEO title="Invoice Generator" description="..." schema={{...}} />
 * Pass showVersion for logged-in app pages (Dashboard, etc.) to show the
 * app version in the browser tab, e.g. "BizName Dashboard • v1.2.0".
 */
export default function SEO({ title, description, path = '', schema, showVersion = false }) {
  const fullTitle = showVersion
    ? `BizName ${title} • v${APP_VERSION}`
    : title ? `${title} | BizName` : 'BizName — Free Business Tools';
  const url = `https://bizname.com.ng${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
