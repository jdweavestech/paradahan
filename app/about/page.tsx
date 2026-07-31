"use client";

import Image from "next/image";
import { Target, Eye, Sparkles, Users } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

const whyPoints = [
  {
    icon: Sparkles,
    title: "Built only for parking",
    description:
      "Not a side feature buried in a general maps app — parking is the entire product.",
  },
  {
    icon: Users,
    title: "Powered by real drivers",
    description:
      "Every listing, rate, and review comes from people who've actually parked there.",
  },
  {
    icon: Target,
    title: "Focused on accuracy",
    description:
      "Report tools and community edits keep information current, not stale.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark py-24 text-center">
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
        />
        <Container className="relative">
          <Reveal className="mx-auto max-w-2xl">
            <span className="eyebrow border border-white/15 bg-white/10 text-white">
              About Paradahan
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Parking shouldn't be a guessing game.
            </h1>
            <p className="mt-4 text-base text-white/60 sm:text-lg">
              Paradahan started with a simple frustration every Filipino
              driver knows: circling the block, unsure where to park. We're
              building the fix, together with the community.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <Container className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Reveal>
            <div className="card-surface h-full p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Target size={22} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-ink">Our Mission</h2>
              <p className="mt-3 leading-relaxed text-muted">
                To make finding parking in the Philippines as simple as
                searching a map — by putting accurate, community-verified
                information in every driver's hands.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-surface h-full p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Eye size={22} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-ink">Our Vision</h2>
              <p className="mt-3 leading-relaxed text-muted">
                A Philippines where every parking space — from mall basements
                to side-street lots — is mapped, trusted, and easy to reach.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Why Paradahan */}
      <section className="bg-white py-24">
        <Container>
          <SectionHeading
            eyebrow="Why Paradahan"
            title="What makes us different"
            align="center"
          />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {whyPoints.map((point, i) => (
              <Reveal key={point.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                    <point.icon size={24} />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {point.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How community helps */}
      <section className="py-24">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-80 overflow-hidden rounded-3xl sm:h-96">
              <Image
                src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200&auto=format&fit=crop"
                alt="Driver checking a parking app on their phone"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow">How Community Helps</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Every contribution keeps the map alive
            </h2>
            <ul className="mt-6 space-y-4 text-muted">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Drivers add new spots they've discovered, so coverage keeps growing.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Reviews and ratings flag safe, reliable spaces worth returning to.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Reports catch closures and rate changes before they mislead anyone.
              </li>
            </ul>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
