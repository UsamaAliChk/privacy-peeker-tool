import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Award,
  Building2,
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Info,
  Leaf,
  LockKeyhole,
  MapPin,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VSME Reporting | Company Information & Sustainability Initiatives" },
      { name: "description", content: "Prepare B1 company information and B2 sustainability initiatives for a VSME sustainability report with section-level confidentiality controls." },
      { property: "og:title", content: "VSME Reporting | Company Information & Sustainability Initiatives" },
      { property: "og:description", content: "A structured VSME reporting form with inherited confidentiality controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompanyInformation,
});

type SectionId = "general" | "subsidiaries" | "certifications" | "properties" | "sustainability";
type Subsidiary = { id: number; name: string; address: string };
type Certification = { id: number; scheme: string; issuer: string; rating: string; date?: Date | undefined };
type Property = { id: number; address: string; coordinates: string };

const initialFields = {
  organization: "SCOPE GROUP AS",
  nace: "",
  revenue: "100000",
  balance: "0",
  employees: "0",
  contactName: "Usama Ali",
  contactEmail: "ua63510@gmail.com",
};

const initialSubsidiaries: Subsidiary[] = [
  { id: 1, name: "XYZ", address: "Village Vero Post office Chakbhoun Teh/Dist Chakwal" },
  { id: 2, name: "ABC", address: "Village Vero Post office Chakbhoun Teh/Dist Chakwal" },
];

function PrivacyControl({
  id,
  master,
  checked,
  onChange,
}: {
  id: SectionId;
  master: boolean;
  checked: boolean;
  onChange: (id: SectionId, checked: boolean) => void;
}) {
  const effective = master || checked;
  return (
    <div className="flex min-h-8 flex-wrap items-center justify-end gap-2">
      {master ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/8 text-primary shadow-none">
              <ShieldCheck className="size-3.5" /> Inherited from card
            </Badge>
          </TooltipTrigger>
          <TooltipContent>The card setting protects this entire section.</TooltipContent>
        </Tooltip>
      ) : (
        <span className={cn("text-xs font-medium", effective ? "text-confidential" : "text-muted-foreground")}>
          {effective ? "Confidential" : "This content is confidential"}
        </span>
      )}
      <Switch
        checked={effective}
        disabled={master}
        onCheckedChange={(value) => onChange(id, value)}
        aria-label={`Set ${id} confidentiality`}
        className="data-[state=checked]:bg-confidential"
      />
    </div>
  );
}

function CurrencyField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex">
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-r-none bg-muted/35" inputMode="decimal" />
        <span className="inline-flex min-w-14 items-center justify-center rounded-r-md border border-l-0 border-input bg-secondary px-3 text-xs font-semibold text-muted-foreground">NOK</span>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description, id, master, checked, onChange }: {
  icon: typeof Building2;
  title: string;
  description?: string;
  id: SectionId;
  master: boolean;
  checked: boolean;
  onChange: (id: SectionId, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/8 text-primary"><Icon className="size-4" /></div>
        <div>
          <h2 className="font-display text-xl leading-none text-foreground">{title}</h2>
          {description && <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{description}</p>}
        </div>
      </div>
      <PrivacyControl id={id} master={master} checked={checked} onChange={onChange} />
    </div>
  );
}

