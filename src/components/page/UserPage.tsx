import Image from "next/image";
import { LinkClickTracker } from "./LinkClickTracker";
// We'll need the actual Prisma types once client is regenerated
import {
  // Page as PrismaPage, // No longer directly used
  // ContentBlock as PrismaContentBlock, // No longer directly used
  ContentType,
  Prisma, // Import Prisma namespace for PageGetPayload
} from "@prisma/client";

// Define the expected shape of page data including relations
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

type UserPageProps = {
  page: PageWithContentAndUser; // Use the refined type
};

export function UserPage({ page }: UserPageProps) {
  // Define default values for styling
  const defaultBackgroundColor = "#ffffff";
  const defaultTextColor = "#000000";
  const defaultAccentColor = "#3B82F6"; // A common blue
  const defaultFontFamily = "sans-serif";

  // Find the header block, if any
  const headerBlock = page.contentBlocks.find(
    (block) => block.type === ContentType.HEADER
  );

  // Determine title and description based on header block or page settings
  const displayTitle = headerBlock ? headerBlock.title : page.title;
  const displayDescription = headerBlock
    ? headerBlock.textContent
    : page.description;

  return (
    <div
      className="min-h-screen flex flex-col py-8 px-4 md:py-12 bg-[var(--bg-color)] text-[var(--text-color)]"
      style={
        {
          "--bg-color": page.backgroundColor || defaultBackgroundColor,
          "--text-color": page.textColor || defaultTextColor,
          "--accent-color": page.accentColor || defaultAccentColor,
          "--font-family": page.fontFamily || defaultFontFamily,
          fontFamily: "var(--font-family)", // Ensure font-family is applied directly if needed, or just rely on CSS var
        } as React.CSSProperties
      } // Cast to React.CSSProperties for custom props
    >
      <div className="flex-grow max-w-md mx-auto space-y-8 w-full">
        {page.bannerImage && (
          <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={page.bannerImage}
              alt={`${displayTitle || "Page"} banner`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* User Info Section - Now uses headerBlock if available */}
        <div className="flex flex-col items-center text-center pt-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
            {displayTitle || "Untitled Page"}
          </h1>
          {displayDescription && (
            <p className="mt-3 text-base opacity-90 text-[var(--text-color)]">
              {displayDescription}
            </p>
          )}
        </div>

        {/* Content Blocks: Links and Text (excluding HEADER type) */}
        <div className="space-y-4 pt-4">
          {page.contentBlocks
            .filter((block) => block.type !== ContentType.HEADER) // Exclude HEADER blocks from this loop
            .map((block) => {
              if (block.type === ContentType.LINK) {
                return (
                  <LinkClickTracker
                    key={block.id}
                    block={block}
                    pageId={page.id}
                  >
                    <a
                      href={block.url || "#"} // Ensure URL is present for links
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full p-4 rounded-xl transition-all duration-150 ease-in-out shadow-md hover:shadow-lg active:shadow-sm transform hover:scale-102 active:scale-98 bg-[var(--accent-color)] "
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg truncate">
                          {block.title || "Untitled Link"}
                        </span>
                        {block.icon && (
                          <span className="text-xl">{block.icon}</span>
                        )}{" "}
                        {/* Basic icon display */}
                      </div>
                    </a>
                  </LinkClickTracker>
                );
              }
              if (block.type === ContentType.TEXT) {
                return (
                  <div
                    key={block.id}
                    className="p-4 rounded-lg bg-background/20 shadow text-[var(--text-color)]"
                  >
                    {block.title && (
                      <h2 className="text-xl font-semibold mb-2">
                        {block.title}
                      </h2>
                    )}
                    {block.textContent && (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{
                          __html: block.textContent.replace(/\n/g, "<br />"),
                        }}
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-12 text-center text-xs opacity-60">
        <p>
          <a
            href="https://pmo.lol" // Link to your site
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-[var(--text-color)]"
          >
            Made with pmo.lol
          </a>
        </p>
      </div>
    </div>
  );
}
