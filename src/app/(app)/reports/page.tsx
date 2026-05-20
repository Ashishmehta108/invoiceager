"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } =
    api.reports.analytics.useQuery({
      month: selectedMonth,
      year: selectedYear,
    });

  // Fetch monthly trend
  const { data: trendData, isLoading: trendLoading } =
    api.reports.monthlyTrend.useQuery({ months: 12 });

  // Fetch status distribution
  const { data: statusData, isLoading: statusLoading } =
    api.reports.statusDistribution.useQuery({
      month: selectedMonth,
      year: selectedYear,
    });

  // Fetch CSV export
  const exportCSVMutation = api.reports.exportCSV.useMutation();

  const handleExportCSV = async () => {
    try {
      const result = await exportCSVMutation.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
      });

      // Create a blob and download
      const blob = new Blob([result.content], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", result.filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const isLoading = analyticsLoading || trendLoading || statusLoading;

  // Prepare chart data
  const statusChartData = statusData
    ? [
        { name: "Paid", value: statusData.paid, fill: "#10b981" },
        { name: "Sent", value: statusData.sent, fill: "#3b82f6" },
        { name: "Overdue", value: statusData.overdue, fill: "#ef4444" },
        { name: "Draft", value: statusData.draft, fill: "#9ca3af" },
      ].filter((item) => item.value > 0)
    : [];

  const topClientsData = analyticsData?.topClients ?? [];

  const currentDate = new Date(selectedYear, selectedMonth - 1);
  const monthName = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="mt-2 text-slate-600">
          View detailed insights and export your financial data
        </p>
      </div>

      {/* Period Selector and Export */}
      <Card className="border-0 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Export & Filter</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleDateString("en-IN", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleExportCSV}
                disabled={exportCSVMutation.isPending}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4" />
                {exportCSVMutation.isPending ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      {analyticsData && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Earned */}
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Earned</p>
                <p className="mt-2 text-3xl font-bold text-emerald-900">
                  ₹{analyticsData.monthMetrics.totalEarned.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {analyticsData.monthMetrics.collectionRate.toFixed(1)}% collection rate
                </p>
              </div>
              <div className="rounded-lg bg-emerald-200 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </Card>

          {/* Total Invoiced */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Invoiced</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">
                  ₹{analyticsData.monthMetrics.totalInvoiced.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  {analyticsData.monthMetrics.invoiceCount} invoices
                </p>
              </div>
              <div className="rounded-lg bg-blue-200 p-3">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          {/* Pending */}
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="text-sm font-medium text-amber-600">Pending</p>
                <p className="mt-2 text-3xl font-bold text-amber-900">
                  {analyticsData.monthMetrics.pendingCount}
                </p>
                <p className="mt-1 text-xs text-amber-600">awaiting payment</p>
              </div>
              <div className="rounded-lg bg-amber-200 p-3">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </Card>

          {/* Overdue */}
          <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="mt-2 text-3xl font-bold text-red-900">
                  {analyticsData.monthMetrics.overdueCount}
                </p>
                <p className="mt-1 text-xs text-red-600">requires action</p>
              </div>
              <div className="rounded-lg bg-red-200 p-3">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        {statusChartData.length > 0 && (
          <Card className="border-0 shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Invoice Status Distribution</h2>
              <p className="text-xs text-slate-600 mt-1">{monthName}</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Top Clients */}
        {topClientsData.length > 0 && (
          <Card className="border-0 shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Top Clients by Revenue</h2>
              <p className="text-xs text-slate-600 mt-1">{monthName}</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topClientsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Monthly Trend */}
      {trendData && trendData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="font-semibold text-slate-900">12-Month Revenue Trend</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earned"
                  stroke="#10b981"
                  name="Earned"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="invoiced"
                  stroke="#3b82f6"
                  name="Invoiced"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* All-Time Metrics */}
      {analyticsData && (
        <Card className="border-0 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="font-semibold text-slate-900">All-Time Metrics</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Total Earned</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{analyticsData.allTimeMetrics.totalEarned.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Total Invoiced</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{analyticsData.allTimeMetrics.totalInvoiced.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-900">
                  {analyticsData.allTimeMetrics.invoiceCount}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
