import { Sparkles, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Templates", href: "#templates" },
      { label: "Integrations", href: "#integrations" },
    ],
    Company: [
      { label: "About Us", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#careers" },
      { label: "Press Kit", href: "#press" },
    ],
    Resources: [
      { label: "Help Center", href: "#help" },
      { label: "Documentation", href: "#docs" },
      { label: "Video Tutorials", href: "#tutorials" },
      { label: "Community", href: "#community" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "GDPR", href: "#gdpr" },
    ],
  }

  return (
    <footer className="bg-gradient-to-b from-background to-muted border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column - Spans 2 columns on large screens */}
          <div className="col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="relative">
                <Sparkles className="h-10 w-10 text-primary transition-transform group-hover:rotate-12" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Soukly
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Empowering Lebanese entrepreneurs to build thriving online businesses. No coding required, just your
              passion and our platform.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map((social, i) => {
                const Icon = social.icon
                return (
                  <Link
                    key={i}
                    href={social.href}
                    className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-bold text-foreground">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Section with Creative Design */}
        <div className="py-12 border-t border-border">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Mail, label: "support@soukly.com", href: "mailto:support@soukly.com" },
              { icon: Phone, label: "+961 1 234 567", href: "tel:+9611234567" },
              { icon: MapPin, label: "Beirut, Lebanon", href: "#" },
            ].map((contact, i) => {
              const Icon = contact.icon
              return (
                <Link
                  key={i}
                  href={contact.href}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {contact.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Soukly. All rights reserved. Made with{" "}
              <span className="text-red-500">♥</span> in Lebanon
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sitemap
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Accessibility
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
