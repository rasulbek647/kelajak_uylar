import { prisma } from "@/lib/prisma";
import AdminListingsClient from "./AdminListingsClient";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, phone: true } },
      images: { take: 1 },
    },
  });
  
  const serializedListings = listings.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString()
  }));

  return <AdminListingsClient initialListings={serializedListings} />;
}
