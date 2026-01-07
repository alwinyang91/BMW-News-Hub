"use client";

import { useState, useEffect, useMemo } from "react";
import { ArticlesData } from "@/types/article";
import { fetchArticlesFromLocal } from "@/lib/huggingface";
import { parseDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalysisPage() {
  const [data, setData] = useState<ArticlesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    fetchArticlesFromLocal("/api/articles")
      .then((fetchedData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load articles";
        setError(`Failed to load articles: ${errorMessage}`);
        setLoading(false);
      });
  }, []);

  // Count articles by month
  const monthlyData = useMemo(() => {
    if (!data) return [];

    const monthlyCount: Record<string, number> = {};

    data.articles.forEach((article) => {
      const date = parseDate(article.date);
      if (!date) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyCount)
      .map(([month, count]) => ({
        month,
        count,
        label: new Date(month + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  // Count articles by year
  const yearlyData = useMemo(() => {
    if (!data) return [];

    const yearlyCount: Record<string, number> = {};

    data.articles.forEach((article) => {
      const date = parseDate(article.date);
      if (!date) return;
      const year = date.getFullYear().toString();
      yearlyCount[year] = (yearlyCount[year] || 0) + 1;
    });

    return Object.entries(yearlyCount)
      .map(([year, count]) => ({
        year,
        count,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [data]);

  // Statistics
  const stats = useMemo(() => {
    if (!data) return null;

    const totalArticles = data.articles.length;
    const dates = data.articles
      .map((a) => {
        const date = parseDate(a.date);
        return date ? date.getTime() : null;
      })
      .filter((time): time is number => time !== null);
    const oldestDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
    const newestDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
    const avgPerMonth = monthlyData.length > 0 
      ? (totalArticles / monthlyData.length).toFixed(1)
      : "0";

    return {
      totalArticles,
      oldestDate,
      newestDate,
      avgPerMonth,
      monthlyCount: monthlyData.length,
      yearlyCount: yearlyData.length,
    };
  }, [data, monthlyData, yearlyData]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-destructive text-lg font-semibold mb-2">
                {error || "No data available"}
              </p>
              <Button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetchArticlesFromLocal("/api/articles")
                    .then((fetchedData) => {
                      setData(fetchedData);
                      setLoading(false);
                    })
                    .catch((err) => {
                      console.error("Error fetching data:", err);
                      const errorMessage = err instanceof Error ? err.message : "Failed to load articles";
                      setError(`Failed to load articles: ${errorMessage}`);
                      setLoading(false);
                    });
                }}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Data Analysis</h1>
        <p className="text-gray-600">
          Article publication statistics and trends
        </p>
      </div>

      {/* Statistics cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalArticles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Date Range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-[var(--chart-1)]">
                {stats.oldestDate.toLocaleDateString()} - {stats.newestDate.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg per Month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.avgPerMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Time Periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-[var(--chart-1)]">
                {stats.monthlyCount} months / {stats.yearlyCount} years
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "monthly" | "yearly")} className="mb-6">
        <TabsList>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="yearly">Yearly View</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {viewMode === "monthly" ? "Monthly Publication Count" : "Yearly Publication Count"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {viewMode === "monthly" ? (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="var(--chart-1)" name="Articles" />
              </BarChart>
            ) : (
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  name="Articles"
                  dot={{ fill: "var(--chart-1)", r: 5 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "monthly" ? "Monthly Breakdown" : "Yearly Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{viewMode === "monthly" ? "Month" : "Year"}</TableHead>
                <TableHead>Article Count</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(viewMode === "monthly" ? monthlyData : yearlyData).map((item, index) => {
                const total = viewMode === "monthly"
                  ? monthlyData.reduce((sum, d) => sum + d.count, 0)
                  : yearlyData.reduce((sum, d) => sum + d.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {viewMode === "monthly" ? (item as typeof monthlyData[0]).label : (item as typeof yearlyData[0]).year}
                    </TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{percentage}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
