import { Helmet } from 'react-helmet-async';

/**
 * Drop this at the top of any page to set per-page meta tags.
 * Usage: <SEO title="Invoice Generator" description="..." schema={{...}} />
 */
export default function SEO({ title, description, path = '', schema }) {
  const fullTitle = title ? `${title} | BizName` : 'BizName — Free Business Tools';
  const url = `https://bizname.example.com${path}`;

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
