"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isAdminFromDB } from "@/lib/server-utils";

export async function updateListingStatus(listingId: string, newStatus: string) {
  const isAdmin = await isAdminFromDB();
  if (!isAdmin) {
    throw new Error("Ruxsat yo'q. Admin huquqi talab etiladi.");
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: newStatus }
  });
  
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteListing(listingId: string) {
  const isAdmin = await isAdminFromDB();
  if (!isAdmin) {
    throw new Error("Ruxsat yo'q. Admin huquqi talab etiladi.");
  }

  await prisma.listing.delete({
    where: { id: listingId }
  });
  
  revalidatePath("/admin");
  revalidatePath("/");
}
