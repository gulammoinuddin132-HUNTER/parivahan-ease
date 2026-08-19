import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Applications — Parivahan Sewa 2.0" },
      {
        name: "description",
        content:
          "Personal tracking view concept: every transport application, its stage, pending action and RTO office in one accessible timeline.",
      },
      { property: "og:title", content: "Track Applications — Parivahan Sewa 2.0" },
      {
        property: "og:description",
        content:
          "See every licence and vehicle application, its current stage and what you need to do next.",
      },
    ],
  }),
  component: TrackPage,
});

type App = {
  ref: string;
  service: string;
  rto: string;
  stage: number;
  action: string;
  tone: "wait" | "you" | "done";
};

const STAGES = ["Submitted", "Documents verified", "RTO approval", "Card dispatched"];

const APPS: App[] = [
  {
    ref: "PS-2026-004512",
    service: "Driving licence renewal (Form 9)",
    rto: "MH12 Pune",
    stage: 2,
    action: "Waiting for RTO officer approval — no action needed from you.",
    tone: "wait",
  },
  {
    ref: "PS-2026-004188",
    service: "Transfer of ownership (Form 29/30)",
    rto: "KA01 Bengaluru Central",
    stage: 1,
    action: "Upload the seller's signed Form 29 — due in 4 days.",
    tone: "you",
  },
  {
    ref: "PS-2025-098331",
    service: "Road tax payment",
    rto: "WB01 Kolkata (Beltala)",
    stage: 4,
    action: "Completed. Receipt available for download.",
    tone: "done",
  },
];

const TONES: Record<App["tone"], string> = {
  wait: "bg-accent text-accent-foreground",
  you: "bg-saffron text-saffron-foreground",
  done: "bg-teal text-teal-foreground",
};

function TrackPage() {
  const [open, setOpen] = useState(APPS[0]?.ref ?? "");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Your applications</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        After a DigiLocker or Aadhaar single sign-on, every application appears here with its stage
        and the one thing you need to do next — replacing scattered per-service status lookups.
      </p>

      <ul className="mt-8 space-y-4">
        {APPS.map((app) => {
          const expanded = open === app.ref;
          return (
            <li key={app.ref} className="surface-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(expanded ? "" : app.ref)}
                aria-expanded={expanded}
                className="tap-target flex w-full flex-wrap items-center gap-3 p-5 text-left"
              >
                <span className="flex-1">
                  <span className="block font-display text-base font-semibold">{app.service}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {app.ref} · {app.rto}
                  </span>
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONES[app.tone]}`}>
                  {app.tone === "done"
                    ? "Completed"
                    : app.tone === "you"
                      ? "Action needed"
                      : "In progress"}
                </span>
                <span aria-hidden="true" className="text-muted-foreground">
                  {expanded ? "−" : "+"}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-border p-5">
                  <ol className="grid gap-3 sm:grid-cols-4">
                    {STAGES.map((s, i) => {
                      const done = i < app.stage;
                      return (
                        <li key={s} className="text-sm">
                          <span
                            className={`block h-1.5 rounded-full ${done ? "bg-teal" : "bg-secondary"}`}
                            aria-hidden="true"
                          />
                          <span
                            className={`mt-2 block font-medium ${done ? "" : "text-muted-foreground"}`}
                          >
                            {s}
                          </span>
                          <span className="sr-only">{done ? "completed" : "pending"}</span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="mt-4 rounded-xl bg-surface p-4 text-sm">{app.action}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/apply"
          className="tap-target inline-flex items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Start a new application
        </Link>
        <Link
          to="/redesign"
          className="tap-target inline-flex items-center rounded-xl border border-input bg-card px-6 text-sm font-semibold"
        >
          Why this layout
        </Link>
      </div>
    </div>
  );
}
