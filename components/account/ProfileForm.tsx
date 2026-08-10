"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import type { SessionUser } from "@/hooks/useSession";

export default function ProfileForm({
  user,
  onUpdated,
}: {
  user: SessionUser;
  onUpdated: () => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(false);

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: "Something went wrong." });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(true);
      onUpdated();
    } catch {
      setErrors({ form: "Network error — please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-base"
        />
        {errors.fullName && <p className="mt-1.5 text-xs font-medium text-danger">{errors.fullName}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
        <input type="email" value={user.email} disabled className="input-base opacity-60" />
        <p className="mt-1.5 text-xs text-muted">Email changes aren't supported yet.</p>
      </div>

      <div className="border-t border-border pt-6">
        <p className="text-sm font-semibold text-ink">Change Password</p>
        <p className="mt-1 text-xs text-muted">Leave blank to keep your current password.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-ink/70">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-base"
            />
            {errors.currentPassword && (
              <p className="mt-1.5 text-xs font-medium text-danger">{errors.currentPassword}</p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-ink/70">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base"
            />
            {errors.newPassword && (
              <p className="mt-1.5 text-xs font-medium text-danger">{errors.newPassword}</p>
            )}
          </div>
        </div>
      </div>

      {errors.form && (
        <p className="rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">{errors.form}</p>
      )}
      {success && (
        <p className="flex items-center gap-1.5 rounded-2xl bg-success/10 p-4 text-sm font-medium text-success">
          <Check size={16} />
          Profile updated.
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