function CompanyInformation() {
  const [expanded, setExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [masterConfidential, setMasterConfidential] = useState(false);
  const [consolidated, setConsolidated] = useState(true);
  const [confidential, setConfidential] = useState<Record<SectionId, boolean>>({ general: false, subsidiaries: false, certifications: false, properties: false });
  const [fields, setFields] = useState(initialFields);
  const [country, setCountry] = useState("norway");
  const [methodology, setMethodology] = useState("period-end");
  const [headcount, setHeadcount] = useState("headcount");
  const [subsidiaries, setSubsidiaries] = useState(initialSubsidiaries);
  const [certifications, setCertifications] = useState<Certification[]>([
    { id: 1, scheme: "ISO 14001:2015 Environmental", issuer: "SGS", rating: "97/100", date: new Date(2026, 7, 31) },
  ]);
  const [properties, setProperties] = useState<Property[]>([
    { id: 1, address: "Statute of Dr. Ambedkar, Gandhidham, Gujarat 370201, India", coordinates: "23.064957, 70.130022" },
  ]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldUseDark);
    setDarkMode(shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    document.documentElement.classList.toggle("dark", nextDarkMode);
    window.localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
  };

  const setSection = (id: SectionId, value: boolean) => {
    setConfidential((current) => ({ ...current, [id]: value }));
    toast.success(`${sectionNames[id]} is now ${value ? "confidential" : "public"}`);
  };
  const setMaster = (value: boolean) => {
    setMasterConfidential(value);
    toast.success(value ? "Entire card marked confidential" : "Card-level confidentiality removed", {
      description: value ? "Every section now inherits this setting." : "Individual section settings are active again.",
    });
  };
  const updateField = (key: keyof typeof initialFields, value: string) => setFields((current) => ({ ...current, [key]: value }));
  const updateSubsidiary = (id: number, key: "name" | "address", value: string) => setSubsidiaries((rows) => rows.map((row) => row.id === id ? { ...row, [key]: value } : row));
  const updateCertification = (id: number, key: keyof Omit<Certification, "id" | "date">, value: string) => setCertifications((rows) => rows.map((row) => row.id === id ? { ...row, [key]: value } : row));
  const updateProperty = (id: number, address: string) => setProperties((rows) => rows.map((row) => row.id === id ? { ...row, address } : row));

  return (
    <TooltipProvider delayDuration={250}>
      <main className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-6 sm:py-10 lg:py-14">
        <div className="mx-auto max-w-5xl space-y-8">
        <article className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-panel">
          <header className="border-b border-border bg-card px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3.5">
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground shadow-sm">B1</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl leading-none sm:text-3xl">Company Information</h1>
                    <Tooltip>
                      <TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="About this module"><Info /></Button></TooltipTrigger>
                      <TooltipContent>Core undertaking and contact information for the VSME report.</TooltipContent>
                    </Tooltip>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse module" : "Expand module"}>
                      {expanded ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-foreground text-background hover:bg-foreground">Not Started</Badge>
                    <Badge variant="secondary" className="border border-primary/15 bg-primary/8 text-primary">Basic Module</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 sm:justify-end sm:text-right">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Current status</p>
                  <p className="mt-1 text-sm font-semibold">Not Started</p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">ReportType: False</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={toggleTheme} aria-label={darkMode ? "Use light theme" : "Use dark theme"}>
                      {darkMode ? <Sun /> : <Moon />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{darkMode ? "Use light theme" : "Use dark theme"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </header>

          {expanded && <>
            <div className="space-y-9 p-5 sm:p-8">
              <div className={cn("flex flex-col justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center", masterConfidential ? "border-confidential-border bg-confidential-wash" : "border-border bg-muted/45")}>
                <div className="flex items-center gap-3">
                  <div className={cn("grid size-9 place-items-center rounded-md", masterConfidential ? "bg-confidential-soft text-confidential" : "bg-card text-muted-foreground")}>
                    <LockKeyhole className="size-4" />
                  </div>
                  <div>
                    <Label htmlFor="master-confidential" className="text-sm font-semibold">Mark entire section as confidential</Label>
                    <p className="mt-1 text-xs text-muted-foreground">This setting overrides every section below.</p>
                  </div>
                </div>
                <Switch id="master-confidential" checked={masterConfidential} onCheckedChange={setMaster} className="data-[state=checked]:bg-confidential" />
              </div>

              <section className={cn("space-y-6", (masterConfidential || confidential.general) && "rounded-md bg-confidential-wash/60 p-4 sm:p-5")}>
                <SectionHeading icon={Building2} title="General Information" description="Legal identity, financial scale, workforce, and reporting contact" id="general" master={masterConfidential} checked={confidential.general} onChange={setSection} />
                <div className="grid gap-x-7 gap-y-5 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="organization">Organization name</Label><Input id="organization" value={fields.organization} onChange={(e) => updateField("organization", e.target.value)} className="bg-muted/35" /></div>
                  <div className="space-y-2"><Label htmlFor="nace">NACE code</Label><Input id="nace" value={fields.nace} onChange={(e) => updateField("nace", e.target.value)} placeholder="Enter code" className="bg-muted/35" /><p className="text-xs text-muted-foreground">European industrial classification code</p></div>
                  <CurrencyField id="revenue" label="Revenue" value={fields.revenue} onChange={(value) => updateField("revenue", value)} />
                  <CurrencyField id="balance" label="Balance sheet total" value={fields.balance} onChange={(value) => updateField("balance", value)} />
                  <div className="space-y-2"><Label htmlFor="employees">Total number of employees</Label><Input id="employees" value={fields.employees} onChange={(e) => updateField("employees", e.target.value)} inputMode="numeric" className="bg-muted/35" /></div>
                  <div className="space-y-2"><Label>Country</Label><Select value={country} onValueChange={setCountry}><SelectTrigger className="w-full bg-muted/35"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="norway">🇳🇴 Norway</SelectItem><SelectItem value="sweden">🇸🇪 Sweden</SelectItem><SelectItem value="denmark">🇩🇰 Denmark</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Employee counting methodology</Label><Select value={methodology} onValueChange={setMethodology}><SelectTrigger className="w-full bg-muted/35"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="period-end">At the end of the reporting period</SelectItem><SelectItem value="average">Average during the reporting period</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Headcount or FTE</Label><Select value={headcount} onValueChange={setHeadcount}><SelectTrigger className="w-full bg-muted/35"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="headcount">Headcount</SelectItem><SelectItem value="fte">Full-time equivalent (FTE)</SelectItem></SelectContent></Select></div>
                </div>
                <div className="border-t border-border pt-5">
                  <h3 className="font-display text-lg">Contact person</h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="contactName">Name of contact person</Label><Input id="contactName" value={fields.contactName} onChange={(e) => updateField("contactName", e.target.value)} className="bg-muted/35" /></div>
                    <div className="space-y-2"><Label htmlFor="contactEmail">Email of contact person</Label><Input id="contactEmail" type="email" value={fields.contactEmail} onChange={(e) => updateField("contactEmail", e.target.value)} className="bg-muted/35" /></div>
                  </div>
                </div>
              </section>

              <div className="flex items-start gap-3 rounded-md border border-primary/15 bg-primary/6 p-4">
                <Switch checked={consolidated} onCheckedChange={setConsolidated} aria-label="Consolidated report" className="mt-0.5 data-[state=checked]:bg-primary" />
                <div><p className="text-sm font-semibold">Consolidated report</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Choose whether the report should be consolidated or individual.</p></div>
              </div>

              <section className={cn("space-y-5", (masterConfidential || confidential.subsidiaries) && "rounded-md bg-confidential-wash/60 p-4 sm:p-5")}>
                <SectionHeading icon={Building2} title="Subsidiaries" description={`${subsidiaries.length} corporate entities included in this report`} id="subsidiaries" master={masterConfidential} checked={confidential.subsidiaries} onChange={setSection} />
                <div className="space-y-3">
                  {subsidiaries.map((row) => <div key={row.id} className="grid gap-3 rounded-md border border-border bg-muted/30 p-4 sm:grid-cols-[minmax(150px,1fr)_minmax(240px,2fr)_36px] sm:items-end">
                    <div className="space-y-2"><Label htmlFor={`sub-name-${row.id}`}>Name of subsidiary</Label><Input id={`sub-name-${row.id}`} value={row.name} onChange={(e) => updateSubsidiary(row.id, "name", e.target.value)} className="bg-card" /></div>
                    <div className="space-y-2"><Label htmlFor={`sub-address-${row.id}`}>Address</Label><Input id={`sub-address-${row.id}`} value={row.address} onChange={(e) => updateSubsidiary(row.id, "address", e.target.value)} className="bg-card" /></div>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-destructive" onClick={() => { setSubsidiaries((rows) => rows.filter((item) => item.id !== row.id)); toast.success("Subsidiary removed"); }} aria-label={`Remove ${row.name}`}><Trash2 /></Button></TooltipTrigger><TooltipContent>Remove subsidiary</TooltipContent></Tooltip>
                  </div>)}
                </div>
                <Button variant="outline" onClick={() => setSubsidiaries((rows) => [...rows, { id: Date.now(), name: "", address: "" }])}><Plus /> Add subsidiary</Button>
              </section>

              <div className="space-y-8 border-t border-border pt-8">
                <section className={cn("space-y-5", (masterConfidential || confidential.certifications) && "rounded-md bg-confidential-wash/60 p-4 sm:p-5")}>
                  <SectionHeading icon={Award} title="Certifications and labeling schemes" description="E.g. ISO 14001, EMAS, EU Ecolabel" id="certifications" master={masterConfidential} checked={confidential.certifications} onChange={setSection} />
                  <div className="space-y-3">
                    {certifications.map((cert, index) => <div key={cert.id} className="rounded-md border border-border bg-muted/30 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{index + 1}</span>
                          <p className="text-xs font-semibold text-muted-foreground">Certification</p>
                        </div>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => { setCertifications((rows) => rows.filter((item) => item.id !== cert.id)); toast.success("Certification removed"); }} aria-label={`Remove certification ${index + 1}`}><Trash2 /></Button></TooltipTrigger><TooltipContent>Remove certification</TooltipContent></Tooltip>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_minmax(160px,1fr)_minmax(150px,1fr)_minmax(120px,0.8fr)] lg:items-end">
                        <div className="space-y-2"><Label>Certification/labeling scheme</Label><Input value={cert.scheme} onChange={(e) => updateCertification(cert.id, "scheme", e.target.value)} className="bg-card" /></div>
                        <div className="space-y-2"><Label>Issuer</Label><Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)} className="bg-card" /></div>
                        <div className="space-y-2"><Label>Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start bg-card font-normal"><CalendarIcon />{cert.date ? format(cert.date, "MMM d, yyyy") : "Pick a date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={cert.date} onSelect={(date) => setCertifications((rows) => rows.map((item) => item.id === cert.id ? { ...item, date } : item))} initialFocus className="pointer-events-auto p-3" /></PopoverContent></Popover></div>
                        <div className="space-y-2"><Label>Rating/score</Label><Input value={cert.rating} onChange={(e) => updateCertification(cert.id, "rating", e.target.value)} className="bg-card" /></div>
                      </div>
                    </div>)}
                  </div>
                  <Button variant="outline" onClick={() => setCertifications((rows) => [...rows, { id: Date.now(), scheme: "", issuer: "", rating: "" }])}><Plus /> Add certification</Button>
                </section>

                <section className={cn("space-y-5", (masterConfidential || confidential.properties) && "rounded-md bg-confidential-wash/60 p-4 sm:p-5")}>
                  <SectionHeading icon={MapPin} title="Properties" description="Addresses and geolocation for owned or operated sites" id="properties" master={masterConfidential} checked={confidential.properties} onChange={setSection} />
                  <div className="space-y-3">
                    {properties.map((property, index) => <div key={property.id} className="rounded-md border border-border bg-muted/30 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{index + 1}</span>
                          <p className="text-xs font-semibold text-muted-foreground">Property</p>
                        </div>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => { setProperties((rows) => rows.filter((item) => item.id !== property.id)); toast.success("Property removed"); }} aria-label={`Remove property ${index + 1}`}><Trash2 /></Button></TooltipTrigger><TooltipContent>Remove property</TooltipContent></Tooltip>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[minmax(240px,2fr)_minmax(180px,1fr)] sm:items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`property-${property.id}`}>Address</Label>
                          <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                            <Input id={`property-${property.id}`} value={property.address} onChange={(e) => updateProperty(property.id, e.target.value)} placeholder="Search the address using Google Maps" className="bg-card pl-9" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Coordinates</Label>
                          <div className="flex h-9 items-center rounded-md border border-border bg-card px-3 font-mono text-[11px] text-muted-foreground">{property.coordinates}</div>
                        </div>
                      </div>
                    </div>)}
                  </div>
                  <Button variant="outline" onClick={() => setProperties((rows) => [...rows, { id: Date.now(), address: "", coordinates: "Coordinates pending" }])}><Plus /> Add property</Button>
                </section>
              </div>
            </div>

            <footer className="flex flex-col gap-4 border-t border-border bg-muted/45 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-xs text-muted-foreground">Last updated by <span className="font-medium text-foreground">Unknown</span>: Never</p>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => toast.success("Draft saved", { description: "Your changes are ready to continue later." })}>Save Draft</Button>
                <Button onClick={() => toast.success("Report submitted", { description: "B1 Company Information has been sent for review." })}><Check /> Submit</Button>
              </div>
            </footer>
          </>}
        </article>

        <SustainabilityInitiatives darkMode={darkMode} onToggleTheme={toggleTheme} />
        </div>
      </main>
    </TooltipProvider>
  );
}

