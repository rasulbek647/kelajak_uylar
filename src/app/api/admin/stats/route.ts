import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ message: "Ruxsat yoq" }, { status: 403 });
  }

  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);

  const [
    totalUsers, totalListings, pendingListings, activeListings, rejectedListings,
    newUsersWeek, newListingsWeek, newUsersMonth, newListingsMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "REJECTED" } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.listing.count({ where: { createdAt: { gte: monthAgo } } }),
  ]);

  return NextResponse.json({
    totalUsers, totalListings, pendingListings, activeListings, rejectedListings,
    newUsersWeek, newListingsWeek, newUsersMonth, newListingsMonth,
  });
}
