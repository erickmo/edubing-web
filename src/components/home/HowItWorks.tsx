/** A single "how it works" step. */
interface Step {
  no: string;
  title: string;
  desc: string;
}

/** The three onboarding steps (Bahasa Indonesia). */
const STEPS: Step[] = [
  {
    no: "01",
    title: "Daftar akun",
    desc: "Buat akun Edubing gratis dalam hitungan detik — cukup email dan nama.",
  },
  {
    no: "02",
    title: "Pilih event atau konten",
    desc: "Telusuri kelas online, workshop, dan kompetisi. Pilih yang paling kamu suka.",
  },
  {
    no: "03",
    title: "Belajar & ikut event",
    desc: "Mulai belajar dan hadir di event. Materi tetap bisa kamu akses kapan saja.",
  },
];

/**
 * HowItWorks — three numbered, playful steps explaining the journey from
 * sign-up to learning. Big display numerals carry the visual rhythm.
 */
export function HowItWorks(): JSX.Element {
  return (
    <section id="cara-kerja" className="relative bg-ink py-16 text-cream md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-dots bg-dots opacity-[0.07]"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-cream/30 px-3 py-1 text-sm font-bold text-cream">
            🚀 Cara kerja
          </span>
          <h2 className="mt-5 font-display text-3xl font-black sm:text-4xl">
            Mulai dalam <span className="text-sun">tiga langkah</span>
          </h2>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.no} className="relative">
              <div className="font-display text-7xl font-black text-brand-500/90">
                {step.no}
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-cream">
                {step.title}
              </h3>
              <p className="mt-2 text-cream/70">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
