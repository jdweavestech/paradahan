"use client";

import { motion } from "framer-motion";
import { Search, MousePointerClick, ParkingSquare } from "lucide-react";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import Reveal from "../shared/Reveal";

const steps = [
  {
    icon: Search,
    title: "Search",
    description:
      "Tell us where you're headed. We'll surface every known parking option nearby.",
  },
  {
    icon: MousePointerClick,
    title: "Choose",
    description:
      "Compare rates, ratings, and space types, then pick the spot that fits.",
  },
  {
    icon: ParkingSquare,
    title: "Park",
    description:
      "Follow the directions straight to the entrance — no more circling the block.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="Three steps between you and a parking spot"
          align="center"
        />

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {/* Animated connector line, desktop only */}
          <div className="pointer-events-none absolute top-9 left-0 right-0 hidden sm:block">
            <svg width="100%" height="2" className="overflow-visible">
              <motion.line
                x1="16%"
                y1="1"
                x2="84%"
                y2="1"
                stroke="#DBEAFE"
                strokeWidth="2"
                strokeDasharray="6 8"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.15}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary text-white shadow-lift">
                  <step.icon size={28} />
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow-soft ring-2 ring-primary-light">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
