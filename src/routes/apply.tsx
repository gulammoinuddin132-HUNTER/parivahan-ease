import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply — Guided Licence Renewal | Parivahan Sewa 2.0" },
      {
        name: "description",
        content:
          "A three-step guided application with inline real-time validation, plain-language help text and a persistent progress indicator.",
      },
      { property: "og:title", content: "Apply — Guided Licence Renewal | Parivahan Sewa 2.0" },
      {
        property: "og:description",
        content:
          "Multi-step transport application form with accessible inline validation and no full-page reloads.",
      },
    ],
  }),
  component: ApplyPage,
});

const STEPS = ["Identity", "Vehicle & RTO", "Review & pay"] as const;

const STATES: Record<string, string[]> = {
  "Maharashtra": ["MH01 Mumbai Central", "MH12 Pune", "MH20 Aurangabad"],
  "Karnataka": ["KA01 Bengaluru Central", "KA41 Bengaluru North", "KA20 Mangaluru"],
  "West Bengal": ["WB01 Kolkata (Beltala)", "WB02 Kolkata (Kasba)", "WB74 Siliguri"],
  "Delhi": ["DL01 Mall Road", "DL03 Sheikh Sarai", "DL12 Vasant Vihar"],
};

type Form = {
  name: string;
  mobile: string;
  dl: string;
  state: string;
  rto: string;
  vehicle: string;
};

const EMPTY: Form = { name: "", mobile: "", dl: "", state: "", rto: "", vehicle: "" };

function validate(field: keyof Form, value: string, form: Form): string | null {
  switch (field) {
    case "name":
      if (!value.trim()) return "Enter the name printed on your licence.";
      if (value.trim().length < 3) return "Name looks too short — use your full name.";
      return null;
    case "mobile":
      if (!/^\d{10}$/.test(value)) return "Enter the 10-digit mobile number linked to Aadhaar.";
      return null;
    case "dl":
      if (!/^[A-Z]{2}[0-9]{2}\s?[0-9]{4,11}$/i.test(value.trim()))
        return "Format: two letters, two digits, then the number — for example MH12 20190001234.";
      return null;
    case "state":
      if (!value) return "Choose the state that issued your licence.";
      return null;
    case "rto":
      if (!value) return "Choose your RTO office.";
      if (form.state && !STATES[form.state]?.includes(value)) return "Pick an RTO in the chosen state.";
      return null;
    case "vehicle":
      if (!/^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{1,4}$/i.test(value.trim()))
        return "Enter a registration number like MH 12 AB 1234.";
      return null;
    default:
      return null;
  }
}

const STEP_FIELDS: Array<Array<keyof Form>> = [
  ["name", "mobile", "dl"],
  ["state", "rto", "vehicle"],
  [],
];

