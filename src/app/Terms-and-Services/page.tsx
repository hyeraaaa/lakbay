import Link from "next/link"
import { ChevronRight } from "lucide-react"
import Logo from "@/components/navbar/Logo"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Terms and Services - Lakbay",
  description: "Read Lakbay's Terms and Services for our motor vehicle rental platform",
}

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "eligibility", title: "User Eligibility" },
  { id: "services", title: "Use of Services" },
  { id: "account", title: "Account Responsibilities" },
  { id: "booking", title: "Booking and Payments" },
  { id: "vehicle", title: "Vehicle Condition and Liability" },
  { id: "prohibited", title: "Prohibited Activities" },
  { id: "privacy", title: "Data Privacy" },
  { id: "modification", title: "Service Modification and Termination" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "governing", title: "Governing Law" },
  { id: "contact", title: "Contact Us" },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Navbar with Logo only */}
      <header className="sticky top-0 z-50 w-full bg-background border-b border-neutral-200">
        <div className="flex h-14 items-center px-6">
          <Link href="/" aria-label="Lakbay Home">
            <Logo />
          </Link>
        </div>
      </header>
      <header className="border-b border-border bg-gradient-to-br from-card to-background">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Terms and Services</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-3">
            <div className="inline-block">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Legal Documentation
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">Terms and Services</h1>
            <p className="text-lg text-muted-foreground">Lakbay Motor Vehicle Rental Platform</p>
          </div>
          <div className="mt-8 flex items-center gap-6 border-t border-border pt-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Last Updated</p>
              <p className="mt-1 text-sm font-semibold text-foreground">October 2025</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Version</p>
              <p className="mt-1 text-sm font-semibold text-foreground">1.0</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-5">
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Table of Contents</h2>
                <div className="h-1 w-8 bg-primary rounded-full" />
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:translate-x-1"
                  >
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{section.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-4 space-y-10">
            {/* Section 1 */}
            <section id="introduction" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    1
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Welcome to Lakbay, a web-based motor vehicle renting platform that connects renters and vehicle owners
                  in a secure, efficient, and convenient way. By accessing or using our platform, you agree to comply
                  with these Terms and Services. Please read them carefully before using Lakbay.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 2 */}
            <section id="acceptance" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    2
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Acceptance of Terms</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  By creating an account or using Lakbay&apos;s services, you acknowledge that you have read, understood, and
                  agreed to these Terms. If you do not agree, you may not use the platform.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 3 */}
            <section id="eligibility" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    3
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">User Eligibility</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  You must be at least 18 years old and capable of entering into a legally binding agreement to use
                  Lakbay. Verified renters are required to submit valid identification and complete verification before
                  accessing full platform features.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 4 */}
            <section id="services" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    4
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Use of Services</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h3 className="font-semibold text-foreground">For Renters</h3>
                    <p className="mt-2 text-foreground leading-relaxed text-base">
                      You can browse available vehicles, request rentals, and communicate with verified vehicle owners
                      through Lakbay.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h3 className="font-semibold text-foreground">For Vehicle Owners</h3>
                    <p className="mt-2 text-foreground leading-relaxed text-base">
                      You can list vehicles, manage bookings, and communicate with renters through your verified
                      account.
                    </p>
                  </div>
                  <p className="text-foreground leading-relaxed text-base font-medium">
                    All transactions must be conducted only through the Lakbay platform.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 5 */}
            <section id="account" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    5
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Account Responsibilities</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Users are responsible for maintaining the confidentiality of their accounts and passwords. Lakbay is
                  not liable for any unauthorized activity that occurs under your account.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 6 */}
            <section id="booking" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    6
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Booking and Payments</h2>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-foreground leading-relaxed text-base">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>Rental requests are automatically approved based on vehicle availability.</span>
                  </li>
                  <li className="flex gap-3 text-foreground leading-relaxed text-base">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>Payments are processed securely through Lakbay&apos;s integrated payment gateway.</span>
                  </li>
                  <li className="flex gap-3 text-foreground leading-relaxed text-base">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>
                      Cancellations and refunds are subject to Lakbay&apos;s refund policy and applicable renter-owner
                      agreements.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 7 */}
            <section id="vehicle" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    7
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Vehicle Condition and Liability</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Vehicle owners must ensure that their vehicles are safe and in good condition. Renters must return
                  vehicles in the same condition received. Any damage, loss, or violation of traffic laws during the
                  rental period is the renter&apos;s responsibility.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 8 */}
            <section id="prohibited" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    8
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Prohibited Activities</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base font-medium">Users are prohibited from:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-foreground leading-relaxed text-base">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>Using the platform for fraudulent or illegal activities.</span>
                  </li>
                  <li className="flex gap-3 text-foreground leading-relaxed text-base">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>Misrepresenting vehicle or identity information.</span>
                  </li>
                  <li className="flex gap-3 text-foreground leading-relaxed text-base">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>Circumventing Lakbay&apos;s system for private or unrecorded transactions.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 9 */}
            <section id="privacy" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    9
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Data Privacy</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Lakbay values your privacy and ensures that all personal and transaction data are stored and processed
                  in compliance with applicable data protection laws. Refer to our Privacy Policy for more details.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 10 */}
            <section id="modification" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    10
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Service Modification and Termination</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Lakbay reserves the right to modify, suspend, or terminate any part of the service at any time without
                  prior notice, especially in cases of policy violations or misuse.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 11 */}
            <section id="liability" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    11
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Limitation of Liability</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Lakbay acts as a platform intermediary and is not responsible for disputes, damages, or losses arising
                  from user-to-user transactions. Users agree to resolve issues directly with the concerned party.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 12 */}
            <section id="governing" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    12
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Governing Law</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be
                  resolved in the appropriate courts of Batangas City.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 13 */}
            <section id="contact" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    13
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  For questions or concerns regarding these Terms, contact us at:
                </p>
                <div className="rounded-lg bg-muted/50 p-6 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
                    <p className="mt-1 text-foreground font-medium">support@lakbay.com</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Address</p>
                    <p className="mt-1 text-foreground font-medium">Batangas State University - The NEU Lipa Campus</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-16 rounded-lg border border-border bg-muted/30 p-8">
              <p className="text-sm text-foreground leading-relaxed">
                By using Lakbay, you acknowledge that you have read, understood, and agree to these Terms and Services
                in their entirety. If you have any questions or concerns, please contact our support team.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
