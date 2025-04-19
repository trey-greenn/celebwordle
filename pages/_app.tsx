import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useAnalytics } from '@/hooks/useAnalytics'

export default function App({ Component, pageProps }: AppProps) {
  useAnalytics()

  return <Component {...pageProps} />;
}
