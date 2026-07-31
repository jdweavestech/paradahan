import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import CommunityBanner from "@/components/home/CommunityBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <RecentlyAdded />
      <CommunityBanner />
    </>
  );
}
