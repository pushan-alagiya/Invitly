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
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Calendar,
} from "lucide-react";

interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  project: string;
  event: string;
  status: "confirmed" | "pending" | "declined" | "invited";
  invitationSent: string;
  lastResponse: string;
  location: string;
  expectedGuests: number;
  familyMembers: number;
}

const mockGuests: Guest[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0123",
    project: "Tech Conference 2024",
    event: "Annual Tech Conference",
    status: "confirmed",
    invitationSent: "2024-02-15",
    lastResponse: "2024-02-16",
    location: "San Francisco, CA",
    expectedGuests: 1,
    familyMembers: 0,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1-555-0124",
    project: "Product Launch",
    event: "Mobile App Launch",
    status: "pending",
    invitationSent: "2024-02-20",
    lastResponse: "",
    location: "New York, NY",
    expectedGuests: 2,
    familyMembers: 1,
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "+1-555-0125",
    project: "HR Solutions",
    event: "Team Building Workshop",
    status: "declined",
    invitationSent: "2024-03-01",
    lastResponse: "2024-03-02",
    location: "Austin, TX",
    expectedGuests: 0,
    familyMembers: 0,
  },
  {
    id: 4,
    name: "Lisa Chen",
    email: "lisa.chen@email.com",
    phone: "+1-555-0126",
    project: "Marketing Pro",
    event: "Marketing Summit",
    status: "confirmed",
    invitationSent: "2024-01-10",
    lastResponse: "2024-01-12",
    location: "Chicago, IL",
    expectedGuests: 1,
    familyMembers: 0,
  },
  {
    id: 5,
    name: "Alex Rodriguez",
    email: "alex.r@email.com",
    phone: "+1-555-0127",
    project: "Startup Hub",
    event: "Startup Networking",
    status: "invited",
    invitationSent: "2024-04-01",
    lastResponse: "",
    location: "Seattle, WA",
    expectedGuests: 1,
    familyMembers: 0,
  },
];

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || guest.status === statusFilter;
    const matchesProject =
      projectFilter === "all" || guest.project === projectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "declined":
        return "bg-red-50 text-red-700 border-red-200";
      case "invited":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const totalGuests = guests.length;
  const confirmedGuests = guests.filter((g) => g.status === "confirmed").length;
  const pendingGuests = guests.filter((g) => g.status === "pending").length;
  const declinedGuests = guests.filter((g) => g.status === "declined").length;
  const totalExpected = guests.reduce(
    (sum, guest) => sum + guest.expectedGuests,
    0
  );

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Guest Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all guests across events and projects
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Guests
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGuests}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {confirmedGuests}
              </div>
              <p className="text-xs text-muted-foreground">Attending events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingGuests}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Expected Attendance
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExpected}</div>
              <p className="text-xs text-muted-foreground">
                Including family members
              </p>
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
                  placeholder="Search guests..."
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
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="Tech Conference 2024">
                    Tech Conference 2024
                  </SelectItem>
                  <SelectItem value="Product Launch">Product Launch</SelectItem>
                  <SelectItem value="HR Solutions">HR Solutions</SelectItem>
                  <SelectItem value="Marketing Pro">Marketing Pro</SelectItem>
                  <SelectItem value="Startup Hub">Startup Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guests Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Guests</CardTitle>
            <CardDescription>
              {filteredGuests.length} guests found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Project & Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Invitation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{guest.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {guest.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{guest.email}</div>
                        <div className="text-muted-foreground">
                          {guest.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{guest.project}</div>
                        <div className="text-muted-foreground">
                          {guest.event}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{guest.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(guest.status)}
                      >
                        {guest.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {guest.expectedGuests} expected
                        </div>
                        {guest.familyMembers > 0 && (
                          <div className="text-muted-foreground">
                            +{guest.familyMembers} family
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          Sent:{" "}
                          {new Date(guest.invitationSent).toLocaleDateString()}
                        </div>
                        {guest.lastResponse && (
                          <div className="text-muted-foreground">
                            Response:{" "}
                            {new Date(guest.lastResponse).toLocaleDateString()}
                          </div>
                        )}
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
                          <DropdownMenuItem>Edit Guest</DropdownMenuItem>
                          <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Remove Guest
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
