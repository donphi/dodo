import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeSwitcher from '../components/theme_switch';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      {/* Theme switcher fixed in top right on all pages */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
