"use client";

import { motion } from "framer-motion";
import { Search, MapPinPlus, MessageSquareText, FlagTriangleRight } from "lucide-react";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import Reveal from "../shared/Reveal";

const features = [
  {
    icon: Search,
    title: "Find Parking",
    description:
      "Search by location, landmark, or vehicle type and see real spaces near you in seconds.",
  },
  {
    icon: MapPinPlus,
    title: "Add & Share",
    description:
      "Know a spot that's missing? Add it in minutes and help other drivers find it too.",
  },
  {
    icon: MessageSquareText,
    title: "Read Reviews",
    description:
      "See honest ratings on safety, pricing, and space before you even arrive.",
  },
  {
    icon: FlagTriangleRight,
    title: "Report Updates",
    description:
      "Rates changed? Spot closed? Flag it so the whole community stays accurate.",
  },
];

export default function Features() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Why Paradahan"
          title="Everything you need to park with confidence"
          description="Built entirely around parking — not buried inside a general maps app."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group card-surface h-full p-7 hover:border-primary/30 hover:shadow-lift"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  <feature.icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
