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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Heart,
  Star,
  Activity,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  owner: string;
  status: "active" | "completed" | "archived" | "draft";
  category: string;
  startDate: string;
  endDate: string;
  eventsCount: number;
  guestsCount: number;
  teamMembers: number;
  createdAt: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Mock data
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: 1,
        name: "Wedding Planner Pro",
        description: "Comprehensive wedding planning and management system",
        owner: "John Doe",
        status: "active",
        category: "Wedding",
        startDate: "2024-01-01",
        endDate: "2024-06-15",
        eventsCount: 5,
        guestsCount: 150,
        teamMembers: 8,
        createdAt: "2023-12-01",
      },
      {
        id: 2,
        name: "Corporate Conference 2024",
        description: "Annual corporate conference with 500+ attendees",
        owner: "Jane Smith",
        status: "active",
        category: "Corporate",
        startDate: "2024-03-01",
        endDate: "2024-03-15",
        eventsCount: 3,
        guestsCount: 500,
        teamMembers: 12,
        createdAt: "2023-11-15",
      },
      {
        id: 3,
        name: "Birthday Bash Extravaganza",
        description: "Special birthday celebration planning",
        owner: "Mike Johnson",
        status: "completed",
        category: "Birthday",
        startDate: "2023-12-20",
        endDate: "2023-12-25",
        eventsCount: 1,
        guestsCount: 50,
        teamMembers: 3,
        createdAt: "2023-11-20",
      },
      {
        id: 4,
        name: "Tech Startup Launch",
        description: "Product launch event for new tech startup",
        owner: "Sarah Wilson",
        status: "draft",
        category: "Corporate",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        eventsCount: 0,
        guestsCount: 0,
        teamMembers: 5,
        createdAt: "2024-01-10",
      },
      {
        id: 5,
        name: "Community Festival",
        description: "Annual community festival with local vendors",
        owner: "David Brown",
        status: "active",
        category: "Community",
        startDate: "2024-05-01",
        endDate: "2024-05-05",
        eventsCount: 8,
        guestsCount: 1000,
        teamMembers: 20,
        createdAt: "2023-10-01",
      },
    ];
    setProjects(mockProjects);
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || project.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Wedding":
        return "bg-pink-100 text-pink-800";
      case "Corporate":
        return "bg-blue-100 text-blue-800";
      case "Birthday":
        return "bg-purple-100 text-purple-800";
      case "Community":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                  Project Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitor and manage all platform projects
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          </div>

          {/* Project Statistics */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Projects
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.filter((p) => p.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently running
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
                    {projects.reduce((sum, p) => sum + p.eventsCount, 0)}
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
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.guestsCount, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all events
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Project Management Tabs */}
          <div className="px-4 lg:px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project List</CardTitle>
                    <CardDescription>
                      Search and filter projects by various criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-1 items-center space-x-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search projects by name, description, or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Filter className="h-4 w-4" />
                              Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>
                              Filter by Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setStatusFilter("all")}
                            >
                              All Statuses
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStatusFilter("active")}
                            >
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStatusFilter("completed")}
                            >
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStatusFilter("draft")}
                            >
                              Draft
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Building2 className="h-4 w-4" />
                              Category
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>
                              Filter by Category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setCategoryFilter("all")}
                            >
                              All Categories
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCategoryFilter("Wedding")}
                            >
                              Wedding
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCategoryFilter("Corporate")}
                            >
                              Corporate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCategoryFilter("Birthday")}
                            >
                              Birthday
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCategoryFilter("Community")}
                            >
                              Community
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Events</TableHead>
                          <TableHead>Guests</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Timeline</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {project.name}
                                </div>
                                <div className="text-sm text-muted-foreground max-w-xs truncate">
                                  {project.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {project.owner}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getCategoryColor(project.category)}
                              >
                                {project.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {project.eventsCount}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {project.guestsCount}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {project.teamMembers}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                <div>{formatDate(project.startDate)}</div>
                                <div>to {formatDate(project.endDate)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Project
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Team
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    View Events
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Project
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