const sectionNames: Record<SectionId, string> = {
  general: "General Information",
  subsidiaries: "Subsidiaries",
  certifications: "Certifications",
  properties: "Properties",
  sustainability: "Sustainability initiatives",
};

const sustainabilityQuestions = [
  { id: "practices", label: "Do you have existing sustainability practices, policies, or future initiatives that address any of the following sustainability issues?" },
  { id: "public", label: "Are they publicly available?" },
  { id: "targets", label: "Do the policies have any targets?" },
] as const;

type SustainabilityAnswer = (typeof sustainabilityQuestions)[number]["id"];

const sustainabilityTopics = [
  { id: "climate", label: "Climate change", description: "Energy use, greenhouse gas emissions, and climate transition planning (B3, C3, C4)." },
  { id: "pollution", label: "Pollution", description: "Emissions to air, water, and soil, plus substances of concern (B4)." },
  { id: "water", label: "Water and marine resources", description: "Water withdrawal, consumption, and impacts on marine resources (B6)." },
  { id: "biodiversity", label: "Biodiversity and ecosystems", description: "Sites in or near biodiversity-sensitive areas and land-use change (B5)." },
  { id: "circular", label: "Circular economy", description: "Resource use, waste generation, and circular economy principles (B7)." },
  { id: "own-workforce", label: "Own workforce", description: "Workforce characteristics, health and safety, and working conditions (B8–B10)." },
  { id: "value-chain", label: "Workers in the value chain", description: "Impacts on workers along the upstream and downstream value chain (C6)." },
  { id: "communities", label: "Affected communities", description: "Impacts on the economic, social, and cultural rights of communities (C6)." },
  { id: "consumers", label: "Consumers and end-users", description: "Impacts on consumers and end-users of products or services (C6)." },
  { id: "conduct", label: "Business conduct", description: "Corruption, bribery, and ethics in business relationships (B11, C8, C9)." },
];

