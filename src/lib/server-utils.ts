import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  avatar: true,
  phone: true,
  showPhone: true,
  badge: true,
  isRealtor: true,
  isVerified: true,
} as const;

export async function getUserFromSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const id = (session.user as any).id;
  if (id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) return user;
  }
  const phone = (session.user as any).phone;
  if (phone) {
    return prisma.user.findUnique({ where: { phone } });
  }
  return null;
}

export async function isAdminFromDB(): Promise<boolean> {
  const user = await getUserFromSession();
  return user?.role === "ADMIN";
}
