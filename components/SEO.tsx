import Head from 'next/head';

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  structuredData?: object | null;
};

const SEO = ({
  title = 'Celeb Wordle - Guess the Mystery Celebrity',
  description = 'Engage in Celebrity Wordle, the exciting guessing game where you challenge your knowledge of famous celebrities. Guess the mystery celebrity in a limited number of tries and discover fun facts about your favorite stars. Perfect for fans of pop culture and entertainment, this game offers a thrilling way to test your celebrity knowledge.',
  url = 'https://www.celebritywordle.com/',
  image = '/wordle.png',
  type = 'website',
  structuredData = null,
}: SEOProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

export default SEO;
