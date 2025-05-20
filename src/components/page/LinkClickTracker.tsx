"use client";

import { ReactNode } from "react";
import { incrementContentBlockClick } from "@/lib/actions";
import {
  ContentBlock as PrismaContentBlock,
  ContentType,
} from "@prisma/client";

type LinkClickTrackerProps = {
  block: PrismaContentBlock;
  pageId: string;
  children: ReactNode;
};

export function LinkClickTracker({ block, children }: LinkClickTrackerProps) {
  const handleClick = async () => {
    if (block.type === ContentType.LINK && block.id) {
      try {
        await incrementContentBlockClick(block.id);
      } catch (error) {
        console.error("Error tracking link click:", error);
      }
    }
  };

  return <div onClick={handleClick}>{children}</div>;
}
