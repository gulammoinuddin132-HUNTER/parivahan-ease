import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/apply", label: "Apply" },
  { to: "/track", label: "Track status" },
  { to: "/redesign", label: "Case study" },
] as const;

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="gov-stripe h-1 w-full" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-bold"
            aria-hidden="true"
          >
            प
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">Parivahan Sewa 2.0</span>
            <span className="block text-xs text-muted-foreground">
              Redesign prototype · MoRTH concept
            </span>
          </span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex flex-wrap items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="tap-target inline-flex items-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h2 className="font-display text-sm font-semibold">About this prototype</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An academic UI/UX and systems redesign of the Parivahan Sewa e-governance portal. Not an
            official Government of India website.
          </p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Sections</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Standards followed</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>WCAG 2.1 AA contrast &amp; focus</li>
            <li>48×48 px minimum touch targets</li>
            <li>Nielsen&apos;s error prevention heuristics</li>
            <li>Mobile-first token-based components</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This service page does not exist in the prototype.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="tap-target inline-flex items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or return to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="tap-target inline-flex items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="tap-target inline-flex items-center justify-center rounded-lg border border-input bg-card px-5 text-sm font-semibold"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Parivahan Sewa 2.0 — Redesign Prototype" },
      {
        name: "description",
        content:
          "A single-window, mobile-first redesign concept for the Parivahan Sewa transport e-governance portal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
