import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import { brokers } from "@/data/brokers";
import ContentGeneratorForm from "./ContentGeneratorForm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "senolgen@gmail.com";

export default async function ContentGeneratorPage() {
  const session = await auth();
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            Admin
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-dark">
            Blog Content Generator
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Generates a blog post and cover image with OpenAI and publishes
            it immediately to <code>/blog</code> — there is no review step.
          </p>

          {!isAdmin ? (
            <p className="mt-8 rounded-lg border border-hairline-light bg-paper px-4 py-3 text-sm text-text-muted">
              You must be signed in as an admin to use this tool.
            </p>
          ) : (
            <ContentGeneratorForm brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
