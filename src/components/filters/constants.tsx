export const chipBase = "bg-white h-9 px-3 border border-neutral-300 text-neutral-900 hover:bg-gray-50 flex items-center gap-2 rounded-sm";

export const typeOptions = [
  { key: "sedan", label: "Sedan" },
  { key: "suv", label: "SUVs" },
  { key: "truck", label: "Trucks" },
  { key: "van", label: "Vans" },
  { key: "luxury", label: "Luxury" },
  { key: "electric", label: "Electric" },
  { key: "hybrid", label: "Hybrid" },
];

export const yearOptions = Array.from({ length: 11 }, (_, i) => String(new Date().getFullYear() - i));
export const seatOptions = ["2", "4", "5", "7", "8+" ];

export const PRICE_MIN = 0;
export const PRICE_MAX = 10000;
export const PRICE_STEP = 100;

export const CarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="10" width="18" height="5" rx="2" />
    <path d="M5 10l2-3h10l2 3" />
    <circle cx="7" cy="16" r="1.5" />
    <circle cx="17" cy="16" r="1.5" />
  </svg>
);

export const VanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="9" width="13" height="6" rx="2" />
    <path d="M16 11h3l2 2v2h-5z" />
    <circle cx="7" cy="17" r="1.5" />
    <circle cx="18" cy="17" r="1.5" />
  </svg>
);

export const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="10" width="10" height="5" rx="1" />
    <path d="M13 12h4l2 2v1h-6z" />
    <circle cx="7" cy="17" r="1.5" />
    <circle cx="18" cy="17" r="1.5" />
  </svg>
);

export const iconForType = (key: string) => {
  if (key === "electric") return <CarIcon />;
  if (key === "hybrid") return <CarIcon />;
  if (key === "luxury") return <CarIcon />;
  if (key.includes("truck")) return <TruckIcon />;
  if (key.includes("van")) return <VanIcon />;
  return <CarIcon />;
};


