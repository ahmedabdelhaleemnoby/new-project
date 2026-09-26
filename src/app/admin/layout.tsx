import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Asfour Admin", template: "%s | Asfour Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin">{children}</div>;
}
