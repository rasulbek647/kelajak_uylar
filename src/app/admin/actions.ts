"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateListingStatus(listingId: string, newStatus: string) {
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: newStatus }
  });
  
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteListing(listingId: string) {
  await prisma.listing.delete({
    where: { id: listingId }
  });
  
  revalidatePath("/admin");
  revalidatePath("/");
}
