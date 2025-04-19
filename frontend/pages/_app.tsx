import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeSwitcher from '../components/theme_switch';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isDashboardPage = router.pathname === '/dashboard';

  return (
    <ThemeProvider>
      <Head>
        {/* Dynamic page-specific metadata that can change between pages */}
        <title>Dodo by Biobankly</title>
        <meta
          name="description"
          content="Dodo is your experimental playground for exploring the UK Biobank dataset. Interact with diverse phenotype views, answer data science questions, and shape the future of Biobankly."
        />
        {/* All static metadata like viewport, favicon, etc. is now in _document.tsx */}
      </Head>
      {/* Theme switcher fixed in top right on all pages except dashboard */}
      {!isDashboardPage && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeSwitcher />
        </div>
      )}
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
