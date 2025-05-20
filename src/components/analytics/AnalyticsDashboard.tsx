"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type AnalyticsDashboardProps = {
  page: {
    id: string;
    slug: string;
    title: string;
  };
  totalVisits: number;
  visitsByDay: {
    date: string;
    visits: number;
  }[];
  topReferrers: {
    source: string;
    count: number;
  }[];
  topLocations: {
    country: string;
    count: number;
  }[];
  topLinks: {
    id: string;
    title: string;
    url: string;
    clicks: number;
  }[];
};

export function AnalyticsDashboard({
  page,
  totalVisits,
  visitsByDay,
  topReferrers,
  topLocations,
  topLinks,
}: AnalyticsDashboardProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Make sure we're in the client before rendering charts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Adjust chart colors based on theme
  const chartColors = {
    primary:
      theme === "dark" ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.8)",
    gridLines:
      theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: theme === "dark" ? "#ffffff" : "#000000",
  };

  // Configure visitors chart data
  const visitorsChartData = {
    labels: visitsByDay.map((day) => day.date),
    datasets: [
      {
        label: "Page Views",
        data: visitsByDay.map((day) => day.visits),
        borderColor: chartColors.primary,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Configure top links chart data
  const linksChartData = {
    labels: topLinks.map((link) => link.title),
    datasets: [
      {
        label: "Clicks",
        data: topLinks.map((link) => link.clicks),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderWidth: 0,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: chartColors.gridLines,
        },
        ticks: {
          color: chartColors.text,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: chartColors.gridLines,
        },
        ticks: {
          color: chartColors.text,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: chartColors.text,
        },
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed metrics for your page:{" "}
            <span className="font-medium">{page.title}</span>
          </p>
        </div>

        <Link href={`/${page.slug}`} target="_blank">
          <Button className="mt-4 md:mt-0">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Page
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Page Views</CardDescription>
            <CardTitle className="text-3xl">{totalVisits}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Since you created your page
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Referrer</CardDescription>
            <CardTitle className="text-xl">
              {topReferrers.length > 0 ? topReferrers[0].source : "None"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {topReferrers.length > 0
                ? `${topReferrers[0].count} visits`
                : "No referrers tracked yet"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Clicked Link</CardDescription>
            <CardTitle className="text-xl">
              {topLinks.length > 0 ? topLinks[0].title : "None"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {topLinks.length > 0
                ? `${topLinks[0].clicks} clicks`
                : "No clicks tracked yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Trend Chart */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Visitor Trend</h2>
        <Card>
          <CardContent className="p-6">
            <div className="h-80">
              <Line data={visitorsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Top Referrers */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Referrers</h2>
          <Card>
            <CardContent className="p-6">
              <div className="h-64">
                {topReferrers.length > 0 ? (
                  <Bar
                    data={{
                      labels: topReferrers.map((ref) => ref.source),
                      datasets: [
                        {
                          label: "Visits",
                          data: topReferrers.map((ref) => ref.count),
                          backgroundColor: chartColors.primary,
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      indexAxis: "y" as const,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales?.x,
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No referrer data available yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Locations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Visitor Locations</h2>
          <Card>
            <CardContent className="p-6">
              <div className="h-64">
                {topLocations.length > 0 ? (
                  <Bar
                    data={{
                      labels: topLocations.map((loc) => loc.country),
                      datasets: [
                        {
                          label: "Visitors",
                          data: topLocations.map((loc) => loc.count),
                          backgroundColor: chartColors.primary,
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      indexAxis: "y" as const,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales?.x,
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No location data available yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Links */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Top Performing Links</h2>
        <Card>
          <CardContent className="p-6">
            <div className="h-80">
              {topLinks.length > 0 ? (
                <Bar
                  data={linksChartData}
                  options={{
                    ...chartOptions,
                    indexAxis: "y" as const,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    No click data available yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
