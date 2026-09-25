import type { ContactMessage, ContactMessageStatus, ContactSubject } from "@/lib/types";
import { supabase, unwrap, unwrapOne } from "./supabase";

/** Contact-form messages and newsletter sign-ups, backed by Supabase. */

interface MessageRow {
  id: string;
  full_name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  user_id: string | null;
  status: ContactMessageStatus;
  created_at: string;
}

function fromRow(row: MessageRow): ContactMessage {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    userId: row.user_id ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createContactMessage(input: {
  fullName: string;
  email: string;
  subject: ContactSubject;
  message: string;
  userId?: string;
}): Promise<ContactMessage> {
  const row = unwrapOne(
    await supabase()
      .from("contact_messages")
      .insert({
        full_name: input.fullName,
        email: input.email,
        subject: input.subject,
        message: input.message,
        user_id: input.userId ?? null,
      })
      .select("*")
      .single<MessageRow>(),
    "createContactMessage"
  );
  return fromRow(row);
}

export async function getAllContactMessages(status?: ContactMessageStatus): Promise<ContactMessage[]> {
  let query = supabase().from("contact_messages").select("*");
  if (status) query = query.eq("status", status);
  const rows = unwrap(
    await query.order("created_at", { ascending: false }).returns<MessageRow[]>(),
    "getAllContactMessages"
  );
  return (rows ?? []).map(fromRow);
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessage | null> {
  if (!UUID_RE.test(id)) return null;
  const row = unwrap(
    await supabase()
      .from("contact_messages")
      .update({ status })
      .eq("id", id)
      .select("*")
      .maybeSingle<MessageRow>(),
    "updateContactMessageStatus"
  );
  return row ? fromRow(row) : null;
}

/** Adds an email to the newsletter list. Re-subscribing an existing email is a no-op. */
export async function addNewsletterSubscriber(email: string): Promise<void> {
  unwrap(
    await supabase()
      .from("newsletter_subscribers")
      .upsert({ email: email.trim().toLowerCase() }, { onConflict: "email", ignoreDuplicates: true }),
    "addNewsletterSubscriber"
  );
}
