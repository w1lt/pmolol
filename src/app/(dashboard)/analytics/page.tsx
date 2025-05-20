import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { format, subDays } from "date-fns";
import { ContentType } from "@prisma/client";

export const metadata = {
  title: "Analytics - pmo.lol",
  description: "Detailed analytics for your pmo.lol page",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  // Get the user's page
  const userPage = await prisma.page.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!userPage) {
    redirect("/dashboard");
  }

  // Get total page visits
  const totalVisits = await prisma.pageVisit.count({
    where: {
      pageId: userPage.id,
    },
  });

  // Get visits by day (last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);

  const dailyVisits = await prisma.pageVisit.groupBy({
    by: ["timestamp"],
    where: {
      pageId: userPage.id,
      timestamp: {
        gte: thirtyDaysAgo,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  // Format daily visits for chart
  const visitsByDay = dailyVisits.map((day) => ({
    date: format(new Date(day.timestamp), "MMM dd"),
    visits: day._count._all,
  }));

  // Get top referrers
  const topReferrersRaw = await prisma.pageVisit.groupBy({
    by: ["referrer"],
    where: {
      pageId: userPage.id,
      referrer: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: { referrer: "desc" },
    },
    take: 5,
  });

  // Get top locations (if available)
  const topLocationsRaw = await prisma.pageVisit.groupBy({
    by: ["country"],
    where: {
      pageId: userPage.id,
      country: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: { country: "desc" },
    },
    take: 5,
  });

  // Get top links by clicks
  const topLinks = await prisma.contentBlock.findMany({
    where: {
      pageId: userPage.id,
      type: ContentType.LINK,
    },
    orderBy: {
      clicks: "desc",
    },
    take: 10,
    select: {
      id: true,
      title: true,
      url: true,
      clicks: true,
    },
  });

  return (
    <AnalyticsDashboard
      page={userPage}
      totalVisits={totalVisits}
      visitsByDay={visitsByDay}
      topReferrers={topReferrersRaw.map((ref) => ({
        source: ref.referrer || "Direct",
        count: ref._count?._all || 0,
      }))}
      topLocations={topLocationsRaw.map((loc) => ({
        country: loc.country || "Unknown",
        count: loc._count?._all || 0,
      }))}
      topLinks={topLinks.map((link) => ({
        ...link,
        title: link.title || "Untitled Link",
        url: link.url || "#",
      }))}
    />
  );
}
