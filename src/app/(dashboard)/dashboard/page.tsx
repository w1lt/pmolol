import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, BarChart2, Eye, ExternalLink, ListChecks } from "lucide-react";
import { ContentType } from "@prisma/client";

export const metadata = {
  title: "Dashboard - pmo.lol",
  description: "Manage your custom link page",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  // Get the user's page
  const userPage = await prisma.page.findFirst({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: {
          pageVisits: true,
          contentBlocks: true,
        },
      },
    },
  });

  // If user doesn't have a page yet, guide them to create one
  if (!userPage) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to pmo.lol!</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          You haven&apos;t created your page yet. Let&apos;s get started!
        </p>
        <Link href="/edit">
          <Button size="lg">
            Create Your Page
            <Edit className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Get total visits in the last 7 days
  const lastWeekVisits = await prisma.pageVisit.count({
    where: {
      pageId: userPage.id,
      timestamp: {
        // Corrected to timestamp
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Get total link clicks
  const totalClicksData = await prisma.contentBlock.aggregate({
    where: {
      pageId: userPage.id,
      type: ContentType.LINK,
    },
    _sum: {
      clicks: true,
    },
  });
  const totalLinkClicks = totalClicksData._sum.clicks || 0;

  const stats = [
    {
      name: "Total Page Views",
      value: userPage._count.pageVisits.toLocaleString(),
      icon: Eye,
      change: `${lastWeekVisits.toLocaleString()} in last 7 days`,
    },
    {
      name: "Total Link Clicks",
      value: totalLinkClicks.toLocaleString(),
      icon: BarChart2,
      change: "Across all link blocks",
    },
    {
      name: "Content Blocks",
      value: userPage._count.contentBlocks.toLocaleString(),
      icon: ListChecks,
      change: "Total link and text blocks",
    },
  ];

  return (
    <div className="container py-12">
      {" "}
      {/* This container provides padding within the main layout's main tag */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your page&apos;s performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${userPage.slug}`} target="_blank">
              View Live Page <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/edit">
              Edit Page <Edit className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              A summary of recent visits to your page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent activity will be shown here.
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Content</CardTitle>
            <CardDescription>
              Your most clicked links and viewed text blocks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Top content will be shown here.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-12 text-center">
        <Link href="/analytics">
          <Button variant="outline" size="lg">
            View Detailed Analytics
            <BarChart2 className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
