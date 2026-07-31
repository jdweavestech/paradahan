"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SearchWidget from "./SearchWidget";
import Container from "../shared/Container";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=2000&auto=format&fit=crop"
          alt="Modern multi-level parking structure"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
      </div>

      {/* Floating background shapes */}
      <div
        aria-hidden
        className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <Container className="relative flex flex-col items-center pt-28 pb-20 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow border border-white/20 bg-white/10 text-white backdrop-blur-md"
        >
          Community-driven · Philippines
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Find Parking
          <br />
          <span className="bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent">
            Anywhere, Anytime.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-base text-white/80 sm:text-lg"
        >
          Skip the circling. Paradahan helps you locate, compare, and
          navigate to real parking spaces — updated by drivers just like you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex w-full justify-center"
        >
          <SearchWidget />
        </motion.div>
      </Container>
    </section>
  );
}
