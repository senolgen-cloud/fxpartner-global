import { sendEmail } from "./email";
import type { ComplaintStatus } from "@/db/schema";

const NOTIFY_EMAIL = process.env.COMPLAINT_NOTIFY_EMAIL || "senolgen@gmail.com";

export async function sendRegistrationNotification(user: {
  name?: string | null;
  email?: string | null;
}) {
  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: "New FXPARTNER account registered",
    html: `
      <h2>New account registered</h2>
      <p><strong>Name:</strong> ${user.name ?? "-"}</p>
      <p><strong>Email:</strong> ${user.email ?? "-"}</p>
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
