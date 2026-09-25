import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/shared/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Paradahan",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="September 2026">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your name, email address, and a securely hashed password.</li>
          <li>
            Content you contribute: parking spots, photos, reviews, and reports. Your display name
            is shown publicly next to reviews.
          </li>
          <li>Messages you send through the contact form, and your email if you join the newsletter.</li>
          <li>
            Your location, only when you choose &ldquo;Nearest to me&rdquo; in search. It stays in
            your browser and is never sent to our servers.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          To run your account, show and moderate community contributions, reply to your messages,
          send password-reset emails, and (if you subscribed) send occasional product updates.
          We don&apos;t sell your personal information.
        </p>
      </section>

      <section>
        <h2>Where it&apos;s stored</h2>
        <p>
          Data is stored with our infrastructure providers (Supabase for the database and photo
          storage, Vercel for hosting). Session cookies are used only to keep you logged in.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can update your name and password from your account page. To delete your account or
          any of your data, or to unsubscribe from the newsletter, <Link href="/contact" className="font-semibold text-primary">contact us</Link>{" "}
          and we&apos;ll take care of it, consistent with the Philippine Data Privacy Act of 2012.
        </p>
      </section>
    </LegalPage>
  );
}
