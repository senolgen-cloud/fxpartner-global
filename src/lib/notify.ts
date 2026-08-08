import { sendEmail } from "./email";
import type { ComplaintStatus } from "@/db/schema";

const NOTIFY_EMAIL = process.env.COMPLAINT_NOTIFY_EMAIL || "senolgen@gmail.com";

// A failing cron job (missing env var, broken feed, expired API key — see
// the news-update/DEEPL_API_KEY incident on 2026-08-08) previously just
// 500'd silently; nobody found out until someone happened to check GitHub
// Actions logs. This makes that failure show up in an inbox immediately.
// Never let a failed alert throw and mask the original cron error.
export async function notifyCronFailure(jobName: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  try {
    await sendEmail({
      to: NOTIFY_EMAIL,
      subject: `⚠️ FXPARTNER cron failed: ${jobName}`,
      html: `
        <h2>Cron job failed: ${jobName}</h2>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Error:</strong></p>
        <pre style="white-space:pre-wrap;background:#f4f4f4;padding:12px;border-radius:6px;">${message}</pre>
      `,
    });
  } catch (notifyErr) {
    console.error(`Failed to send cron-failure alert for ${jobName}`, notifyErr);
  }
}

export async function sendRegistrationNotification(user: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  preferredBroker?: string | null;
}) {
  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: "New FXPARTNER account registered",
    html: `
      <h2>New account registered</h2>
      <p><strong>Name:</strong> ${user.name ?? "-"}</p>
      <p><strong>Email:</strong> ${user.email ?? "-"}</p>
      <p><strong>Phone:</strong> ${user.phone ?? "-"}</p>
      <p><strong>Preferred broker:</strong> ${user.preferredBroker ?? "-"}</p>
    `,
  });
}

export async function sendComplaintNotification(complaint: {
  fullName: string;
  phone: string;
  email: string;
  brokerName: string;
  description: string;
}) {
  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New complaint: ${complaint.brokerName}`,
    html: `
      <h2>New broker complaint</h2>
      <p><strong>Full name:</strong> ${complaint.fullName}</p>
      <p><strong>Phone:</strong> ${complaint.phone}</p>
      <p><strong>Email:</strong> ${complaint.email}</p>
      <p><strong>Broker:</strong> ${complaint.brokerName}</p>
      <p><strong>Description:</strong></p>
      <p>${complaint.description.replace(/\n/g, "<br/>")}</p>
    `,
  });
}

export async function sendPartnerApplicationNotification(application: {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  audienceType: string;
  brokerName?: string | null;
  message: string;
}) {
  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New Sub-IB partner application: ${application.fullName}`,
    html: `
      <h2>New Sub-IB partner application</h2>
      <p><strong>Full name:</strong> ${application.fullName}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Phone:</strong> ${application.phone}</p>
      <p><strong>Country:</strong> ${application.country}</p>
      <p><strong>Audience type:</strong> ${application.audienceType}</p>
      <p><strong>Preferred broker:</strong> ${application.brokerName ?? "No preference"}</p>
      <p><strong>Message:</strong></p>
      <p>${application.message.replace(/\n/g, "<br/>")}</p>
    `,
  });
}

export async function sendComplaintStatusUpdate(params: {
  to: string;
  brokerName: string;
  status: ComplaintStatus;
}) {
  const statusLabel: Record<ComplaintStatus, string> = {
    new: "Received",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };
  await sendEmail({
    to: params.to,
    subject: `Your complaint about ${params.brokerName} is now: ${statusLabel[params.status]}`,
    html: `
      <p>Your complaint about <strong>${params.brokerName}</strong> has been updated to:</p>
      <p style="font-size:18px;font-weight:600;">${statusLabel[params.status]}</p>
      <p>You can track it anytime from your FXPARTNER account.</p>
    `,
  });
}
