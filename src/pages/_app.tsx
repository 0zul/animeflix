import '@styles/globals.css';
import { AppProps } from 'next/app';
import Router from 'next/router';

import ProgressBar from '@badrap/bar-of-progress';

export const progress = new ProgressBar({
  size: 4,
  color: '#C3073F',
  className: 'z-50',
  delay: 100,
});

Router.events.on('routeChangeStart', progress.start);
Router.events.on('routeChangeError', progress.finish);

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
