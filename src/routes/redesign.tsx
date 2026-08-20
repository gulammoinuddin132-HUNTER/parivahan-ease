import { createFileRoute, Link } from "@tanstack/react-router";

import beforeAfter from "@/assets/before-after.jpg";
import designTokens from "@/assets/design-tokens.jpg";
import architecture from "@/assets/architecture.jpg";

export const Route = createFileRoute("/redesign")({
  head: () => ({
    meta: [
      { title: "Case Study — Redesigning the Parivahan Sewa Portal" },
      {
        name: "description",
        content:
          "Experiment 3 documentation: usability audit, latency bottlenecks, HCI heuristics breakdown, redesign framework and usability-testing plan for the Parivahan Sewa portal.",
      },
      { property: "og:title", content: "Case Study — Redesigning the Parivahan Sewa Portal" },
      {
        property: "og:description",
        content:
          "Heuristic evaluation, information architecture, design tokens and system architecture for a single-window transport services portal.",
      },
    ],
  }),
  component: CaseStudy,
});

const HEURISTICS = [
  {
    title: "Visibility of system status",
    problem: "Long form submissions gave no progress or queue feedback; users re-submitted.",
    fix: "Step indicator, optimistic status chips, and a reference number issued immediately.",
  },
  {
    title: "Match with the real world",
    problem: "Menus were named after government divisions and legal form numbers.",
    fix: "Intent-first labels (“Renew my driving licence”) with the form number as a subtitle.",
  },
  {
    title: "Error prevention",
    problem: "Validation only after a full page postback; data lost on failure.",
    fix: "Inline field validation, format masks, and locally persisted draft applications.",
  },
  {
    title: "Recognition over recall",
    problem: "State + RTO codes had to be remembered across four nested pages.",
    fix: "Searchable state/RTO selector saved to the signed-in user's profile.",
  },
  {
    title: "Flexibility and efficiency",
    problem: "No difference between first-time and repeat users.",
    fix: "A logged-in dashboard with saved profile, past applications and a status timeline.",
  },
  {
    title: "Accessibility",
    problem: "Low contrast text, 24 px targets, no focus states, no ARIA labelling.",
    fix: "WCAG 2.1 AA tokens, 48 px targets, visible focus rings, labelled ARIA regions.",
  },
];

const LATENCY = [
  { layer: "Legacy render", detail: "Full postback per interaction", value: "1.0–3.0 s" },
  { layer: "Redesign render", detail: "Client-side route + cached data", value: "< 150 ms" },
  { layer: "Vahan / Sarathi read", detail: "Read replica + query cache", value: "~120 ms" },
  { layer: "Write path", detail: "Queued transaction with reference no.", value: "async" },
];

function CaseStudy() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            Experiment 3 · Documentation
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            UI/UX &amp; systems redesign of the Parivahan Sewa e-governance portal
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Parivahan Sewa fronts two of India&apos;s largest transactional databases — Vahan for
            vehicle registration and Sarathi for driving licences. The backend scale is not the
            problem; the front end is. This study documents the usability audit, the interaction and
            architecture redesign, and the empirical validation plan.
          </p>
        </div>
      </section>

      <section aria-labelledby="before-after" className="mx-auto max-w-5xl px-4 py-14">
        <h2 id="before-after" className="text-2xl font-semibold">
          Before and after
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Four tiers of division-wise hover menus collapse into one intent-based search plus grouped
          service cards.
        </p>
        <img
          src={beforeAfter}
          alt="Side-by-side comparison of the cluttered legacy portal layout and the redesigned single-window dashboard"
          className="mt-6 w-full rounded-2xl border border-border shadow-lift"
          loading="lazy"
        />
      </section>

      <section aria-labelledby="heuristics" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 id="heuristics" className="text-2xl font-semibold">
            Heuristic evaluation (Nielsen)
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {HEURISTICS.map((h) => (
              <li key={h.title} className="surface-card p-5">
                <h3 className="text-base font-semibold">{h.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Observed: </span>
                  {h.problem}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Redesign: </span>
                  {h.fix}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="latency" className="mx-auto max-w-5xl px-4 py-14">
        <h2 id="latency" className="text-2xl font-semibold">
          Operational latency budget
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <caption className="sr-only">Latency budget per layer of the redesigned system</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-3 pr-4 font-semibold">
                  Layer
                </th>
                <th scope="col" className="py-3 pr-4 font-semibold">
                  Approach
                </th>
                <th scope="col" className="py-3 font-semibold">
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {LATENCY.map((row) => (
                <tr key={row.layer} className="border-b border-border">
                  <td className="py-3 pr-4 font-medium">{row.layer}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.detail}</td>
                  <td className="py-3 font-semibold text-teal">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <img
          src={architecture}
          alt="Diagram of the proposed architecture: PWA client, API gateway, caching layer and the Vahan and Sarathi databases"
          className="mt-8 w-full rounded-2xl border border-border shadow-lift"
          loading="lazy"
        />
      </section>

      <section aria-labelledby="tokens" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 id="tokens" className="text-2xl font-semibold">
            Design system and tokens
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One token set drives colour, type scale, spacing, radius and elevation across every
            component, so accessibility fixes apply globally.
          </p>
          <img
            src={designTokens}
            alt="Design token sheet showing the colour palette, typography scale and component states"
            className="mt-6 w-full rounded-2xl border border-border shadow-lift"
            loading="lazy"
          />
        </div>
      </section>

      <section aria-labelledby="validation" className="mx-auto max-w-5xl px-4 py-14">
        <h2 id="validation" className="text-2xl font-semibold">
          Empirical validation plan
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="surface-card p-5">
            <h3 className="text-base font-semibold">Task-based testing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Five scripted tasks (renew licence, transfer ownership, pay tax, book fitness slot,
              find a challan) measured on completion rate, time on task and error count.
            </p>
          </div>
          <div className="surface-card p-5">
            <h3 className="text-base font-semibold">Think-aloud protocol</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              12 participants across three literacy/digital-comfort bands, recorded verbalisation of
              expectations at each decision point.
            </p>
          </div>
          <div className="surface-card p-5">
            <h3 className="text-base font-semibold">SUS survey</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Standard 10-item System Usability Scale administered on both the legacy portal and this
              prototype; target score ≥ 80 versus the audited baseline.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="tap-target inline-flex items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Create an account to test the flow
          </Link>
          <Link
            to="/apply"
            className="tap-target inline-flex items-center rounded-xl border border-input bg-card px-6 text-sm font-semibold"
          >
            Open the guided form
          </Link>
        </div>
      </section>
    </>
  );
}
