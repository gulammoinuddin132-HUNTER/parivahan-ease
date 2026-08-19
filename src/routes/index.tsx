import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import heroImage from "@/assets/hero-portal.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parivahan Sewa 2.0 — Single-Window Transport Services" },
      {
        name: "description",
        content:
          "Intent-based dashboard concept for Parivahan Sewa: search a service, apply in guided steps, and track applications without page reloads.",
      },
      { property: "og:title", content: "Parivahan Sewa 2.0 — Single-Window Transport Services" },
      {
        property: "og:description",
        content:
          "Intent-based dashboard concept for Parivahan Sewa with inline validation and mobile-first accessible components.",
      },
    ],
  }),
  component: Dashboard,
});

type Service = {
  title: string;
  plain: string;
  jargon: string;
  group: "Licence" | "Vehicle" | "Payments" | "Records";
  minutes: number;
};

const SERVICES: Service[] = [
  {
    title: "Get a learner's licence",
    plain: "First-time driver? Start here and book your test slot.",
    jargon: "Form 2 / LL application under CMVR 1989",
    group: "Licence",
    minutes: 12,
  },
  {
    title: "Renew my driving licence",
    plain: "Your licence is expiring — renew it online with DigiLocker documents.",
    jargon: "Form 9 renewal of DL",
    group: "Licence",
    minutes: 8,
  },
  {
    title: "Transfer vehicle ownership",
    plain: "Bought or sold a vehicle? Move the RC to the new owner.",
    jargon: "Form 29/30 transfer of ownership",
    group: "Vehicle",
    minutes: 15,
  },
  {
    title: "Pay road tax",
    plain: "Pay pending vehicle tax and download the receipt instantly.",
    jargon: "MV tax collection under state MVT Act",
    group: "Payments",
    minutes: 5,
  },
  {
    title: "Book a fitness / PUC appointment",
    plain: "Reserve a slot at your nearest test centre.",
    jargon: "Form 38 fitness certificate appointment",
    group: "Vehicle",
    minutes: 6,
  },
  {
    title: "Get a duplicate RC or licence",
    plain: "Lost your card? Request a replacement copy.",
    jargon: "Form 26 / duplicate issuance",
    group: "Records",
    minutes: 10,
  },
  {
    title: "Add or remove hypothecation",
    plain: "Finished your vehicle loan? Update the financier details.",
    jargon: "Form 35 termination of hypothecation",
    group: "Records",
    minutes: 9,
  },
  {
    title: "Check challans and pay fines",
    plain: "See pending traffic penalties on your vehicle.",
    jargon: "e-Challan reconciliation",
    group: "Payments",
    minutes: 4,
  },
];

const GROUPS = ["All", "Licence", "Vehicle", "Payments", "Records"] as const;

const METRICS = [
  { value: "3 taps", label: "to reach any top-25 service", note: "was 7+ nested hover levels" },
  { value: "0 reloads", label: "state and RTO selection is client-side", note: "was full postback" },
  { value: "48 px", label: "minimum touch target across all inputs", note: "was 24–32 px" },
  { value: "AA", label: "WCAG 2.1 contrast and focus targets", note: "was non-compliant" },
];

function Dashboard() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICES.filter((s) => {
      const inGroup = group === "All" || s.group === group;
      const match =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.plain.toLowerCase().includes(q) ||
        s.jargon.toLowerCase().includes(q);
      return inGroup && match;
    });
  }, [query, group]);

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="inline-flex items-center rounded-full bg-saffron px-3 py-1 text-xs font-semibold text-saffron-foreground">
              Single-window · SPA / PWA concept
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              What do you want to do today?
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/80">
              One intent-based search replaces four tiers of division-wise hover menus. Type in plain
              language — &ldquo;licence expired&rdquo;, &ldquo;sold my bike&rdquo;, &ldquo;pay
              tax&rdquo; — and the right form opens with your DigiLocker documents pre-filled.
            </p>

            <div className="mt-8 rounded-2xl bg-card p-3 text-card-foreground shadow-lift">
              <label htmlFor="service-search" className="sr-only">
                Search transport services
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="service-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. renew licence, transfer ownership, pay tax"
                  className="tap-target w-full rounded-xl border border-input bg-background px-4 text-base placeholder:text-muted-foreground"
                  aria-describedby="search-help"
                />
                <Link
                  to="/apply"
                  className="tap-target inline-flex items-center justify-center rounded-xl bg-saffron px-6 text-sm font-semibold text-saffron-foreground transition-transform hover:-translate-y-0.5"
                >
                  Start an application
                </Link>
              </div>
              <p id="search-help" className="px-1 pt-2 text-xs text-muted-foreground">
                Results filter instantly as you type — no page reload, no CAPTCHA before search.
              </p>
            </div>
          </div>

          <img
            src={heroImage}
            width={1408}
            height={912}
            alt="Illustration of a car, motorcycle, driving licence card and a mobile dashboard for transport services"
            className="w-full rounded-2xl border border-primary-foreground/10 shadow-lift"
          />
        </div>
      </section>

      <section aria-labelledby="services-heading" className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="services-heading" className="text-2xl font-semibold">
              Services grouped by user intent
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Not by government division. Plain-language titles first, the legal form number second.
            </p>
          </div>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                aria-pressed={group === g}
                className={`tap-target rounded-full border px-5 text-sm font-medium transition-colors ${
                  group === g
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <li key={s.title}>
              <Link
                to="/apply"
                className="surface-card group flex h-full flex-col p-5 transition-shadow hover:shadow-lift"
              >
                <span className="inline-flex w-fit rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                  {s.group}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.plain}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Official term: <span className="italic">{s.jargon}</span>
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal">
                  ≈ {s.minutes} min · Continue →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {results.length === 0 && (
          <p role="status" className="surface-card mt-8 p-6 text-sm">
            No service matches &ldquo;{query}&rdquo;. Try words like <em>licence</em>,{" "}
            <em>ownership</em>, <em>tax</em> or <em>challan</em>.
          </p>
        )}
      </section>

      <section aria-labelledby="metrics-heading" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="metrics-heading" className="text-2xl font-semibold">
            What the redesign targets
          </h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((m) => (
              <div key={m.label} className="surface-card p-5">
                <dt className="font-display text-3xl font-bold text-primary">{m.value}</dt>
                <dd className="mt-2 text-sm font-medium">{m.label}</dd>
                <dd className="mt-1 text-xs text-muted-foreground">{m.note}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/redesign"
              className="tap-target inline-flex items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Read the full case study
            </Link>
            <Link
              to="/track"
              className="tap-target inline-flex items-center rounded-xl border border-input bg-card px-6 text-sm font-semibold"
            >
              Track an application
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
