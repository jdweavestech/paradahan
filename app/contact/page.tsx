"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, ChevronDown } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

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
            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Full Name
                  </label>
                  <input type="text" placeholder="Juan Dela Cruz" className="input-base" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Email
                  </label>
                  <input type="email" placeholder="you@email.com" className="input-base" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Subject
                </label>
                <select className="input-base">
                  <option>General Inquiry</option>
                  <option>Report Incorrect Information</option>
                  <option>Partnership</option>
                  <option>Bug Report</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="input-base resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Send Message
              </button>
            </form>
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
