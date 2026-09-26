"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

export type AboutSection = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
};

export async function getAboutSections() {
  try {
    const sections = await prisma.aboutSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: sections };
  } catch (error) {
    console.error("Failed to fetch about sections:", error);
    return { success: false, error: "Failed to load sections" };
  }
}

export async function createAboutSection(data: {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image?: string;
}) {
  try {
    const section = await prisma.aboutSection.create({
      data: {
        ...data,
        sortOrder: await (async () => {
          const last = await prisma.aboutSection.findFirst({
            orderBy: { sortOrder: "desc" },
          });
          return (last?.sortOrder ?? -1) + 1;
        })(),
      },
    });
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true, data: section };
  } catch (error) {
    console.error("Failed to create about section:", error);
    return { success: false, error: "Failed to create section" };
  }
}

export async function updateAboutSection(
  id: string,
  data: Partial<{
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image: string;
    isActive: boolean;
    sortOrder: number;
  }>,
) {
  try {
    const section = await prisma.aboutSection.update({
      where: { id },
      data,
    });
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true, data: section };
  } catch (error) {
    console.error("Failed to update about section:", error);
    return { success: false, error: "Failed to update section" };
  }
}

export async function deleteAboutSection(id: string) {
  try {
    const section = await prisma.aboutSection.findUnique({
      where: { id },
    });

    if (section?.image?.includes("blob.vercel-storage.com")) {
      try {
        await del(section.image);
      } catch (e) {
        console.error("Failed to delete about section image:", e);
      }
    }

    await prisma.aboutSection.delete({ where: { id } });
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete about section:", error);
    return { success: false, error: "Failed to delete section" };
  }
}

export async function reorderAboutSections(
  items: { id: string; sortOrder: number }[],
) {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.aboutSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder sections:", error);
    return { success: false, error: "Failed to reorder sections" };
  }
}
