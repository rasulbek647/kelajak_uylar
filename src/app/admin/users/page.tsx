import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true } } },
  });
  
  const serializedUsers = users.map(u => ({
    ...u,
    badge: u.badge ?? "NONE",
    createdAt: u.createdAt.toISOString()
  }));

  return <AdminUsersClient initialUsers={serializedUsers} />;
}
