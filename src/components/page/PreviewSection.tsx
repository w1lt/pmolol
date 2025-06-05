"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { ContentType } from "@prisma/client";
import type {
  Page as PrismaPage,
  ContentBlock as PrismaContentBlock,
} from "@prisma/client";
import DynamicLucideIcon from "../icons/DynamicLucideIcon";

interface PreviewSectionProps {
  page: Omit<PrismaPage, "profileImage" | "contentBlocks"> & {
    showWatermark?: boolean;
  };
  contentBlocks: PrismaContentBlock[];
  previewUrl: string;
  rootUrl: string;
}

const iconSkeleton = (size: number = 20, extraClass: string = "") => (
  <span
    style={{ width: size, height: size }}
    className={`inline-block align-middle animate-pulse bg-muted rounded ${extraClass}`}
  ></span>
);

export function PreviewSection({
  page,
  contentBlocks,
  previewUrl,
  rootUrl,
}: PreviewSectionProps) {
  return (
    <div className="lg:col-span-2">
      <div className="sticky top-4">
        <div className="rounded-md pb-4">
          <div className="flex items-center justify-between mb-4 border rounded-md px-4 py-2">
            <p className="text-sm font-medium ">
              {rootUrl}
              {previewUrl.startsWith("/") ? previewUrl : `/${previewUrl}`}
            </p>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`${rootUrl}${
                  previewUrl.startsWith("/") ? previewUrl : `/${previewUrl}`
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Live Page
              </a>
            </Button>
          </div>
          <div
            className="min-h-[500px] border rounded-md overflow-auto"
            style={
              {
                backgroundColor: page.backgroundColor || "#FFFFFF",
                color: page.textColor || "#000000",
                fontFamily: page.fontFamily || "sans-serif",
                "--bg-color": page.backgroundColor || "#FFFFFF",
                "--text-color": page.textColor || "#000000",
                "--accent-color": page.accentColor || "#3B82F6",
              } as React.CSSProperties
            }
          >
            <div className="max-w-md mx-auto space-y-8 py-8 px-4 md:py-12">
              {page.bannerImage && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={page.bannerImage}
                    alt={`${page.title} banner preview`}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                    key={page.bannerImage}
                  />
                </div>
              )}

              {(() => {
                const editorHeaderBlock = contentBlocks.find(
                  (block) => block.type === ContentType.HEADER
                );
                const previewDisplayTitle = editorHeaderBlock
                  ? editorHeaderBlock.title
                  : page.title;
                const previewDisplayDescription = editorHeaderBlock
                  ? editorHeaderBlock.textContent
                  : page.description;
                return (
                  <div className="flex flex-col items-center text-center pt-4">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
                      {previewDisplayTitle || "Untitled Page"}
                    </h1>
                    {previewDisplayDescription && (
                      <p className="mt-3 text-base opacity-90 text-[var(--text-color)]">
                        {previewDisplayDescription}
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-4 pt-4">
                {contentBlocks
                  .filter((block) => block.type !== ContentType.HEADER)
                  .map((block) => {
                    if (block.type === ContentType.LINK) {
                      return (
                        <div key={block.id}>
                          <div
                            className="block w-full p-4 rounded-xl shadow-md bg-[var(--accent-color)] text-white cursor-pointer truncate"
                            style={{
                              backgroundColor: page.accentColor || "#3B82F6",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-lg truncate">
                                {block.title || "Untitled Link"}
                              </span>
                              {block.icon && (
                                <Suspense
                                  fallback={iconSkeleton(20, "text-xl")}
                                >
                                  <DynamicLucideIcon
                                    name={block.icon}
                                    className="text-xl text-white"
                                    key={`preview-${block.id}-${block.icon}`}
                                  />
                                </Suspense>
                              )}
                            </div>
                          </div>
                        </div>
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
                                __html: block.textContent.replace(
                                  /\n/g,
                                  "<br />"
                                ),
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
          </div>
        </div>
      </div>
    </div>
  );
}
