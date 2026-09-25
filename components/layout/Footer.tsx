import Link from "next/link";
import { Facebook, Instagram, Twitter, SquareParking } from "lucide-react";
import Container from "../shared/Container";
import NewsletterForm from "./NewsletterForm";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Search Parking", href: "/search" },
      { label: "Add Parking", href: "/add-parking" },
      { label: "Cities", href: "/cities" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log In", href: "/login" },
      { label: "Sign Up", href: "/signup" },
      { label: "My Saved Spots", href: "/saved" },
      { label: "My Contributions", href: "/contributions" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/contact#faq" },
      { label: "Report an Issue", href: "/contact?subject=bug" },
      { label: "Community Guidelines", href: "/terms#community-guidelines" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-dark text-white/70">
      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <SquareParking size={20} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Paradahan
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            The community-driven way to find, share, and trust parking
            information across the Philippines.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social media link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-primary hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-sm font-semibold text-white">Newsletter</h4>
          <p className="mt-4 text-sm text-white/50">
            Get updates on new cities and features.
          </p>
          <NewsletterForm />
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-white/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Paradahan. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/70">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white/70">
              Terms
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
