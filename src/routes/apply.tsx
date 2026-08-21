import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { RTOS, SERVICES, getService, rupees } from "@/lib/services";

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>): { service?: string } => {
    const service = typeof search.service === "string" ? search.service : undefined;
    return service ? { service } : {};
  },
  head: () => ({
    meta: [
      { title: "Apply — Guided Transport Application | Parivahan Sewa 2.0" },
      {
        name: "description",
        content:
          "A three-step guided application with inline real-time validation, live fee calculation and a real saved record in your account.",
      },
      { property: "og:title", content: "Apply — Guided Transport Application" },
      {
        property: "og:description",
        content:
          "Pick any transport service and complete it in three accessible steps with inline validation.",
      },
    ],
  }),
  component: ApplyPage,
});

const STEPS = ["Identity", "Service & RTO", "Review & pay"] as const;

type Form = {
  name: string;
  mobile: string;
  dl: string;
  state: string;
  rto: string;
  vehicle: string;
};

const EMPTY: Form = { name: "", mobile: "", dl: "", state: "", rto: "", vehicle: "" };

function ApplyPage() {
  const { service: serviceKey } = Route.useSearch();
  const navigate = useNavigate();
  const service = getService(serviceKey);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [reference, setReference] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    enabled: Boolean(sessionQuery.data),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, state, rto")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setForm((f) => ({
      ...f,
      name: f.name || p.full_name || "",
      mobile: f.mobile || p.phone || "",
      state: f.state || p.state || "",
      rto: f.rto || p.rto || "",
    }));
  }, [profileQuery.data]);

  const validate = (field: keyof Form, value: string, current: Form): string | null => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Enter the name printed on your government ID.";
        if (value.trim().length < 3) return "Name looks too short — use your full name.";
        return null;
      case "mobile":
        if (!/^\d{10}$/.test(value)) return "Enter the 10-digit mobile number linked to Aadhaar.";
        return null;
      case "dl":
        if (!service.needs.licence) return null;
        if (!/^[A-Z]{2}[0-9]{2}\s?[0-9]{4,11}$/i.test(value.trim()))
          return "Format: two letters, two digits, then the number — e.g. MH12 20190001234.";
        return null;
      case "state":
        if (!value) return "Choose your state.";
        return null;
      case "rto":
        if (!value) return "Choose your RTO office.";
        if (current.state && !RTOS[current.state]?.includes(value))
          return "Pick an RTO in the chosen state.";
        return null;
      case "vehicle":
        if (!service.needs.vehicle) return null;
        if (!/^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{1,4}$/i.test(value.trim()))
          return "Enter a registration number like MH 12 AB 1234.";
        return null;
      default:
        return null;
    }
  };

  const errors = useMemo(() => {
    const out: Partial<Record<keyof Form, string>> = {};
    (Object.keys(form) as Array<keyof Form>).forEach((k) => {
      const e = validate(k, form[k], form);
      if (e) out[k] = e;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, service.key]);

  const stepFields: Array<Array<keyof Form>> = [
    ["name", "mobile", ...(service.needs.licence ? (["dl"] as const) : [])],
    ["state", "rto", ...(service.needs.vehicle ? (["vehicle"] as const) : [])],
    [],
  ];
  const currentFields = stepFields[step] ?? [];
  const stepValid = currentFields.every((f) => !errors[f]);

  function set(field: keyof Form, value: string) {
    setForm((f) => ({ ...f, [field]: value, ...(field === "state" ? { rto: "" } : null) }));
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

  const submit = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("SIGN_IN_REQUIRED");
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id: uid,
          service: service.title,
          category: service.category,
          fee_paise: service.feePaise,
          applicant_name: form.name.trim(),
          licence_no: service.needs.licence ? form.dl.trim() : null,
          vehicle_no: service.needs.vehicle ? form.vehicle.trim() : null,
          state: form.state,
          rto: form.rto,
          notes: `Mobile ${form.mobile}`,
          status: "submitted" as const,
        })
        .select("reference_no")
        .single();
      if (error) throw error;
      return data.reference_no;
    },
    onSuccess: (ref) => setReference(ref),
  });

  if (reference) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="surface-card p-8 text-center">
          <p className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal text-2xl text-teal-foreground">
            ✓
          </p>
          <h1 className="mt-5 text-2xl font-semibold">Application submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reference number <strong className="text-foreground">{reference}</strong>. It is saved in
            your account with a full status timeline.
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
                setReference(null);
                setStep(0);
                setTouched({});
                submit.reset();
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
      <h1 className="text-3xl font-semibold">{service.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Official term: {service.jargon}. About {service.minutes} minutes · fee{" "}
        {rupees(service.feePaise)}. Every field validates as you type.
      </p>

      <div className="surface-card mt-6 p-4">
        <label htmlFor="service-picker" className="block text-sm font-semibold">
          Which service do you need?
        </label>
        <p id="service-picker-help" className="mt-1 text-xs text-muted-foreground">
          Switching the service updates the required fields and the fee — the form adapts instead of
          sending you to a different portal.
        </p>
        <select
          id="service-picker"
          aria-describedby="service-picker-help"
          value={service.key}
          onChange={(e) => {
            setStep(0);
            setTouched({});
            void navigate({ to: "/apply", search: { service: e.target.value } });
          }}
          className="tap-target mt-3 w-full rounded-xl border border-input bg-background px-4 text-base"
        >
          {SERVICES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.title} · {rupees(s.feePaise)}
            </option>
          ))}
        </select>
      </div>

      {sessionQuery.data === null && (
        <p role="status" className="surface-card mt-6 border-saffron p-4 text-sm">
          You are browsing as a guest. <strong>Sign in</strong> to save this application and get a
          reference number.{" "}
          <Link to="/auth" className="font-semibold text-teal underline">
            Sign in or create an account
          </Link>
        </p>
      )}

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
            currentFields.forEach((f) => setTouched((t) => ({ ...t, [f]: true })));
            if (stepValid) setStep(step + 1);
            return;
          }
          submit.mutate();
        }}
        noValidate
      >
        {step === 0 && (
          <fieldset className="space-y-6">
            <legend className="font-display text-lg font-semibold">Confirm who you are</legend>
            <Field
              label="Full name as on ID"
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
            {service.needs.licence && (
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
            )}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-6">
            <legend className="font-display text-lg font-semibold">Where you are registered</legend>
            <Field
              label="State"
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
                {Object.keys(RTOS).map((s) => (
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
                  ? `${RTOS[form.state]?.length ?? 0} offices available in ${form.state}.`
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
                {(RTOS[form.state] ?? []).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            {service.needs.vehicle && (
              <Field
                label="Vehicle registration number"
                help="Used to check pending tax or challans. Example: MH 12 AB 1234."
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
            )}
          </fieldset>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-lg font-semibold">Check your details</h2>
            <dl className="mt-4 divide-y divide-border">
              {(
                [
                  ["Service", service.title],
                  ["Name", form.name],
                  ["Mobile", form.mobile],
                  ...(service.needs.licence ? ([["Licence number", form.dl]] as const) : []),
                  ["State", form.state],
                  ["RTO", form.rto],
                  ...(service.needs.vehicle ? ([["Vehicle", form.vehicle]] as const) : []),
                ] as Array<readonly [string, string]>
              ).map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl bg-surface p-4 text-sm text-muted-foreground">
              Fee payable:{" "}
              <strong className="text-foreground">{rupees(service.feePaise)}</strong>. This is a
              prototype — no real payment is taken and no government record is created.
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
            disabled={submit.isPending}
            className="tap-target inline-flex items-center rounded-xl bg-saffron px-6 text-sm font-semibold text-saffron-foreground disabled:opacity-60"
          >
            {step < 2
              ? "Save and continue"
              : submit.isPending
                ? "Submitting…"
                : `Submit and pay ${rupees(service.feePaise)}`}
          </button>
          {!stepValid && currentFields.some((f) => touched[f]) && (
            <p role="alert" className="w-full text-sm font-medium text-destructive">
              Fix the highlighted fields above to continue.
            </p>
          )}
          {submit.isError && (
            <p role="alert" className="w-full text-sm font-medium text-destructive">
              {submit.error instanceof Error && submit.error.message === "SIGN_IN_REQUIRED" ? (
                <>
                  Please{" "}
                  <Link to="/auth" className="underline">
                    sign in
                  </Link>{" "}
                  to submit this application.
                </>
              ) : (
                "Could not submit your application. Please try again."
              )}
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
  children: ReactNode;
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
