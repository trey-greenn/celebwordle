import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useAnalytics } from '@/hooks/useAnalytics';
import { DefaultSeo } from 'next-seo';
import Head from 'next/head';

const defaultSEOConfig = {
  title: "CelebWordle - Celebrity Guessing Game",
  titleTemplate: "%s | CelebWordle",
  defaultTitle: "CelebWordle - Celebrity Guessing Game",
  description: "Challenge yourself with CelebWordle, a daily celebrity guessing game inspired by Wordle. Test your knowledge of celebrities, actors, musicians, and more!",
  canonical: "https://celebwordle.me",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://celebwordle.me',
    siteName: 'CelebWordle',
    title: 'CelebWordle - Celebrity Guessing Game',
    description: 'Challenge yourself with CelebWordle, a daily celebrity guessing game inspired by Wordle.',
    images: [
      {
        url: 'https://celebwordle.me/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CelebWordle',
      },
    ],
  },
  twitter: {
    handle: '@celebwordle',
    site: '@celebwordle',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
};

export default function App({ Component, pageProps }: AppProps) {
  useAnalytics();

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DefaultSeo {...defaultSEOConfig} />
      <Component {...pageProps} />
    </>
  );
}