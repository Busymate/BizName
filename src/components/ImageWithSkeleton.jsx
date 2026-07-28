import { useState } from 'react';

/**
 * Wraps an <img> with a pulsing skeleton that's visible until the image
 * actually finishes loading (or fails) — driven by the real onLoad/
 * onError events, not a fake timeout, so it never shows a skeleton for
 * longer or shorter than the image genuinely takes.
 */
export default function ImageWithSkeleton({ src, alt = '', className = '', imgClassName = '', ...rest }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`bn-img-skeleton-wrap ${className}`}>
      {!loaded && <div className="bn-img-skeleton" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        className={`bn-img-skeleton-img ${loaded ? 'is-loaded' : ''} ${imgClassName}`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        loading="lazy"
        {...rest}
      />
    </div>
  );
}
