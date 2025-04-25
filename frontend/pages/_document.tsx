import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Viewport settings - critical for responsive design */}
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

                {/* Preload favicon */}
                <link rel="preload" href="/favicon.png" as="image" type="image/png" />

                {/* Basic Favicon */}
                <link rel="icon" href="/favicon.png" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://dodo.biobankly.com/" />
                <meta property="og:title" content="Dodo by Biobankly – Explore UK Biobank Phenotypes" />
                <meta
                    property="og:description"
                    content="Dodo is your experimental playground for exploring the UK Biobank dataset. Interact with diverse phenotype views, answer data science questions, and shape the future of Biobankly."
                />
                <meta property="og:image" content="https://dodo.biobankly.com/og-image.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Biobankly logo and platform visualization" />
                <meta property="og:site_name" content="Dodo by Biobankly" />
                <meta property="og:locale" content="en_GB" />
                <meta property="og:locale:alternate" content="en_US" />
                <meta property="og:locale:alternate" content="en_IE" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@biobankly" />
                <meta name="twitter:creator" content="@biobankly" />
                <meta name="twitter:url" content="https://dodo.biobankly.com/" />
                <meta name="twitter:title" content="Dodo by Biobankly – Explore UK Biobank Phenotypes" />
                <meta
                    name="twitter:description"
                    content="Dodo is your experimental playground for exploring the UK Biobank dataset. Interact with diverse phenotype views, answer data science questions, and shape the future of Biobankly."
                />
                <meta name="twitter:image" content="https://dodo.biobankly.com/og-image.png" />
                <meta name="twitter:image:alt" content="Biobankly platform visualization" />

                {/* Minimal PWA metadata */}
                <meta name="apple-mobile-web-app-title" content="Dodo by Biobankly" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
                <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />

                {/* SEO */}
                <link rel="canonical" href="https://dodo.biobankly.com/" />

                {/* Keywords and author */}
                <meta
                    name="keywords"
                    content="biobank, data analysis, UK Biobank, phenotypes, experimental app, medical data, genetic data, data exploration"
                />
                <meta name="author" content="Biobankly" />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "Dodo by Biobankly",
                            "url": "https://dodo.biobankly.com/",
                            "description":
                                "Dodo is your experimental playground for exploring the UK Biobank dataset. Interact with diverse phenotype views, answer data science questions, and shape the future of Biobankly.",
                        }),
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}

{/* Deployment cache bust: OG image fix */}