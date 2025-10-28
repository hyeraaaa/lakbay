import Link from "next/link"
import { ChevronRight } from "lucide-react"
import Logo from "@/components/navbar/Logo"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Privacy Policy - Lakbay",
  description: "Read Lakbay's Privacy Policy for our motor vehicle rental platform",
}

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "data-protection", title: "Data Protection and Security" },
  { id: "sharing-information", title: "Sharing of Information" },
  { id: "cookies", title: "Cookies and Tracking Technologies" },
  { id: "user-rights", title: "User Rights" },
  { id: "data-retention", title: "Data Retention" },
  { id: "third-party-links", title: "Third-Party Links" },
  { id: "updates", title: "Updates to This Policy" },
  { id: "contact-us", title: "Contact Us" },
]

export default function PrivacyPolicy() {
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
                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-3">
            <div className="inline-block">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Legal Documentation
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
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
                <div className="space-y-4">
                  <p className="text-foreground leading-relaxed text-base">
                    Lakbay (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) values your privacy and is committed to protecting your personal
                    information. This Privacy Policy explains how we collect, use, store, and safeguard your data when
                    you use our web-based motor vehicle renting platform.
                  </p>
                  <p className="text-foreground leading-relaxed text-base">
                    By using Lakbay, you agree to the terms described in this Privacy Policy. If you do not agree,
                    please refrain from using our platform.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 2 */}
            <section id="information-we-collect" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    2
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">a. Personal Information</h3>
                    <ul className="mt-3 space-y-3">
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Full name, contact number, email address, and home address</span>
                      </li>
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Valid identification documents (for verification purposes)</span>
                      </li>
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Driver&apos;s license information (for renters)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">b. Account and Transaction Information</h3>
                    <ul className="mt-3 space-y-3">
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Login credentials (username and password)</span>
                      </li>
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Rental history, booking details, and payment information</span>
                      </li>
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Vehicle listing details (for verified owners)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">c. Technical Information</h3>
                    <ul className="mt-3 space-y-3">
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>IP address, browser type, and operating system</span>
                      </li>
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Usage data such as date and time of access</span>
                      </li>
                      <li className="flex gap-3 text-foreground leading-relaxed text-base">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>Location data (if you enable GPS for vehicle tracking or navigation features)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 3 */}
            <section id="how-we-use" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    3
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">How We Use Your Information</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-foreground leading-relaxed text-base font-medium">
                    We use the collected information to:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Create and manage user accounts</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Process bookings, payments, and vehicle transactions</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Verify renter and vehicle owner identities</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Ensure vehicle availability and status tracking</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Send updates, reminders, and notifications</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Improve platform performance and user experience</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Comply with legal obligations and prevent fraudulent activity</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 4 */}
            <section id="data-protection" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    4
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Data Protection and Security</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-foreground leading-relaxed text-base">
                    Lakbay implements security measures to protect your data from unauthorized access, loss, or misuse.
                    These include encryption, secure servers, and limited employee access to personal information.
                  </p>
                  <p className="text-foreground leading-relaxed text-base">
                    While we strive to ensure data protection, no online platform is completely risk-free. Users are
                    encouraged to safeguard their accounts with strong passwords and avoid sharing login credentials.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 5 */}
            <section id="sharing-information" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    5
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Sharing of Information</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-foreground leading-relaxed text-base">
                    We do not sell or rent user data. However, we may share necessary information with:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Payment gateways for processing secure transactions</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Verification partners for identity or license validation</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Law enforcement authorities when required by law or for security investigations</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 6 */}
            <section id="cookies" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    6
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Cookies and Tracking Technologies</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Lakbay uses cookies and similar technologies to enhance user experience, remember preferences, and
                  analyze platform usage. You can modify your browser settings to refuse cookies, but some features may
                  not function properly.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 7 */}
            <section id="user-rights" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    7
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">User Rights</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-foreground leading-relaxed text-base font-medium">You have the right to:</p>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Access and review your personal data</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Request correction of inaccurate information</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Request deletion of your account and associated data</span>
                    </li>
                    <li className="flex gap-3 text-foreground leading-relaxed text-base">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>Withdraw consent for marketing or notifications</span>
                    </li>
                  </ul>
                  <p className="text-foreground leading-relaxed text-base">
                    To exercise these rights, contact us using the details below.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 8 */}
            <section id="data-retention" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    8
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Data Retention</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  We retain personal information only as long as necessary for operational, legal, or security purposes.
                  Once data is no longer needed, it will be securely deleted from our systems.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 9 */}
            <section id="third-party-links" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    9
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Third-Party Links</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Lakbay may contain links to third-party websites or services. We are not responsible for their privacy
                  practices. We encourage users to read the privacy policies of external sites before providing personal
                  data.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 10 */}
            <section id="updates" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    10
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Updates to This Policy</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  Lakbay may update this Privacy Policy periodically to reflect system changes or legal requirements.
                  Updated versions will be posted on our website with the revised date.
                </p>
              </div>
              <div className="mt-8 border-b border-border" />
            </section>

            {/* Section 11 */}
            <section id="contact-us" className="scroll-mt-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    11
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  For questions, concerns, or requests regarding this Privacy Policy, contact us at:
                </p>
                <div className="rounded-lg bg-muted/50 p-6 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
                    <p className="mt-1 text-foreground font-medium">privacy@lakbay.com</p>
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
                By using Lakbay, you acknowledge that you have read, understood, and agree to this Privacy Policy in its
                entirety. If you have any questions or concerns, please contact our support team.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
