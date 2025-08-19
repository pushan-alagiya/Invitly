/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BaseClient } from "@/api/ApiClient";
import { adminEndPoint } from "@/utils/apiEndPoints";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  Users,
  Building2,
  Calendar,
  UserPlus,
  Mail,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalEvents: number;
  totalGuests: number;
  activeUsers: number;
  activeProjects: number;
  confirmedInvitations: number;
  declinedInvitations: number;
  totalEmailsSent: number;
  platformGrowth: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  status: string;
}

interface SystemHealth {
  database: string;
  email: string;
  storage: string;
  api: string;
  uptime: string;
  lastBackup: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const { userDetails } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchAdminData();
  }, [userDetails]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Direct authentication and admin role check
      if (!userDetails?.user || !userDetails?.token) {
        console.log("No user details or token found, redirecting to login");
        window.location.href = "/login";
        return;
      }

      const isAdmin = userDetails.user.roles?.some(
        (role: string | { role?: string; role_name?: string }) =>
          (typeof role === "string" && role === "ADMIN") ||
          (typeof role === "object" &&
            (role.role === "ADMIN" || role.role_name === "ADMIN"))
      );

      if (!isAdmin) {
        console.log("User is not admin, redirecting to login");
        window.location.href = "/login";
        return;
      }

      console.log("Fetching admin data with token:", userDetails.token);
      console.log("User details:", userDetails);

      const [statsResponse, activityResponse, healthResponse] =
        await Promise.all([
          BaseClient.get<any>(adminEndPoint.getStats),
          BaseClient.get<any>(adminEndPoint.getActivity),
          BaseClient.get<any>(adminEndPoint.getHealth),
        ]);

      console.log("Stats response:", statsResponse);
      console.log("Activity response:", activityResponse);
      console.log("Health response:", healthResponse);

      if (statsResponse?.data?.code === 200) {
        setStats(statsResponse.data.data);
      }

      if (activityResponse?.data?.code === 200) {
        setActivity(activityResponse.data.data);
      }

      if (healthResponse?.data?.code === 200) {
        setHealth(healthResponse.data.data);
      }
    } catch (error: unknown) {
      console.error("Error fetching admin data:", error);

      // Handle specific error responses
      if (
        (error as any)?.response?.status === 401 ||
        (error as any)?.response?.status === 403
      ) {
        toast.error("Access denied. Please log in as admin.");
        return;
      }

      toast.error("Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
      case "active":
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "warning":
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "error":
      case "offline":
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage all platform activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.activeUsers || 0} active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalProjects || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats?.activeProjects || 0} active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalEvents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Guests
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalGuests || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered across events
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Statistics */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Statistics
              </CardTitle>
              <CardDescription>
                Invitation and communication metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.confirmedInvitations || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Confirmed Invitations
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.declinedInvitations || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Declined Invitations
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.totalEmailsSent || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Emails Sent
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.platformGrowth || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Platform Growth
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Growth
              </CardTitle>
              <CardDescription>
                Monthly growth and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Growth</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    +{stats?.platformGrowth || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project Creation</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    +{Math.floor((stats?.platformGrowth || 0) * 0.8)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Event Engagement</span>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700"
                  >
                    +{Math.floor((stats?.platformGrowth || 0) * 1.2)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Health */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health?.database === "online"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm">Database</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(health?.database || "offline")}
                >
                  {health?.database || "Offline"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health?.email === "online" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm">Email Service</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(health?.email || "offline")}
                >
                  {health?.email || "Offline"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health?.storage === "online" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm">Storage</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(health?.storage || "offline")}
                >
                  {health?.storage || "Offline"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health?.api === "online" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm">API</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(health?.api || "offline")}
                >
                  {health?.api || "Offline"}
                </Badge>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm text-muted-foreground">Uptime:</span>
                <span className="text-sm ml-2">{health?.uptime || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Last Backup:
                </span>
                <span className="text-sm ml-2">
                  {health?.lastBackup || "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest platform activities and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length > 0 ? (
                activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.type === "user" && (
                        <Users className="h-4 w-4 text-blue-500" />
                      )}
                      {item.type === "project" && (
                        <Building2 className="h-4 w-4 text-green-500" />
                      )}
                      {item.type === "event" && (
                        <Calendar className="h-4 w-4 text-purple-500" />
                      )}
                      {item.type === "guest" && (
                        <UserPlus className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {item.user} • {item.timestamp}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(item.status)}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
