"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import { useSession } from "@/hooks/useSession";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/lib/types";

// Lets other pages deep-link a subject, e.g. /contact?subject=bug.
const SUBJECT_ALIASES: Record<string, ContactSubject> = {
  bug: "Bug Report",
  report: "Report Incorrect Information",
  partnership: "Partnership",
};

const faqs = [
  {
    q: "Is Paradahan free to use?",
    a: "Yes. Searching, saving, and adding parking spots is completely free for drivers.",
  },
  {
    q: "How accurate is the parking information?",
    a: "Information comes from the community and is kept current through user reports and reviews. We're always working to improve accuracy.",
  },
  {
    q: "Can I list my own parking lot or business?",
    a: "Business owner tools are coming in a future update. For now, you can add your location as a community contributor.",
  },
  {
    q: "How do I report incorrect information?",
    a: "Open any parking spot's page and tap the Report button — our team reviews every submission.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { user } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<ContactSubject>("General Inquiry");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const alias = new URLSearchParams(window.location.search).get("subject");
    if (alias && SUBJECT_ALIASES[alias]) setSubject(SUBJECT_ALIASES[alias]);
  }, []);

  // Prefill for logged-in users, without clobbering anything already typed.
  useEffect(() => {
    if (!user) return;
    setFullName((v) => v || user.fullName);
    setEmail((v) => v || user.email);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, subject, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors ?? { form: "Something went wrong. Please try again." });
        return;
      }
      setSent(true);
      setMessage("");
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-background pb-24">
      <section className="bg-dark py-20 text-center">
        <Container>
          <Reveal className="mx-auto max-w-xl">
            <span className="eyebrow border border-white/15 bg-white/10 text-white">
              Contact Us
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              We'd love to hear from you
            </h1>
            <p className="mt-4 text-white/60">
              Questions, feedback, or a spot to flag — reach out anytime.
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
        {/* Contact form */}
        <Reveal>
          <div className="card-surface p-8 sm:p-10">
            <h2 className="text-xl font-bold text-ink">Send a message</h2>
            {sent ? (
              <div className="mt-6 rounded-2xl bg-success/10 p-6 text-center">
                <CheckCircle2 size={28} className="mx-auto text-success" />
                <p className="mt-3 text-sm font-semibold text-ink">Message sent — thank you!</p>
                <p className="mt-1 text-sm text-muted">
                  We&apos;ll get back to you at {email} as soon as we can.
                </p>
                <button onClick={() => setSent(false)} className="btn-secondary mt-5">
                  Send another message
                </button>
              </div>
            ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <p className="rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">{errors.form}</p>
              )}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-ink">
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="input-base"
                  />
                  <FieldError message={errors.fullName} />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-ink">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="input-base"
                  />
                  <FieldError message={errors.email} />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold text-ink">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as ContactSubject)}
                  className="input-base"
                >
                  {CONTACT_SUBJECTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <FieldError message={errors.subject} />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-ink">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="input-base resize-none"
                />
                <FieldError message={errors.message} />
              </div>
              {/* Honeypot for bots — hidden from people and screen readers. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
            )}
          </div>
        </Reveal>

        {/* Info + FAQ */}
        <div className="space-y-8">
          <Reveal delay={0.1}>
            <div className="card-surface space-y-5 p-8">
              <ContactRow icon={Mail} label="Email" value="hello@paradahan.ph" />
              <ContactRow icon={Phone} label="Phone" value="+63 2 8123 4567" />
              <ContactRow icon={MapPin} label="Office" value="Makati City, Metro Manila" />
              <div className="flex gap-3 border-t border-border pt-5">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social media link"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div id="faq" className="card-surface p-6">
              <SectionHeading title="Frequently asked" />
              <div className="mt-4 divide-y divide-border">
                {faqs.map((faq, i) => (
                  <div key={faq.q}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-ink">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-muted transition-transform duration-300 ${
                          openFaq === i ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <p className="pb-4 text-sm leading-relaxed text-muted">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-danger">{message}</p>;
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
