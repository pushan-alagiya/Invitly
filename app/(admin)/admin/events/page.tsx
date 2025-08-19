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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  MapPin,
  Clock,
  Building2,
  CheckCircle,
} from "lucide-react";

interface Event {
  id: number;
  name: string;
  description: string;
  project: string;
  owner: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  guestCount: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  category: string;
}

const mockEvents: Event[] = [
  {
    id: 1,
    name: "Annual Tech Conference 2024",
    description: "Largest technology conference in the region",
    project: "Tech Events Corp",
    owner: "John Smith",
    location: "San Francisco, CA",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    status: "upcoming",
    guestCount: 500,
    confirmedGuests: 320,
    pendingGuests: 150,
    declinedGuests: 30,
    category: "Technology",
  },
  {
    id: 2,
    name: "Product Launch Party",
    description: "Launch of new mobile application",
    project: "Mobile Apps Inc",
    owner: "Sarah Johnson",
    location: "New York, NY",
    startDate: "2024-02-28",
    endDate: "2024-02-28",
    status: "completed",
    guestCount: 200,
    confirmedGuests: 180,
    pendingGuests: 0,
    declinedGuests: 20,
    category: "Product Launch",
  },
  {
    id: 3,
    name: "Team Building Workshop",
    description: "Annual team building and training session",
    project: "HR Solutions",
    owner: "Mike Davis",
    location: "Austin, TX",
    startDate: "2024-04-10",
    endDate: "2024-04-12",
    status: "upcoming",
    guestCount: 75,
    confirmedGuests: 45,
    pendingGuests: 25,
    declinedGuests: 5,
    category: "Corporate",
  },
  {
    id: 4,
    name: "Marketing Summit",
    description: "Digital marketing trends and strategies",
    project: "Marketing Pro",
    owner: "Lisa Chen",
    location: "Chicago, IL",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    status: "completed",
    guestCount: 300,
    confirmedGuests: 280,
    pendingGuests: 0,
    declinedGuests: 20,
    category: "Marketing",
  },
  {
    id: 5,
    name: "Startup Networking Event",
    description: "Networking event for startup founders",
    project: "Startup Hub",
    owner: "Alex Rodriguez",
    location: "Seattle, WA",
    startDate: "2024-05-05",
    endDate: "2024-05-05",
    status: "upcoming",
    guestCount: 150,
    confirmedGuests: 90,
    pendingGuests: 55,
    declinedGuests: 5,
    category: "Networking",
  },
];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || event.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ongoing":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => e.status === "upcoming").length;
  const completedEvents = events.filter((e) => e.status === "completed").length;
  const totalGuests = events.reduce((sum, event) => sum + event.guestCount, 0);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Event Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all events across the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Events
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {upcomingEvents}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Events
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedEvents}
              </div>
              <p className="text-xs text-muted-foreground">Past events</p>
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
              <div className="text-2xl font-bold">{totalGuests}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Product Launch">Product Launch</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              {filteredEvents.length} events found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {event.project}
                      </div>
                    </TableCell>
                    <TableCell>{event.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        {event.startDate !== event.endDate && (
                          <div className="text-muted-foreground">
                            to {new Date(event.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(event.status)}
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {event.guestCount} total
                        </div>
                        <div className="text-muted-foreground">
                          {event.confirmedGuests} confirmed
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Event</DropdownMenuItem>
                          <DropdownMenuItem>Manage Guests</DropdownMenuItem>
                          <DropdownMenuItem>Send Invitations</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete Event
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
      </div>
    </div>
  );
}
