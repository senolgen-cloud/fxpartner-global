import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    client = new Resend(apiKey);
  }
  return client;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getClient();
  const { error } = await resend.emails.send({
    from: "FXPARTNER <no-reply@fxpartner.global>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}
