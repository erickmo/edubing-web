import { faqLd } from "../../lib/seo/jsonld";
import { FAQ_ITEMS } from "./content";

/**
 * Faq — accessible accordion built on native <details>/<summary>, rendered
 * from the shared FAQ_ITEMS constant.
 *
 * It ALSO emits the FAQPage JSON-LD inline in the body (built from the same
 * FAQ_ITEMS via faqLd), so visible content and structured data are guaranteed
 * to match, and the structured data is present in the prerendered HTML body
 * even before <head> hydration. Home.tsx additionally feeds faqLd(FAQ_ITEMS)
 * into <Seo>'s <head>; both derive from one source.
 */
export function Faq(): JSX.Element {
  const faqJsonLd = JSON.stringify(faqLd(FAQ_ITEMS));

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      {/* Inline FAQPage structured data (mirrors <Seo> head JSON-LD). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd }}
      />

      <div className="text-center">
        <span className="sticker shadow-sticker">💬 Pertanyaan umum</span>
        <h2 className="mt-5 font-display text-3xl font-black text-ink sm:text-4xl">
          Masih penasaran?
        </h2>
        <p className="mt-2 text-ink-soft">
          Jawaban untuk pertanyaan yang paling sering ditanyakan.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border-2 border-ink/10 bg-white px-5 py-1 shadow-soft transition-colors open:border-brand-300"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold text-ink marker:hidden">
              {item.question}
              <span
                aria-hidden
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-5 pr-8 leading-relaxed text-ink-soft">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
