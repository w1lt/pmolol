import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { UserPage } from "@/components/page/UserPage";
import { recordPageVisit } from "@/lib/actions";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";

// Define the expected shape of page data including relations
// This should match the one in UserPage.tsx if not imported
type PageWithContentAndUser = Prisma.PageGetPayload<{
  include: {
    contentBlocks: {
      orderBy: {
        position: "asc";
      };
    };
    user: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      title: true,
      description: true,
    },
  });

  if (!page) {
    return {
      title: "Page Not Found - pmo.lol",
      description: "This page doesn't exist",
    };
  }

  return {
    title: `${page.title}`,
    description: page.description,
  };
}

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
  // First check the direct slug
  let pageData: PageWithContentAndUser | null = await prisma.page.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      contentBlocks: {
        orderBy: {
          position: "asc",
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // If not found, check if it's an alias
  if (!pageData) {
    pageData = await prisma.page.findFirst({
      where: {
        aliases: {
          has: params.slug,
        },
      },
      include: {
        contentBlocks: {
          orderBy: {
            position: "asc",
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // If still not found, return 404
  if (!pageData) {
    notFound();
  }

  // Record page visit
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const referer = headersList.get("referer") || "";
  const ip =
    headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "";

  await recordPageVisit({
    pageId: pageData.id,
    userAgent,
    referer,
    ip,
  });

  // The incrementContentBlockClick function is available if needed for link clicks handled server-side
  // For now, UserPage will handle clicks client-side or via dedicated API if complex

  return <UserPage page={pageData} />;
  // Temporary `as any` cast for pageData.
  // This will be resolved when UserPage props are updated for ContentBlock[]
}
