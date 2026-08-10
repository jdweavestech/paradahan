"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCog, Heart, MapPinPlus, Loader2 } from "lucide-react";
import Container from "@/components/shared/Container";
import { useSession } from "@/hooks/useSession";
import ProfileForm from "@/components/account/ProfileForm";
import SavedSpots from "@/components/account/SavedSpots";
import MyContributions from "@/components/account/MyContributions";

type Tab = "profile" | "saved" | "contributions";

const tabs: { id: Tab; label: string; icon: typeof UserCog }[] = [
  { id: "profile", label: "Edit Profile", icon: UserCog },
  { id: "saved", label: "My Saved Spots", icon: Heart },
  { id: "contributions", label: "My Contributions", icon: MapPinPlus },
];

function AccountContent() {
  const { user, loading, refresh } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(
    requestedTab && tabs.some((t) => t.id === requestedTab) ? requestedTab : "profile"
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account");
  }, [loading, user, router]);

  function selectTab(id: Tab) {
    setTab(id);
    router.replace(`/account?tab=${id}`, { scroll: false });
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  const initials =
    user.fullName
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="bg-background py-16">
      <Container className="max-w-4xl">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {initials}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{user.fullName}</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "bg-primary text-white shadow-soft"
                    : "text-ink/70 hover:bg-ink/5"
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="card-surface p-6 sm:p-8">
            {tab === "profile" && <ProfileForm user={user} onUpdated={refresh} />}
            {tab === "saved" && <SavedSpots />}
            {tab === "contributions" && <MyContributions />}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
