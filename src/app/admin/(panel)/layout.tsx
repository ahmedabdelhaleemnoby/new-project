import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { adminFetch, type Staff } from "@/lib/admin-api";

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { staff } = await adminFetch<{ staff: Staff }>("/admin/me");
  return <>
    <header className="admin-bar">
      <div className="admin-container admin-bar-inner">
        <Link href="/admin" className="admin-brand"><span className="logo-window"><Image src="/images/logo.png" alt="Asfour" width={150} height={150} priority /></span><span>Enquiries</span></Link>
        <div className="admin-user">
          <span><strong>{staff.name}</strong><small>{staff.role}</small></span>
          <form action={logoutAction}><button type="submit" className="button button-outline"><LogOut size={16} aria-hidden="true" /> Sign out</button></form>
        </div>
      </div>
    </header>
    <main className="admin-container admin-main">{children}</main>
  </>;
}
