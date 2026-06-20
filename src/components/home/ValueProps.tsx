import { Card, CardContent } from "../ui/Card";

/** Tailwind tint classes per value-prop icon. */
type Tone = "brand" | "teal" | "sun";

/** Icon background + foreground classes per tone. */
const TONE_CLASS: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-600",
  teal: "bg-teal-100 text-teal-600",
  sun: "bg-sun-soft text-ink",
};

/** A single value proposition. `icon` is an emoji glyph for warmth. */
interface ValueItem {
  icon: string;
  title: string;
  desc: string;
  tone: Tone;
}

/** The four core value props (Bahasa Indonesia). */
const VALUE_ITEMS: ValueItem[] = [
  {
    icon: "📚",
    title: "Konten belajar",
    desc: "Materi terstruktur dan kelas online yang bisa diakses kapan saja, di perangkat apa pun.",
    tone: "brand",
  },
  {
    icon: "🎤",
    title: "Event & workshop",
    desc: "Ikuti webinar, workshop, dan kompetisi seru langsung dari satu aplikasi.",
    tone: "teal",
  },
  {
    icon: "💳",
    title: "Pembayaran mudah",
    desc: "Transfer bank, e-wallet, atau kartu — pembayaran aman dengan kursi langsung dikonfirmasi.",
    tone: "sun",
  },
  {
    icon: "🌏",
    title: "Akses di mana saja",
    desc: "Aplikasi web yang ringan, bisa dipasang seperti aplikasi, dan jalan di HP maupun laptop.",
    tone: "brand",
  },
];

/**
 * ValueProps — four cards highlighting why Edubing matters.
 * Each card pairs a tinted emoji badge with a short Bahasa description.
 */
export function ValueProps(): JSX.Element {
  return (
    <section id="tentang" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="sticker shadow-sticker">✨ Kenapa Edubing</span>
        <h2 className="mt-5 font-display text-3xl font-black text-ink sm:text-4xl">
          Semua yang kamu butuh untuk{" "}
          <span className="text-teal-600">bertumbuh</span>
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_ITEMS.map((item) => (
          <Card key={item.title} interactive>
            <CardContent className="p-6">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${TONE_CLASS[item.tone]}`}
                aria-hidden
              >
                {item.icon}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {item.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
