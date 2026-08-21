import { useEffect, useState } from "react";

import emblem from "@/assets/ashoka-emblem.png";

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const TIME_FMT = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p
      className="flex items-center gap-2 text-xs font-medium tabular-nums"
      aria-live="off"
      aria-label="Current Indian Standard Time"
    >
      <span className="text-primary-foreground/70">IST</span>
      {now ? (
        <>
          <span>{DATE_FMT.format(now)}</span>
          <span className="font-semibold">{TIME_FMT.format(now)}</span>
        </>
      ) : (
        <span className="text-primary-foreground/60">Loading clock…</span>
      )}
    </p>
  );
}

export function GovBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
        <img
          src={emblem}
          width={28}
          height={28}
          alt="State Emblem of India (Ashoka Lion Capital)"
          className="h-7 w-7 shrink-0 brightness-0 invert"
        />
        <p className="text-xs leading-tight">
          <span className="block font-semibold">भारत सरकार · Government of India</span>
          <span className="block text-primary-foreground/75">
            Ministry of Road Transport &amp; Highways (MoRTH)
          </span>
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-saffron px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-saffron-foreground">
            Demo prototype — not an official application
          </span>
          <LiveClock />
        </div>
      </div>
    </div>
  );
}
