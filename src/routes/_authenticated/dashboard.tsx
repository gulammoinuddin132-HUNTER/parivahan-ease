import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard — Parivahan Sewa 2.0" },
      {
        name: "description",
        content:
          "Your Parivahan Sewa 2.0 dashboard: profile details, submitted applications, live status and the full status timeline.",
      },
      { property: "og:title", content: "My dashboard — Parivahan Sewa 2.0" },
      {
        property: "og:description",
        content: "Track and manage every transport service application from one signed-in view.",
      },
    ],
  }),
  component: DashboardPage,
});

type Status = "draft" | "submitted" | "under_review" | "approved" | "rejected";

const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const SERVICES = [
  { service: "Renew my driving licence", category: "Licence", fee: 40000 },
  { service: "Get a learner's licence", category: "Licence", fee: 15000 },
  { service: "Transfer vehicle ownership", category: "Vehicle", fee: 60000 },
  { service: "Pay road tax", category: "Payments", fee: 120000 },
  { service: "Book a fitness / PUC appointment", category: "Vehicle", fee: 20000 },
  { service: "Get a duplicate RC or licence", category: "Records", fee: 30000 },
];

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, state, rto")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", state: "", rto: "" });
  useEffect(() => {
    const p = profileQuery.data;
    if (p) {
      setProfileForm({
        full_name: p.full_name ?? "",
        phone: p.phone ?? "",
        state: p.state ?? "",
        rto: p.rto ?? "",
      });
    }
  }, [profileQuery.data]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: uid, ...profileForm })
        .select()
        .single();
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const [newApp, setNewApp] = useState({
    service: SERVICES[0]!.service,
    applicant_name: "",
    vehicle_no: "",
    licence_no: "",
    notes: "",
  });

  const createApp = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not signed in");
      const picked = SERVICES.find((s) => s.service === newApp.service)!;
      const { error } = await supabase.from("applications").insert({
        user_id: uid,
        service: picked.service,
        category: picked.category,
        fee_paise: picked.fee,
        applicant_name: newApp.applicant_name || profileForm.full_name || "Applicant",
        vehicle_no: newApp.vehicle_no || null,
        licence_no: newApp.licence_no || null,
        state: profileForm.state || null,
        rto: profileForm.rto || null,
        notes: newApp.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewApp({
        service: SERVICES[0]!.service,
        applicant_name: "",
        vehicle_no: "",
        licence_no: "",
        notes: "",
      });
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const advance = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    void navigate({ to: "/auth" });
  }

  const apps = applicationsQuery.data ?? [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {email || "your account"}.
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="tap-target inline-flex items-center rounded-xl border border-input bg-card px-5 text-sm font-semibold"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total applications
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-primary">{apps.length}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            In progress
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-primary">
            {apps.filter((a) => a.status === "submitted" || a.status === "under_review").length}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fees recorded
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-primary">
            {rupees(apps.reduce((sum, a) => sum + (a.fee_paise ?? 0), 0))}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold">My profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved once, reused to pre-fill every application.
          </p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile.mutate();
            }}
          >
            {(
              [
                ["full_name", "Full name", "text"],
                ["phone", "Mobile number", "tel"],
                ["state", "State", "text"],
                ["rto", "RTO office", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <div key={key}>
                <label htmlFor={`p-${key}`} className="block text-sm font-medium">
                  {label}
                </label>
                <input
                  id={`p-${key}`}
                  type={type}
                  value={profileForm[key]}
                  onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                  className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={saveProfile.isPending}
              className="tap-target w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saveProfile.isPending ? "Saving…" : "Save profile"}
            </button>
            {saveProfile.isSuccess && (
              <p role="status" className="text-sm text-teal">
                Profile saved.
              </p>
            )}
            {saveProfile.isError && (
              <p role="alert" className="text-sm text-destructive">
                Could not save your profile. Please try again.
              </p>
            )}
          </form>
        </div>

        <div>
          <div className="surface-card p-5">
            <h2 className="text-lg font-semibold">Start a new application</h2>
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                createApp.mutate();
              }}
            >
              <div className="sm:col-span-2">
                <label htmlFor="a-service" className="block text-sm font-medium">
                  Service
                </label>
                <select
                  id="a-service"
                  value={newApp.service}
                  onChange={(e) => setNewApp({ ...newApp, service: e.target.value })}
                  className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
                >
                  {SERVICES.map((s) => (
                    <option key={s.service} value={s.service}>
                      {s.service} · {rupees(s.fee)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="a-name" className="block text-sm font-medium">
                  Applicant name
                </label>
                <input
                  id="a-name"
                  type="text"
                  value={newApp.applicant_name}
                  onChange={(e) => setNewApp({ ...newApp, applicant_name: e.target.value })}
                  placeholder={profileForm.full_name || "As printed on your ID"}
                  className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>
              <div>
                <label htmlFor="a-vehicle" className="block text-sm font-medium">
                  Vehicle number (optional)
                </label>
                <input
                  id="a-vehicle"
                  type="text"
                  value={newApp.vehicle_no}
                  onChange={(e) => setNewApp({ ...newApp, vehicle_no: e.target.value.toUpperCase() })}
                  placeholder="MH12AB1234"
                  className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>
              <div>
                <label htmlFor="a-licence" className="block text-sm font-medium">
                  Licence number (optional)
                </label>
                <input
                  id="a-licence"
                  type="text"
                  value={newApp.licence_no}
                  onChange={(e) => setNewApp({ ...newApp, licence_no: e.target.value.toUpperCase() })}
                  placeholder="MH1420110012345"
                  className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>
              <div>
                <label htmlFor="a-notes" className="block text-sm font-medium">
                  Notes (optional)
                </label>
                <input
                  id="a-notes"
                  type="text"
                  value={newApp.notes}
                  onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                  className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={createApp.isPending}
                  className="tap-target w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  {createApp.isPending ? "Submitting…" : "Submit application"}
                </button>
                {createApp.isError && (
                  <p role="alert" className="mt-2 text-sm text-destructive">
                    Could not submit. Please check the fields and try again.
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">My applications</h2>
            {applicationsQuery.isLoading && (
              <p className="mt-3 text-sm text-muted-foreground">Loading your applications…</p>
            )}
            {applicationsQuery.isError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                Could not load your applications.
              </p>
            )}
            {!applicationsQuery.isLoading && apps.length === 0 && (
              <p className="surface-card mt-3 p-5 text-sm text-muted-foreground">
                No applications yet. Submit one above and it will appear here with a reference
                number.
              </p>
            )}
            <ul className="mt-3 space-y-3">
              {apps.map((a) => (
                <li key={a.id} className="surface-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{a.service}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ref {a.reference_no} · {a.category} · {rupees(a.fee_paise ?? 0)}
                      </p>
                    </div>
                    <span className="inline-flex rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                      {STATUS_LABEL[a.status as Status]}
                    </span>
                  </div>
                  {(a.vehicle_no || a.licence_no || a.notes) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[a.vehicle_no, a.licence_no, a.notes].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.status !== "under_review" && a.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => advance.mutate({ id: a.id, status: "under_review" })}
                        className="tap-target rounded-xl border border-input bg-card px-4 text-sm font-medium"
                      >
                        Move to review
                      </button>
                    )}
                    {a.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => advance.mutate({ id: a.id, status: "approved" })}
                        className="tap-target rounded-xl border border-input bg-card px-4 text-sm font-medium"
                      >
                        Mark approved
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove.mutate(a.id)}
                      className="tap-target rounded-xl border border-input bg-card px-4 text-sm font-medium text-destructive"
                    >
                      Withdraw
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
