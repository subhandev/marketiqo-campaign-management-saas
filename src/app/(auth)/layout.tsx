import { Check, Quote } from "lucide-react";
import Image from "next/image";

const benefits = [
  "Instant AI insights across all campaigns",
  "Multi-client management in one workspace",
  "Generate client reports in one click",
];

const stats = [
  { value: "2.4×", label: "Avg. ROAS lift" },
  { value: "12hr", label: "Saved per week" },
  { value: "500+", label: "Growth teams" },
];

function BrandPanel() {
  return (
    <aside
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16 text-white"
      style={{
        background:
          "linear-gradient(135deg, #1a0f3c 0%, #1e1145 40%, #0f1a3c 100%)",
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 h-[420px] w-[420px] rounded-full blur-3xl bg-indigo-500/20" />
        <div className="absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full blur-3xl bg-purple-500/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full blur-3xl bg-blue-600/10" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-full shadow-lg"
          style={{
            
            boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.5)",
          }}
        >
          {/* <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} /> */}
          <Image
            src="/branding/logo.svg"
            alt="Marketiqo logo"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
          />
        </div>
        <span className="text-4xl font-semibold tracking-tight">
          Marketiqo
        </span>
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-lg space-y-10">
        {/* Headline */}
        <div className="space-y-5">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1]">
            Turn campaign data into{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              clear decisions
            </span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            AI-powered insights for your marketing campaigns — in seconds, not
            spreadsheets.
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-3.5">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-white/90">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                }}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              <span className="text-[15px]">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Testimonial */}
        <figure className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
          <div
            className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-md"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.5)",
            }}
          >
            <Quote className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <blockquote className="text-[15px] leading-relaxed text-white/85">
            &quot;We replaced three reporting tools and finally see what&apos;s
            actually moving the needle. Our team ships decisions in minutes.&quot;
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold ring-2 ring-white/10">
              MR
            </div>
            <div className="text-sm">
              <div className="font-medium text-white">Maya Rodriguez</div>
              <div className="text-white/55">Head of Growth, Northwind</div>
            </div>
          </figcaption>
        </figure>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <div
                className="text-2xl font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-white/55">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="relative z-10 flex items-center gap-3 text-sm text-white/60">
        <div className="flex -space-x-2">
          {[
            "from-indigo-400 to-purple-500",
            "from-cyan-400 to-blue-500",
            "from-fuchsia-400 to-pink-500",
          ].map((g, i) => (
            <div
              key={i}
              className={`h-7 w-7 rounded-full bg-gradient-to-br ${g} ring-2`}
              style={{ "--tw-ring-color": "#1a0f3c" } as React.CSSProperties}
            />
          ))}
        </div>
        <span>Trusted by growth teams and marketers</span>
      </div>
    </aside>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen grid lg:grid-cols-2">
      <BrandPanel />
      <div className="relative z-10 flex items-center justify-center bg-[#f8f9fb] p-8 pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
