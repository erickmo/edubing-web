import { Head } from "vite-react-ssg";

const SITE_TITLE = "Edubing";
const HERO_HEADING = "Edubing";
const HERO_TAGLINE = "Platform pembelajaran digital terbaik untuk Anda";

export default function Home() {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={HERO_TAGLINE} />
      </Head>
      <main className="min-h-screen bg-white">
        <section className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{HERO_HEADING}</h1>
          <p className="text-xl text-gray-600 max-w-xl">{HERO_TAGLINE}</p>
        </section>
      </main>
    </>
  );
}
