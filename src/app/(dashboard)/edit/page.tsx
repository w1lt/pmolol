import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageEditor } from "@/components/page/PageEditor";

export const metadata = {
  title: "Edit - pmo.lol",
  description: "Customize your link page",
};

export default async function EditPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  // Get the user's page or create one if it doesn't exist
  let userPage = await prisma.page.findFirst({
    where: { userId: session.user.id },
    include: {
      contentBlocks: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  // If no page exists, create one with default values
  if (!userPage) {
    // Generate a slug from the user's email or name
    const emailUsername = session.user.email?.split("@")[0] || "";
    let defaultSlug = emailUsername.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Ensure slug is unique if this is the first page creation for this user
    const existingPageWithSlug = await prisma.page.findUnique({
      where: { slug: defaultSlug },
    });
    if (existingPageWithSlug) {
      defaultSlug = `${defaultSlug}-${Math.random()
        .toString(36)
        .substring(2, 7)}`;
    }

    userPage = await prisma.page.create({
      data: {
        userId: session.user.id,
        slug: defaultSlug,
        title: session.user.name || "My Link Page",
        contentBlocks: {
          create: [
            {
              type: "LINK",
              title: "My Website",
              url: "https://example.com",
              position: 0,
            },
          ],
        },
      },
      include: {
        contentBlocks: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });
  }

  // The PageEditor component expects initialData to be a non-null Page object
  // with contentBlocks. The logic above ensures userPage is populated if session is valid.
  return <PageEditor initialData={userPage!} />;
}
