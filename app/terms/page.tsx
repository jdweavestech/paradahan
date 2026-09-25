import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/shared/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use — Paradahan",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Use" updated="September 2026">
      <section>
        <h2>Using Paradahan</h2>
        <p>
          Paradahan is a free, community-driven directory of parking locations in the Philippines.
          Listings, rates, and hours come from the community and may be out of date. Always follow
          posted signs and local rules; we can&apos;t guarantee availability or accuracy.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          Keep your login details private. You&apos;re responsible for activity on your account.
          We may suspend accounts that break these terms.
        </p>
      </section>

      <section id="community-guidelines">
        <h2>Community guidelines</h2>
        <ul>
          <li>Only add real, publicly accessible parking locations, with accurate details.</li>
          <li>Upload only photos you took or have permission to share. No people&apos;s faces or plate numbers.</li>
          <li>Keep reviews honest and respectful. No spam, ads, hate speech, or personal attacks.</li>
          <li>Use the Report button for wrong or closed listings instead of posting duplicates.</li>
        </ul>
        <p>
          Moderators review every submitted spot before it goes live and may edit, reject, or remove
          content that doesn&apos;t follow these guidelines.
        </p>
      </section>

      <section>
        <h2>Content you share</h2>
        <p>
          You keep ownership of what you contribute, and you give Paradahan permission to display
          it on the service.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          Reach us any time through the <Link href="/contact" className="font-semibold text-primary">contact page</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
