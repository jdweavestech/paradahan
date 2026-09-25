"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Check, RotateCcw, Loader2, Mail } from "lucide-react";
import { FilterTabs, PanelState } from "./PanelParts";
import type { ContactMessage, ContactMessageStatus } from "@/lib/types";

const filters: { id: ContactMessageStatus | "all"; label: string }[] = [
  { id: "new", label: "New" },
  { id: "handled", label: "Handled" },
  { id: "all", label: "All" },
];

export default function MessagesPanel() {
  const [filter, setFilter] = useState<ContactMessageStatus | "all">("new");
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMessages(null);
    setFetchError(null);

    const query = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/admin/messages${query}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load messages.");
        return data;
      })
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setMessages([]);
          setFetchError(err.message ?? "Failed to load messages.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { new: 0, handled: 0 };
    for (const m of messages ?? []) c[m.status]++;
    return c;
  }, [messages]);

  async function setStatus(message: ContactMessage, status: ContactMessageStatus) {
    setBusyId(message.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Something went wrong.");
        return;
      }
      const updated: ContactMessage = data.message;
      setMessages((prev) => {
        if (!prev) return prev;
        if (filter !== "all" && updated.status !== filter) return prev.filter((m) => m.id !== updated.id);
        return prev.map((m) => (m.id === updated.id ? updated : m));
      });
    } catch {
      setActionError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <FilterTabs filters={filters} active={filter} onChange={setFilter} counts={messages !== null ? counts : undefined} />
      {actionError && (
        <p className="mt-4 rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">{actionError}</p>
      )}
      <div className="mt-6 space-y-4">
        <PanelState
          loading={messages === null}
          error={fetchError}
          empty={messages !== null && messages.length === 0}
          icon={Inbox}
          emptyText={`No ${filter === "all" ? "" : filter} messages right now.`}
        />
        {messages?.map((m) => (
          <div key={m.id} className="card-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{m.subject}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  <span className="font-semibold text-ink/70">{m.fullName}</span> · {m.email} ·{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  m.status === "new" ? "bg-primary-light text-primary-hover" : "bg-success/10 text-success"
                }`}
              >
                {m.status === "new" ? "New" : "Handled"}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-line text-sm text-ink/80">{m.message}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                className="btn-secondary !py-2.5"
              >
                <Mail size={14} />
                Reply
              </a>
              {m.status === "new" ? (
                <button
                  onClick={() => setStatus(m, "handled")}
                  disabled={busyId !== null}
                  className="btn-primary !bg-success !py-2.5 !shadow-none disabled:opacity-60"
                >
                  {busyId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Mark Handled
                </button>
              ) : (
                <button
                  onClick={() => setStatus(m, "new")}
                  disabled={busyId !== null}
                  className="btn-ghost !py-2.5 disabled:opacity-60"
                >
                  {busyId === m.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  Mark as New
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
