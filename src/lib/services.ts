export type ServiceKey =
  | "learner-licence"
  | "renew-licence"
  | "transfer-ownership"
  | "road-tax"
  | "fitness-puc"
  | "duplicate-rc"
  | "hypothecation"
  | "challan";

export type ServiceCategory = "Licence" | "Vehicle" | "Payments" | "Records";

export type ServiceDef = {
  key: ServiceKey;
  title: string;
  plain: string;
  jargon: string;
  category: ServiceCategory;
  minutes: number;
  feePaise: number;
  /** Fields the guided form should collect for this service. */
  needs: { licence: boolean; vehicle: boolean };
};

export const SERVICES: ServiceDef[] = [
  {
    key: "learner-licence",
    title: "Get a learner's licence",
    plain: "First-time driver? Start here and book your test slot.",
    jargon: "Form 2 / LL application under CMVR 1989",
    category: "Licence",
    minutes: 12,
    feePaise: 15000,
    needs: { licence: false, vehicle: false },
  },
  {
    key: "renew-licence",
    title: "Renew my driving licence",
    plain: "Your licence is expiring — renew it online with DigiLocker documents.",
    jargon: "Form 9 renewal of DL",
    category: "Licence",
    minutes: 8,
    feePaise: 41600,
    needs: { licence: true, vehicle: false },
  },
  {
    key: "transfer-ownership",
    title: "Transfer vehicle ownership",
    plain: "Bought or sold a vehicle? Move the RC to the new owner.",
    jargon: "Form 29/30 transfer of ownership",
    category: "Vehicle",
    minutes: 15,
    feePaise: 60000,
    needs: { licence: false, vehicle: true },
  },
  {
    key: "road-tax",
    title: "Pay road tax",
    plain: "Pay pending vehicle tax and download the receipt instantly.",
    jargon: "MV tax collection under state MVT Act",
    category: "Payments",
    minutes: 5,
    feePaise: 120000,
    needs: { licence: false, vehicle: true },
  },
  {
    key: "fitness-puc",
    title: "Book a fitness / PUC appointment",
    plain: "Reserve a slot at your nearest test centre.",
    jargon: "Form 38 fitness certificate appointment",
    category: "Vehicle",
    minutes: 6,
    feePaise: 20000,
    needs: { licence: false, vehicle: true },
  },
  {
    key: "duplicate-rc",
    title: "Get a duplicate RC or licence",
    plain: "Lost your card? Request a replacement copy.",
    jargon: "Form 26 / duplicate issuance",
    category: "Records",
    minutes: 10,
    feePaise: 30000,
    needs: { licence: true, vehicle: true },
  },
  {
    key: "hypothecation",
    title: "Add or remove hypothecation",
    plain: "Finished your vehicle loan? Update the financier details.",
    jargon: "Form 35 termination of hypothecation",
    category: "Records",
    minutes: 9,
    feePaise: 25000,
    needs: { licence: false, vehicle: true },
  },
  {
    key: "challan",
    title: "Check challans and pay fines",
    plain: "See pending traffic penalties on your vehicle.",
    jargon: "e-Challan reconciliation",
    category: "Payments",
    minutes: 4,
    feePaise: 50000,
    needs: { licence: false, vehicle: true },
  },
];

export const SERVICE_KEYS = SERVICES.map((s) => s.key);

export function getService(key: string | undefined): ServiceDef {
  return SERVICES.find((s) => s.key === key) ?? SERVICES[1]!;
}

export const RTOS: Record<string, string[]> = {
  Maharashtra: ["MH01 Mumbai Central", "MH12 Pune", "MH20 Aurangabad"],
  Karnataka: ["KA01 Bengaluru Central", "KA41 Bengaluru North", "KA20 Mangaluru"],
  "West Bengal": ["WB01 Kolkata (Beltala)", "WB02 Kolkata (Kasba)", "WB74 Siliguri"],
  Delhi: ["DL01 Mall Road", "DL03 Sheikh Sarai", "DL12 Vasant Vihar"],
  "Uttar Pradesh": ["UP16 Noida", "UP32 Lucknow", "UP78 Kanpur"],
  "Tamil Nadu": ["TN01 Chennai Central", "TN09 Coimbatore", "TN45 Tiruchirappalli"],
};

export function rupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export const STATUS_STAGE = {
  draft: 0,
  submitted: 1,
  under_review: 2,
  approved: 4,
  rejected: 2,
} as const;

export const STAGES = ["Draft saved", "Submitted", "Documents verified", "RTO approval", "Issued"];
