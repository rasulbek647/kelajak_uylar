"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Kirish tekshiruvi
  if (!session?.user) {
    redirect("/login");
  }

  // Rol tekshiruvi — faqat ADMIN kirishi mumkin
  if ((session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const adminName = session.user.name || "Admin";
  const adminImage = session.user.image || null;

  return (
    <AdminLayoutClient adminName={adminName} adminImage={adminImage}>
      {children}
    </AdminLayoutClient>
  );
}
