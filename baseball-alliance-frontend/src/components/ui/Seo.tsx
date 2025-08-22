// src/components/Seo.tsx
import { Helmet } from "react-helmet-async";

type SEOProps = {
  title: string;
  description?: string;
  path?: string; // '/pricing'
  canonical?: string; // full URL if you have it
  image?: string; // absolute URL for OG
  noindex?: boolean;
  locale?: string; // 'en_US'
  type?: "website" | "article" | "product";
};

const SITE = "https://baseballalliance.co";

export default function Seo({
  title,
  description,
  path,
  canonical,
  image,
  noindex,
  locale = "en_US",
  type = "website",
}: SEOProps) {
  const url = canonical ?? (path ? `${SITE}${path}` : SITE);
  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={url} />
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content="Your Site Name" />
      <meta property="og:locale" content={locale} />
      {/* Twitter */}
      <meta
        name="twitter:card"
        content={image ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
