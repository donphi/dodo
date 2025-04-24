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
        <title>Dodo by Biobankly LTD</title>
        <meta
          name="description"
          content="Dodo is your experimental playground for exploring the UK Biobank dataset. Interact with diverse phenotype views, answer data science questions, and shape the future of Biobankly."
        />
      </Head>
      {/* Add this wrapper div with appropriate background classes */}
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-safe pr-safe pb-safe pl-safe">
        {!isDashboardPage && (
          <div className="fixed top-4 right-4 z-50">
            <ThemeSwitcher />
          </div>
        )}
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;