function SustainabilityInitiatives({ darkMode, onToggleTheme }: { darkMode: boolean; onToggleTheme: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const [confidential, setConfidential] = useState(false);
  const [answers, setAnswers] = useState<Record<SustainabilityAnswer, boolean>>({ practices: true, public: true, targets: true });
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => new Set(["climate", "pollution", "water"]));
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const toggleTopic = (id: string) =>
    setSelectedTopics((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-panel">
      <header className="border-b border-border bg-card px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3.5">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground shadow-sm">B2</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl leading-none sm:text-3xl">Sustainability initiatives</h2>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="About this module"><Info /></Button></TooltipTrigger>
                  <TooltipContent>Yes/no disclosure of practices and policies for a more sustainable economy.</TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse module" : "Expand module"}>
                  {expanded ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="bg-foreground text-background hover:bg-foreground">Not Started</Badge>
                <Badge variant="secondary" className="border border-primary/15 bg-primary/8 text-primary">Basic Module</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 sm:justify-end sm:text-right">
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Current status</p>
              <p className="mt-1 text-sm font-semibold">Not Started</p>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">Version: 1</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={onToggleTheme} aria-label={darkMode ? "Use light theme" : "Use dark theme"}>
                  {darkMode ? <Sun /> : <Moon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{darkMode ? "Use light theme" : "Use dark theme"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {expanded && <>
        <div className="space-y-6 p-5 sm:p-8">
          <div className="flex items-start gap-3 rounded-md border border-primary/15 bg-primary/6 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">About sustainability initiatives</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                The Basic Module only requires a yes/no answer on whether you have measures, guidelines, or future initiatives for transitioning to a more sustainable economy. The Comprehensive Module requires that you provide details and a more comprehensive description of these.{" "}
                <a href="https://www.efrag.org" target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-2">Read more about sustainability initiatives here.</a>
              </p>
            </div>
          </div>

          <section className={cn("space-y-5", confidential && "rounded-md bg-confidential-wash/60 p-4 sm:p-5")}>
            <SectionHeading
              icon={Leaf}
              title="Practices, policies, and initiatives"
              description={`${selectedTopics.size} of ${sustainabilityTopics.length} sustainability issues covered`}
              id="sustainability"
              master={false}
              checked={confidential}
              onChange={(_, checked) => setConfidential(checked)}
            />

            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="divide-y divide-border">
                {sustainabilityQuestions.map((question, index) => (
                  <div key={question.id} className={cn("flex items-start gap-4 py-3", index === 0 && "pt-0", index === sustainabilityQuestions.length - 1 && "pb-0")}>
                    <Switch
                      checked={answers[question.id]}
                      onCheckedChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                      aria-label={question.label}
                      className="mt-0.5 data-[state=checked]:bg-primary"
                    />
                    <p className="text-sm leading-6">{question.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {sustainabilityTopics.map((topic) => {
                const selected = selectedTopics.has(topic.id);
                const open = openTopic === topic.id;
                return (
                  <div key={topic.id} className={cn("overflow-hidden rounded-md border border-border bg-muted/30 transition-colors", selected && "border-primary/30 bg-primary/5")}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={selected}
                        onCheckedChange={() => toggleTopic(topic.id)}
                      />
                      <Label htmlFor={`topic-${topic.id}`} className="flex-1 cursor-pointer text-sm font-medium">{topic.label}</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 text-muted-foreground"
                        aria-expanded={open}
                        aria-label={open ? `Hide details for ${topic.label}` : `Show details for ${topic.label}`}
                        onClick={() => setOpenTopic(open ? null : topic.id)}
                      >
                        {open ? <ChevronUp /> : <ChevronRight />}
                      </Button>
                    </div>
                    {open && <p className="border-t border-border px-4 py-3 text-xs leading-5 text-muted-foreground">{topic.description}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-4 border-t border-border bg-muted/45 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-muted-foreground">Last updated by <span className="font-medium text-foreground">Unknown</span>: Never</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => toast.success("Draft saved", { description: "Sustainability initiatives are ready to continue later." })}>Save Draft</Button>
            <Button onClick={() => toast.success("Report submitted", { description: "B2 Sustainability initiatives has been sent for review." })}><Check /> Submit</Button>
          </div>
        </footer>
      </>}
    </article>
  );
}
