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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Database,
  Mail,
  HardDrive,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Zap,
  Shield,
  Globe,
  Cpu,
  Memory,
  Network,
  Thermometer,
} from "lucide-react";

interface SystemStatus {
  name: string;
  status: "healthy" | "warning" | "error" | "offline";
  uptime: string;
  responseTime: number;
  lastCheck: string;
  details?: string;
}

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export default function AdminSystem() {
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
    });
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data
  useEffect(() => {
    const mockSystemStatuses: SystemStatus[] = [
      {
        name: "Database Server",
        status: "healthy",
        uptime: "99.9%",
        responseTime: 45,
        lastCheck: "2024-01-15T10:30:00Z",
        details: "MySQL 8.0.35 running smoothly",
      },
      {
        name: "Email Service",
        status: "healthy",
        uptime: "99.8%",
        responseTime: 120,
        lastCheck: "2024-01-15T10:30:00Z",
        details: "SMTP service operational",
      },
      {
        name: "File Storage",
        status: "warning",
        uptime: "98.5%",
        responseTime: 200,
        lastCheck: "2024-01-15T10:30:00Z",
        details: "Storage at 85% capacity",
      },
      {
        name: "API Gateway",
        status: "healthy",
        uptime: "99.7%",
        responseTime: 80,
        lastCheck: "2024-01-15T10:30:00Z",
        details: "All endpoints responding",
      },
      {
        name: "CDN Service",
        status: "healthy",
        uptime: "99.9%",
        responseTime: 25,
        lastCheck: "2024-01-15T10:30:00Z",
        details: "Global CDN operational",
      },
    ];

    const mockPerformanceMetrics: PerformanceMetrics = {
      cpu: 65,
      memory: 78,
      disk: 85,
      network: 45,
    };

    setSystemStatuses(mockSystemStatuses);
    setPerformanceMetrics(mockPerformanceMetrics);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMetricColor = (value: number) => {
    if (value < 50) return "text-green-600";
    if (value < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
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
                  System Health
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitor system performance and health status
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          {/* System Overview */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overall Health
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground">
                    System operational
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">99.7%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Services
                  </CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5/5</div>
                  <p className="text-xs text-muted-foreground">
                    All services running
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last Backup
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2 hours ago</div>
                  <p className="text-xs text-muted-foreground">
                    Automated backup
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Health Tabs */}
          <div className="px-4 lg:px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Services Status</CardTitle>
                      <CardDescription>
                        Real-time status of all system services
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {systemStatuses.map((service, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(service.status)}
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {service.details}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(service.status)}>
                                {service.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.responseTime}ms
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Current system resource usage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>CPU Usage</span>
                            <span
                              className={getMetricColor(performanceMetrics.cpu)}
                            >
                              {performanceMetrics.cpu}%
                            </span>
                          </div>
                          <Progress
                            value={performanceMetrics.cpu}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Memory Usage</span>
                            <span
                              className={getMetricColor(
                                performanceMetrics.memory
                              )}
                            >
                              {performanceMetrics.memory}%
                            </span>
                          </div>
                          <Progress
                            value={performanceMetrics.memory}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Disk Usage</span>
                            <span
                              className={getMetricColor(
                                performanceMetrics.disk
                              )}
                            >
                              {performanceMetrics.disk}%
                            </span>
                          </div>
                          <Progress
                            value={performanceMetrics.disk}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Network Usage</span>
                            <span
                              className={getMetricColor(
                                performanceMetrics.network
                              )}
                            >
                              {performanceMetrics.network}%
                            </span>
                          </div>
                          <Progress
                            value={performanceMetrics.network}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        CPU Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">CPU Performance Chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Memory className="h-5 w-5" />
                        Memory Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Memory Usage Chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Disk I/O
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Disk I/O Chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Service Status</CardTitle>
                    <CardDescription>
                      Comprehensive view of all system services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemStatuses.map((service, index) => (
                        <div key={index} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(service.status)}
                              <h3 className="text-lg font-semibold">
                                {service.name}
                              </h3>
                            </div>
                            <Badge className={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Uptime
                              </p>
                              <p className="text-lg font-semibold">
                                {service.uptime}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Response Time
                              </p>
                              <p className="text-lg font-semibold">
                                {service.responseTime}ms
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Last Check
                              </p>
                              <p className="text-sm">
                                {formatDate(service.lastCheck)}
                              </p>
                            </div>
                          </div>
                          {service.details && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                {service.details}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logs Tab */}
              <TabsContent value="logs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Logs</CardTitle>
                    <CardDescription>
                      Recent system events and logs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          level: "INFO",
                          message: "Database backup completed successfully",
                          time: "2024-01-15T10:30:00Z",
                        },
                        {
                          level: "WARNING",
                          message: "Storage usage at 85% - consider cleanup",
                          time: "2024-01-15T10:25:00Z",
                        },
                        {
                          level: "INFO",
                          message: "Email service restarted",
                          time: "2024-01-15T10:20:00Z",
                        },
                        {
                          level: "ERROR",
                          message: "Failed to connect to external API",
                          time: "2024-01-15T10:15:00Z",
                        },
                        {
                          level: "INFO",
                          message: "System health check completed",
                          time: "2024-01-15T10:10:00Z",
                        },
                      ].map((log, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                log.level === "ERROR"
                                  ? "bg-red-100"
                                  : log.level === "WARNING"
                                  ? "bg-yellow-100"
                                  : "bg-green-100"
                              }`}
                            >
                              <Activity
                                className={`h-4 w-4 ${
                                  log.level === "ERROR"
                                    ? "text-red-600"
                                    : log.level === "WARNING"
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{log.message}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(log.time)}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              log.level === "ERROR"
                                ? "bg-red-100 text-red-800"
                                : log.level === "WARNING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {log.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
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
