import '../styles/globals.css';
import '@nemoprotocol/wallet-kit/style.css';
import '../components/App.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
