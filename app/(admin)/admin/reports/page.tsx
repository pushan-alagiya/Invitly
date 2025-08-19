"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Search,
  Eye,
  Mail,
  Printer,
} from "lucide-react";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("users");
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("summary");

  const mockUserReport = [
    {
      month: "Jan 2024",
      newUsers: 145,
      activeUsers: 1234,
      premiumUsers: 89,
      revenue: 8900,
    },
    {
      month: "Feb 2024",
      newUsers: 167,
      activeUsers: 1345,
      premiumUsers: 102,
      revenue: 10200,
    },
    {
      month: "Mar 2024",
      newUsers: 189,
      activeUsers: 1456,
      premiumUsers: 115,
      revenue: 11500,
    },
    {
      month: "Apr 2024",
      newUsers: 201,
      activeUsers: 1567,
      premiumUsers: 128,
      revenue: 12800,
    },
    {
      month: "May 2024",
      newUsers: 223,
      activeUsers: 1678,
      premiumUsers: 141,
      revenue: 14100,
    },
    {
      month: "Jun 2024",
      newUsers: 245,
      activeUsers: 1789,
      premiumUsers: 154,
      revenue: 15400,
    },
  ];

  const mockProjectReport = [
    { category: "Wedding", count: 456, revenue: 45600, avgGuests: 120 },
    { category: "Corporate", count: 234, revenue: 23400, avgGuests: 80 },
    { category: "Birthday", count: 345, revenue: 17250, avgGuests: 50 },
    { category: "Community", count: 199, revenue: 9950, avgGuests: 200 },
  ];

  const mockEventReport = [
    { status: "Completed", count: 1234, successRate: 94.2, avgRating: 4.5 },
    { status: "Ongoing", count: 89, successRate: 87.6, avgRating: 4.2 },
    { status: "Cancelled", count: 23, successRate: 0, avgRating: 0 },
    { status: "Upcoming", count: 567, successRate: 0, avgRating: 0 },
  ];

  const mockFinancialReport = [
    {
      month: "Jan 2024",
      revenue: 8900,
      expenses: 3200,
      profit: 5700,
      growth: "+12%",
    },
    {
      month: "Feb 2024",
      revenue: 10200,
      expenses: 3400,
      profit: 6800,
      growth: "+15%",
    },
    {
      month: "Mar 2024",
      revenue: 11500,
      expenses: 3600,
      profit: 7900,
      growth: "+16%",
    },
    {
      month: "Apr 2024",
      revenue: 12800,
      expenses: 3800,
      profit: 9000,
      growth: "+14%",
    },
    {
      month: "May 2024",
      revenue: 14100,
      expenses: 4000,
      profit: 10100,
      growth: "+12%",
    },
    {
      month: "Jun 2024",
      revenue: 15400,
      expenses: 4200,
      profit: 11200,
      growth: "+11%",
    },
  ];

  const handleExport = (type: string) => {
    // Simulate export functionality
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Reports & Analytics
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate and export comprehensive platform reports
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last 30 Days
                </Button>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              </div>
            </div>
          </div>

          {/* Report Filters */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Configure report parameters and filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary Report</SelectItem>
                        <SelectItem value="detailed">
                          Detailed Report
                        </SelectItem>
                        <SelectItem value="comparative">
                          Comparative Report
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Export Format</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Tabs */}
          <div className="px-4 lg:px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Financial
                </TabsTrigger>
              </TabsList>

              {/* Users Report Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8,567</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+12%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Users
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">6,234</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+8%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Premium Users
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2,345</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+15%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+20%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth Trend</CardTitle>
                      <CardDescription>
                        Monthly user registration and growth
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">User Growth Chart</p>
                          <p className="text-sm text-gray-400">
                            Chart component will be implemented
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Demographics</CardTitle>
                      <CardDescription>
                        User distribution by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            User Demographics Chart
                          </p>
                          <p className="text-sm text-gray-400">
                            Chart component will be implemented
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Monthly User Report</CardTitle>
                        <CardDescription>
                          Detailed monthly user statistics
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleExport("users")}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>New Users</TableHead>
                          <TableHead>Active Users</TableHead>
                          <TableHead>Premium Users</TableHead>
                          <TableHead>Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockUserReport.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {row.month}
                            </TableCell>
                            <TableCell>{row.newUsers}</TableCell>
                            <TableCell>{row.activeUsers}</TableCell>
                            <TableCell>{row.premiumUsers}</TableCell>
                            <TableCell>
                              ${row.revenue.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects Report Tab */}
              <TabsContent value="projects" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Projects
                      </CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,234</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+8%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Projects
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">987</div>
                      <p className="text-xs text-muted-foreground">
                        Currently running
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$96,200</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+12%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg Guests
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">89</div>
                      <p className="text-xs text-muted-foreground">
                        Per project
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Project Category Report</CardTitle>
                        <CardDescription>
                          Projects by category with revenue analysis
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleExport("projects")}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Avg Guests</TableHead>
                          <TableHead>Avg Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockProjectReport.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {row.category}
                            </TableCell>
                            <TableCell>{row.count}</TableCell>
                            <TableCell>
                              ${row.revenue.toLocaleString()}
                            </TableCell>
                            <TableCell>{row.avgGuests}</TableCell>
                            <TableCell>
                              ${(row.revenue / row.count).toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Events Report Tab */}
              <TabsContent value="events" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Events
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2,345</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+15%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Success Rate
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">94.2%</div>
                      <p className="text-xs text-muted-foreground">
                        Successfully completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg Rating
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.5/5</div>
                      <p className="text-xs text-muted-foreground">
                        User satisfaction
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Upcoming Events
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">567</div>
                      <p className="text-xs text-muted-foreground">
                        Scheduled events
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Event Status Report</CardTitle>
                        <CardDescription>
                          Events by status with success metrics
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleExport("events")}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Success Rate</TableHead>
                          <TableHead>Avg Rating</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockEventReport.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {row.status}
                            </TableCell>
                            <TableCell>{row.count}</TableCell>
                            <TableCell>{row.successRate}%</TableCell>
                            <TableCell>{row.avgRating}/5</TableCell>
                            <TableCell>
                              {((row.count / 1913) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Report Tab */}
              <TabsContent value="financial" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$82,900</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+13%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Expenses
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$22,200</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-red-600">+5%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Net Profit
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$60,700</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+16%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Profit Margin
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">73.2%</div>
                      <p className="text-xs text-muted-foreground">
                        Net profit margin
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Financial Performance Report</CardTitle>
                        <CardDescription>
                          Monthly financial metrics and growth
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleExport("financial")}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Expenses</TableHead>
                          <TableHead>Profit</TableHead>
                          <TableHead>Growth</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockFinancialReport.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {row.month}
                            </TableCell>
                            <TableCell>
                              ${row.revenue.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${row.expenses.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${row.profit.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-green-600">
                              {row.growth}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
