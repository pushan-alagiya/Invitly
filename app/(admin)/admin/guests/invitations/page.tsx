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
  Mail,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface Invitation {
  id: number;
  guestName: string;
  guestEmail: string;
  eventName: string;
  projectName: string;
  status:
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "confirmed"
    | "declined"
    | "bounced";
  sentDate: string;
  lastActivity: string;
  openCount: number;
  clickCount: number;
  templateUsed: string;
}

const mockInvitations: Invitation[] = [
  {
    id: 1,
    guestName: "John Smith",
    guestEmail: "john.smith@email.com",
    eventName: "Annual Tech Conference",
    projectName: "Tech Conference 2024",
    status: "confirmed",
    sentDate: "2024-02-15",
    lastActivity: "2024-02-16",
    openCount: 3,
    clickCount: 1,
    templateUsed: "Event Invitation",
  },
  {
    id: 2,
    guestName: "Sarah Johnson",
    guestEmail: "sarah.j@email.com",
    eventName: "Product Launch Party",
    projectName: "Mobile Apps Inc",
    status: "opened",
    sentDate: "2024-02-20",
    lastActivity: "2024-02-22",
    openCount: 2,
    clickCount: 0,
    templateUsed: "Event Invitation",
  },
  {
    id: 3,
    guestName: "Mike Davis",
    guestEmail: "mike.davis@email.com",
    eventName: "Team Building Workshop",
    projectName: "HR Solutions",
    status: "declined",
    sentDate: "2024-03-01",
    lastActivity: "2024-03-02",
    openCount: 1,
    clickCount: 1,
    templateUsed: "Event Invitation",
  },
  {
    id: 4,
    guestName: "Lisa Chen",
    guestEmail: "lisa.chen@email.com",
    eventName: "Marketing Summit",
    projectName: "Marketing Pro",
    status: "delivered",
    sentDate: "2024-03-05",
    lastActivity: "2024-03-05",
    openCount: 0,
    clickCount: 0,
    templateUsed: "Event Invitation",
  },
  {
    id: 5,
    guestName: "Alex Rodriguez",
    guestEmail: "alex.r@email.com",
    eventName: "Startup Networking",
    projectName: "Startup Hub",
    status: "bounced",
    sentDate: "2024-03-10",
    lastActivity: "2024-03-10",
    openCount: 0,
    clickCount: 0,
    templateUsed: "Event Invitation",
  },
];

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch =
      invitation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invitation.status === statusFilter;
    const matchesEvent =
      eventFilter === "all" || invitation.eventName === eventFilter;

    return matchesSearch && matchesStatus && matchesEvent;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "opened":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "clicked":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "sent":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "declined":
        return "bg-red-50 text-red-700 border-red-200";
      case "bounced":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const totalInvitations = invitations.length;
  const confirmedInvitations = invitations.filter(
    (i) => i.status === "confirmed"
  ).length;
  const pendingInvitations = invitations.filter((i) =>
    ["sent", "delivered", "opened"].includes(i.status)
  ).length;
  const declinedInvitations = invitations.filter(
    (i) => i.status === "declined"
  ).length;
  const bouncedInvitations = invitations.filter(
    (i) => i.status === "bounced"
  ).length;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invitation Status
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage guest invitation status
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvitations}</div>
              <p className="text-xs text-muted-foreground">All invitations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {confirmedInvitations}
              </div>
              <p className="text-xs text-muted-foreground">Attending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingInvitations}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Declined</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {declinedInvitations}
              </div>
              <p className="text-xs text-muted-foreground">Not attending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounced</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {bouncedInvitations}
              </div>
              <p className="text-xs text-muted-foreground">Delivery failed</p>
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
                  placeholder="Search invitations..."
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
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="Annual Tech Conference">
                    Annual Tech Conference
                  </SelectItem>
                  <SelectItem value="Product Launch Party">
                    Product Launch Party
                  </SelectItem>
                  <SelectItem value="Team Building Workshop">
                    Team Building Workshop
                  </SelectItem>
                  <SelectItem value="Marketing Summit">
                    Marketing Summit
                  </SelectItem>
                  <SelectItem value="Startup Networking">
                    Startup Networking
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Invitations</CardTitle>
            <CardDescription>
              {filteredInvitations.length} invitations found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invitation.guestName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invitation.guestEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {invitation.eventName}
                        </div>
                        <div className="text-muted-foreground">
                          {invitation.projectName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(invitation.status)}
                      >
                        {invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invitation.sentDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invitation.lastActivity).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {invitation.openCount} opens
                        </div>
                        <div className="text-muted-foreground">
                          {invitation.clickCount} clicks
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {invitation.templateUsed}
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
                          <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Remove Invitation
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
