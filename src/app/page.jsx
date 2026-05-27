import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="home-landing">
      <div className="home-card">
        <div className="home-logo-mark">N</div>
        <h1 className="home-wordmark">Nook</h1>
        <div className="home-actions">
          <Link href="/login" className="home-btn home-btn-primary">Log in</Link>
          <Link href="/signup" className="home-btn home-btn-secondary">Create account</Link>
        </div>
      </div>

      <style>{`
        .home-landing {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--app-bg);
        }
        .home-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .home-logo-mark {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: var(--sb-logo-bg);
          color: var(--sb-logo-fg);
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .home-wordmark {
          font-family: var(--font-serif);
          font-size: 36px;
          font-weight: 500;
          color: var(--text-1);
          margin: 0;
          letter-spacing: -0.5px;
        }
        .home-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
          width: 220px;
        }
        .home-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 0;
          border-radius: 12px;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s var(--ease-spring);
          cursor: pointer;
        }
        .home-btn:active {
          transform: scale(0.97);
        }
        .home-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .home-btn-primary {
          background: var(--sb-logo-bg);
          color: var(--sb-logo-fg);
        }
        .home-btn-primary:hover {
          opacity: 0.85;
        }
        .home-btn-secondary {
          background: var(--accent-bg);
          color: var(--accent);
          border: 1px solid var(--accent-bdr);
        }
        .home-btn-secondary:hover {
          background: var(--accent-bdr);
        }
      `}</style>
    </main>
  );
}
