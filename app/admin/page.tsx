"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ShieldAlert, MapPinPlus, Flag, Inbox } from "lucide-react";
import Container from "@/components/shared/Container";
import { useSession } from "@/hooks/useSession";
import SubmissionsPanel from "@/components/admin/SubmissionsPanel";
import ReportsPanel from "@/components/admin/ReportsPanel";
import MessagesPanel from "@/components/admin/MessagesPanel";

type Section = "submissions" | "reports" | "messages";

const sections: { id: Section; label: string; icon: typeof Flag; description: string }[] = [
  { id: "submissions", label: "Submissions", icon: MapPinPlus, description: "Review community-submitted parking spots." },
  { id: "reports", label: "Reports", icon: Flag, description: "Listings flagged by users as wrong or inappropriate." },
  { id: "messages", label: "Messages", icon: Inbox, description: "Messages sent through the contact form." },
];

function Spinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  );
}

function AdminContent() {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requested = searchParams.get("section") as Section | null;
  const [section, setSection] = useState<Section>(
    requested && sections.some((s) => s.id === requested) ? requested : "submissions"
  );

  useEffect(() => {
    if (!sessionLoading && !user) router.replace("/login?next=/admin");
  }, [sessionLoading, user, router]);

  function selectSection(id: Section) {
    setSection(id);
    router.replace(`/admin?section=${id}`, { scroll: false });
  }

  if (sessionLoading || !user) return <Spinner />;

  if (!user.isAdmin) {
    return (
      <div className="bg-background py-16">
        <Container className="max-w-lg text-center">
          <div className="card-surface p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <ShieldAlert size={24} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Not authorized</h1>
            <p className="mt-2 text-sm text-muted">
              Your account doesn't have access to the moderation panel.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  const current = sections.find((s) => s.id === section)!;

  return (
    <div className="bg-background py-16">
      <Container className="max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Moderation</h1>
            <p className="text-sm text-muted">{current.description}</p>
          </div>
        </div>

        <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSection(s.id)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                section === s.id ? "border-primary text-primary" : "border-transparent text-ink/60 hover:text-ink"
              }`}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {section === "submissions" && <SubmissionsPanel />}
          {section === "reports" && <ReportsPanel />}
          {section === "messages" && <MessagesPanel />}
        </div>
      </Container>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminContent />
    </Suspense>
  );
}