function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const out: Partial<Record<keyof Form, string>> = {};
    (Object.keys(form) as Array<keyof Form>).forEach((k) => {
      const e = validate(k, form[k], form);
      if (e) out[k] = e;
    });
    return out;
  }, [form]);

  const stepValid = STEP_FIELDS[step].every((f) => !errors[f]);

  function set(field: keyof Form, value: string) {
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === "state" ? { rto: "" } : null),
    }));
  }

  function fieldProps(field: keyof Form) {
    const show = touched[field] && errors[field];
    return {
      id: field,
      "aria-invalid": show ? true : undefined,
      "aria-describedby": `${field}-help${show ? ` ${field}-error` : ""}`,
      onBlur: () => setTouched((t) => ({ ...t, [field]: true })),
      className: `tap-target w-full rounded-xl border bg-background px-4 text-base ${
        show ? "border-destructive" : touched[field] ? "border-teal" : "border-input"
      }`,
    } as const;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="surface-card p-8 text-center">
          <p className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal text-2xl text-teal-foreground">
            ✓
          </p>
          <h1 className="mt-5 text-2xl font-semibold">Application submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reference number <strong>PS-2026-004512</strong>. Your progress was saved at every step,
            so a payment gateway timeout would never have lost this form.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/track"
              className="tap-target inline-flex items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Track this application
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                setForm(EMPTY);
                setTouched({});
              }}
              className="tap-target inline-flex items-center rounded-xl border border-input bg-card px-6 text-sm font-semibold"
            >
              Start another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Renew my driving licence</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Official term: Form 9 renewal of driving licence. Takes about 8 minutes. You can leave and
        come back — nothing is lost.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Application progress">
        {STEPS.map((label, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className={`surface-card flex items-center gap-3 p-4 ${
                state === "current" ? "border-primary" : ""
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  state === "done"
                    ? "bg-teal text-teal-foreground"
                    : state === "current"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </li>
          );
        })}
      </ol>

      <form
        className="surface-card mt-8 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) {
            STEP_FIELDS[step].forEach((f) => setTouched((t) => ({ ...t, [f]: true })));
            if (stepValid) setStep(step + 1);
            return;
          }
          setSubmitted(true);
        }}
        noValidate
      >
        {step === 0 && (
          <fieldset className="space-y-6">
            <legend className="font-display text-lg font-semibold">Confirm who you are</legend>
            <Field
              label="Full name as on licence"
              help="We match this with your DigiLocker record."
              field="name"
              errors={errors}
              touched={touched}
            >
              <input
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                {...fieldProps("name")}
              />
            </Field>
            <Field
              label="Mobile number"
              help="A 6-digit OTP goes to this number. 10 digits, no country code."
              field="mobile"
              errors={errors}
              touched={touched}
            >
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                {...fieldProps("mobile")}
              />
            </Field>
            <Field
              label="Driving licence number"
              help="Printed on the front of your licence card, top right."
              field="dl"
              errors={errors}
              touched={touched}
            >
              <input
                type="text"
                value={form.dl}
                onChange={(e) => set("dl", e.target.value.toUpperCase())}
                {...fieldProps("dl")}
              />
            </Field>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-6">
            <legend className="font-display text-lg font-semibold">Where you are registered</legend>
            <Field
              label="Issuing state"
              help="Choosing a state loads its RTO list instantly — no page reload."
              field="state"
              errors={errors}
              touched={touched}
            >
              <select
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                {...fieldProps("state")}
              >
                <option value="">Select a state</option>
                {Object.keys(STATES).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="RTO office"
              help={
                form.state
                  ? `${STATES[form.state]?.length ?? 0} offices available in ${form.state}.`
                  : "Select a state first to see nearby offices."
              }
              field="rto"
              errors={errors}
              touched={touched}
            >
              <select
                value={form.rto}
                disabled={!form.state}
                onChange={(e) => set("rto", e.target.value)}
                {...fieldProps("rto")}
              >
                <option value="">Select an RTO</option>
                {(STATES[form.state] ?? []).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Vehicle registration number"
              help="Used only to check pending tax or challans. Example: MH 12 AB 1234."
              field="vehicle"
              errors={errors}
              touched={touched}
            >
              <input
                type="text"
                value={form.vehicle}
                onChange={(e) => set("vehicle", e.target.value.toUpperCase())}
                {...fieldProps("vehicle")}
              />
            </Field>
          </fieldset>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-lg font-semibold">Check your details</h2>
            <dl className="mt-4 divide-y divide-border">
              {(
                [
                  ["Name", form.name],
                  ["Mobile", form.mobile],
                  ["Licence number", form.dl],
                  ["State", form.state],
                  ["RTO", form.rto],
                  ["Vehicle", form.vehicle],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl bg-surface p-4 text-sm text-muted-foreground">
              Fee payable: <strong className="text-foreground">₹ 416</strong> (renewal ₹ 200 + smart
              card ₹ 200 + gateway ₹ 16). If payment fails, this application stays saved as a draft.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="tap-target inline-flex items-center rounded-xl border border-input bg-card px-6 text-sm font-semibold"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            className="tap-target inline-flex items-center rounded-xl bg-saffron px-6 text-sm font-semibold text-saffron-foreground"
          >
            {step < 2 ? "Save and continue" : "Pay ₹ 416 and submit"}
          </button>
          {!stepValid && STEP_FIELDS[step].some((f) => touched[f]) && (
            <p role="alert" className="w-full text-sm font-medium text-destructive">
              Fix the highlighted fields above to continue.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  help,
  field,
  errors,
  touched,
  children,
}: {
  label: string;
  help: string;
  field: keyof Form;
  errors: Partial<Record<keyof Form, string>>;
  touched: Partial<Record<keyof Form, boolean>>;
  children: React.ReactNode;
}) {
  const show = Boolean(touched[field] && errors[field]);
  return (
    <div>
      <label htmlFor={field} className="block text-sm font-semibold">
        {label}
      </label>
      <p id={`${field}-help`} className="mt-1 text-xs text-muted-foreground">
        {help}
      </p>
      <div className="mt-2">{children}</div>
      {show && (
        <p id={`${field}-error`} role="alert" className="mt-2 text-sm font-medium text-destructive">
          {errors[field]}
        </p>
      )}
    </div>
  );
}
