import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getToken } from "@/lib/admin-api";

export const metadata: Metadata = { title: "Staff sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string; next?: string }> }) {
  const [{ expired, next }, token] = await Promise.all([searchParams, getToken()]);
  if (token && !expired) redirect("/admin");
  return <main className="admin-login">
    <div className="admin-login-card">
      <span className="logo-window"><Image src="/images/logo.png" alt="Asfour for Mining and Refractories" width={150} height={150} priority /></span>
      <p className="eyebrow"><span className="small-square" />Staff area</p>
      <h1>Sign in</h1>
      {expired && <p className="admin-notice" role="status">Your session has ended. Sign in again to continue.</p>}
      <LoginForm next={typeof next === "string" ? next : ""} />
    </div>
  </main>;
}
