"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Building2,
  UserPlus,
  Mail,
  Activity,
  Clock,
  DollarSign,
  Globe,
  PieChart,
  LineChart,
} from "lucide-react";

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive platform analytics and insights
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </div>
          </div>

          {/* Analytics Tabs */}
          <div className="px-4 lg:px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
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
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Key Performance Indicators */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231.89</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+20.1%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+2,350</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+180.1%</span> from
                        last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Event Success Rate
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">98.5%</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+2.1%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Email Delivery Rate
                      </CardTitle>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">99.2%</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+0.5%</span> from last
                        month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>
                        Monthly user registration trends
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
                      <CardTitle>Revenue Distribution</CardTitle>
                      <CardDescription>
                        Revenue breakdown by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            Revenue Distribution Chart
                          </p>
                          <p className="text-sm text-gray-400">
                            Chart component will be implemented
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Platform Activity</CardTitle>
                    <CardDescription>
                      Latest activities across the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          action: "New user registered",
                          user: "john.doe@example.com",
                          time: "2 minutes ago",
                          type: "user",
                        },
                        {
                          action: "Project created",
                          user: "Project: Wedding Planner",
                          time: "5 minutes ago",
                          type: "project",
                        },
                        {
                          action: "Event scheduled",
                          user: "Event: Annual Conference",
                          time: "10 minutes ago",
                          type: "event",
                        },
                        {
                          action: "Email sent",
                          user: "Invitation batch sent",
                          time: "15 minutes ago",
                          type: "email",
                        },
                        {
                          action: "Guest confirmed",
                          user: "Sarah Johnson confirmed",
                          time: "20 minutes ago",
                          type: "guest",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                activity.type === "user"
                                  ? "bg-blue-100"
                                  : activity.type === "project"
                                  ? "bg-green-100"
                                  : activity.type === "event"
                                  ? "bg-purple-100"
                                  : activity.type === "email"
                                  ? "bg-orange-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Activity
                                className={`h-4 w-4 ${
                                  activity.type === "user"
                                    ? "text-blue-600"
                                    : activity.type === "project"
                                    ? "text-green-600"
                                    : activity.type === "event"
                                    ? "text-purple-600"
                                    : activity.type === "email"
                                    ? "text-orange-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-sm text-muted-foreground">
                                {activity.user}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {activity.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>New Users (30 days)</span>
                          <span className="font-bold text-green-600">
                            +1,234
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Users</span>
                          <span className="font-bold">8,567</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Premium Users</span>
                          <span className="font-bold text-blue-600">2,345</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Churn Rate</span>
                          <span className="font-bold text-red-600">2.1%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Engagement Chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top User Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            activity: "Project Creation",
                            count: 456,
                            trend: "+12%",
                          },
                          {
                            activity: "Event Planning",
                            count: 234,
                            trend: "+8%",
                          },
                          {
                            activity: "Guest Management",
                            count: 789,
                            trend: "+15%",
                          },
                          {
                            activity: "Email Sending",
                            count: 1234,
                            trend: "+5%",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">{item.activity}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{item.count}</span>
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                {item.trend}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Project Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Projects</span>
                          <span className="font-bold">1,234</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Projects</span>
                          <span className="font-bold text-green-600">987</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed Projects</span>
                          <span className="font-bold text-blue-600">234</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Duration</span>
                          <span className="font-bold">45 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Project Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { category: "Weddings", count: 456, percentage: 37 },
                          {
                            category: "Corporate Events",
                            count: 234,
                            percentage: 19,
                          },
                          {
                            category: "Birthday Parties",
                            count: 345,
                            percentage: 28,
                          },
                          { category: "Other", count: 199, percentage: 16 },
                        ].map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{item.category}</span>
                              <span className="font-bold">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Project Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Performance Chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Event Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Events</span>
                          <span className="font-bold">2,345</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upcoming Events</span>
                          <span className="font-bold text-blue-600">567</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed Events</span>
                          <span className="font-bold text-green-600">
                            1,678
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Guests</span>
                          <span className="font-bold">89</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Event Success Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            status: "Successfully Completed",
                            rate: 94.2,
                            color: "text-green-600",
                          },
                          {
                            status: "Partially Successful",
                            rate: 4.1,
                            color: "text-yellow-600",
                          },
                          {
                            status: "Cancelled",
                            rate: 1.7,
                            color: "text-red-600",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">{item.status}</span>
                            <span className={`font-bold ${item.color}`}>
                              {item.rate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Event Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <LineChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Event Trends Chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
