"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ContentType } from "@prisma/client";

// Type for updating page data
export type UpdatePageParams = {
  id: string;
  title?: string;
  description?: string | null;
  slug?: string;
  bannerImage?: string;
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  aliases?: string[];
  showWatermark?: boolean;
};

// Type for a single content block being sent from the client
// This will be used in the array for UpdatePageContentBlocksParams
export type ClientContentBlock = {
  id: string; // Can be temp ID for new blocks
  type: ContentType;
  position: number;
  title?: string | null; // For LINK and TEXT (header)
  url?: string | null; // For LINK
  icon?: string | null; // For LINK
  textContent?: string | null; // For TEXT
};

// Type for updating page content blocks
type UpdatePageContentBlocksParams = {
  pageId: string;
  contentBlocks: ClientContentBlock[];
};

// Type for recording page visits
type RecordPageVisitParams = {
  pageId: string;
  userAgent?: string;
  referer?: string;
  ip?: string;
};

// Update page information
export async function updatePage(params: UpdatePageParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }

  const { id, ...data } = params;

  const page = await prisma.page.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!page || page.userId !== session.user.id) {
    throw new Error("You don't have permission to update this page");
  }

  if (data.slug) {
    const existingPage = await prisma.page.findUnique({
      where: { slug: data.slug },
    });
    if (existingPage && existingPage.id !== id) {
      throw new Error("URL slug already taken");
    }
  }

  const updatedPage = await prisma.page.update({
    where: { id },
    data: data,
  });

  revalidatePath(`/${updatedPage.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/edit");

  return updatedPage;
}

// Update page content blocks (add, update, delete)
export async function updatePageContentBlocks({
  pageId,
  contentBlocks,
}: UpdatePageContentBlocksParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { userId: true, slug: true },
  });

  if (!page || page.userId !== session.user.id) {
    throw new Error("You don't have permission to update this page");
  }

  const existingBlocks = await prisma.contentBlock.findMany({
    where: { pageId },
    select: { id: true },
  });

  const existingBlockIds = existingBlocks.map(
    (block: { id: string }) => block.id
  );
  const newBlockIds = contentBlocks
    .map((block) => block.id)
    .filter((id) => !id.startsWith("temp-"));

  const blockIdsToDelete = existingBlockIds.filter(
    (id: string) => !newBlockIds.includes(id)
  );

  if (blockIdsToDelete.length > 0) {
    await prisma.contentBlock.deleteMany({
      where: { id: { in: blockIdsToDelete } },
    });
  }

  const updatePromises = contentBlocks.map((block) => {
    const { id, type, position, title, url, icon, textContent } = block;

    const blockData = {
      type,
      position,
      title: title || null,
      url: type === ContentType.LINK ? url || null : null,
      icon: type === ContentType.LINK ? icon || null : null,
      textContent:
        type === ContentType.TEXT || type === ContentType.HEADER
          ? textContent || null
          : null,
      pageId,
    };

    if (id.startsWith("temp-")) {
      // Create new block
      return prisma.contentBlock.create({
        data: blockData,
      });
    } else {
      // Update existing block
      return prisma.contentBlock.update({
        where: { id },
        data: {
          type, // Type and position can be updated
          position,
          title: title || null,
          url: type === ContentType.LINK ? url || null : null,
          icon: type === ContentType.LINK ? icon || null : null,
          textContent:
            type === ContentType.TEXT || type === ContentType.HEADER
              ? textContent || null
              : null,
        },
      });
    }
  });

  await Promise.all(updatePromises);

  if (page.slug) {
    revalidatePath(`/${page.slug}`);
  }
  revalidatePath("/dashboard");
  revalidatePath("/edit");

  return { success: true };
}

// Upload image to Vercel Blob
export async function uploadImage(file: File) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }

  const filename = `${session.user.id}-${Date.now()}-${file.name.replace(
    /[^a-zA-Z0-9.-]/g,
    ""
  )}`;

  try {
    const { url } = await put(filename, file, {
      access: "public",
    });
    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload image");
  }
}

// Record a page visit
export async function recordPageVisit({
  pageId,
  userAgent,
  referer,
  ip,
}: RecordPageVisitParams) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    const country = null;
    const city = null;

    await prisma.pageVisit.create({
      data: {
        pageId,
        userId: userId || null,
        ip: ip || null,
        userAgent: userAgent || null,
        referrer: referer || null,
        country,
        city,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error recording page visit:", error);
    return { success: false, error };
  }
}

// Increment link click count (now for ContentBlock)
export async function incrementContentBlockClick(blockId: string) {
  try {
    const block = await prisma.contentBlock.findUnique({
      where: { id: blockId },
      select: { type: true },
    });

    if (!block || block.type !== ContentType.LINK) {
      // Optionally throw an error or return a specific status
      console.warn(
        `Attempted to increment click for non-link or non-existent block: ${blockId}`
      );
      return { success: false, error: "Not a link block or block not found." };
    }

    await prisma.contentBlock.update({
      where: { id: blockId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error incrementing content block click:", error);
    return { success: false, error: (error as Error).message };
  }
}
