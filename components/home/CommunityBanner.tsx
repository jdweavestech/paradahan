"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPinPlus, ParkingSquare, Car, Bike } from "lucide-react";
import Container from "../shared/Container";
import Reveal from "../shared/Reveal";

export default function CommunityBanner() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-dark px-8 py-16 sm:px-16 sm:py-20">
          {/* Ambient floating shapes */}
          <div
            aria-hidden
            className="absolute -top-10 right-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl animate-float"
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />

          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal>
              <span className="eyebrow border border-white/15 bg-white/10 text-white">
                Community-powered
              </span>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Know a parking spot?
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
                Every space on Paradahan was added by a driver who's been
                there. Map a spot in minutes and help someone else skip the
                circling.
              </p>
              <div className="mt-8">
                <Link href="/add-parking" className="btn-primary">
                  <MapPinPlus size={18} />
                  Add Parking Spot
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.15} className="relative hidden lg:block">
              <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
                <motion.div
                  className="absolute h-full w-full rounded-full border border-primary/30"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/15 backdrop-blur-md">
                  <ParkingSquare size={56} className="text-primary-light" />
                </div>
                <motion.span
                  className="absolute -left-2 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lift"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Car size={20} className="text-primary" />
                </motion.span>
                <motion.span
                  className="absolute -right-4 bottom-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lift"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Bike size={20} className="text-primary" />
                </motion.span>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
