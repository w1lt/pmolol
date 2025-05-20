import { Page, Link, PageVisit } from "@prisma/client";
import { User } from "next-auth";

// NextAuth extended types
declare module "next-auth" {
  interface Session {
    user: User & { id: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

// Application types
export type PageWithLinks = Page & {
  links: Link[];
};

export type PageWithStats = Page & {
  totalVisits: number;
  linkClicks: number;
};

export type PageVisitStats = {
  totalVisits: number;
  byCountry: Record<string, number>;
  byCity: Record<string, number>;
  byReferrer: Record<string, number>;
  byDate: Record<string, number>;
};

export type LinkWithStats = Link & {
  clickPercentage: number;
};
