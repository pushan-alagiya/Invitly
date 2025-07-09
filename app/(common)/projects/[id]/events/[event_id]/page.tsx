/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BaseClient } from "@/api/ApiClient";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  UserPlus,
  UserMinus,
  Search,
  Clock,
  Tag,
  BarChart3,
  TrendingUp,
  Users2,
  CheckCircle,
  XCircle,
  AlertCircle,
  List,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { eventEndPoint, guestEndPoint } from "@/utils/apiEndPoints";
import { AddEventDialog } from "@/components/project/create_event";

// Types
interface EventDetails {
  id: number;
  project_id: number;
  name: string;
  description: string;
  long_description: string;
  start_date: string;
  end_date: string;
  location?: string | null;
  logo: string | null;
  type: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Guest {
  id: number;
  project_id: number;
  name: string;
  email: string;
  phone: string;
  family_members: number;
  expected_members: number;
  extra_info: {
    description: string;
  };
  created_at: string;
  updated_at: string;
  translated_name?: string;
}

interface EventGuestResponse {
  id: number;
  event_id: number;
  guest_id: number;
  expected_members: number;
  status: string | null;
  created_at: string;
  guest: {
    id: number;
    position: string | null;
    project_id: number;
    name: string;
    email: string;
    phone: string;
    family_members: number;
    expected_members: number;
    extra_info: {
      description: string;
    };
    created_at: string;
    updated_at: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

export default function Page() {
  const params = useParams();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [projectGuests, setProjectGuests] = useState<Guest[]>([]);
  const [eventGuests, setEventGuests] = useState<EventGuestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState<number | null>(null);
  const [searchProject, setSearchProject] = useState("");
  const [searchEvent, setSearchEvent] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      const response = await BaseClient.get<ApiResponse<EventDetails>>(
        `${eventEndPoint.getEventDetails}/${params.event_id}`
      );
      if (response?.data?.success) {
        setEventDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to load event details");
    }
  };

  // Fetch project guests
  const fetchProjectGuests = async () => {
    try {
      const response = await BaseClient.get<
        ApiResponse<{ rows: Guest[]; count: number }>
      >(`${guestEndPoint.getProjectGuests}/${params.id}`);
      if (response?.data?.success) {
        setProjectGuests(response.data.data.rows);
      }
    } catch (error) {
      console.error("Error fetching project guests:", error);
      toast.error("Failed to load project guests");
    }
  };

  // Fetch event guests
  const fetchEventGuests = async () => {
    try {
      const response = await BaseClient.get<
        ApiResponse<{
          count: number;
          rows: EventGuestResponse[];
        }>
      >(`${eventEndPoint.getEventGuests}/${params.event_id}/get-event-guests`);
      if (response?.data?.success) {
        setEventGuests(response.data.data.rows);
      }
    } catch (error) {
      console.error("Error fetching event guests:", error);
      toast.error("Failed to load event guests");
    }
  };

  // Add guest to event
  const addGuestToEvent = async (guestId: number) => {
    setTransferring(guestId);
    try {
      const response = await BaseClient.post<any>(
        `${eventEndPoint.addGuestToEvent}/add-event-guest/${guestId}`,
        {
          id: params.event_id,
        }
      );
      if (response?.data?.success) {
        toast.success("Guest added to event successfully");
        await fetchEventGuests();
        await fetchProjectGuests(); // Refresh to update available guests
      }
    } catch (error) {
      console.error("Error adding guest to event:", error);
      toast.error("Failed to add guest to event");
    } finally {
      setTransferring(null);
    }
  };

  // Remove guest from event
  const removeGuestFromEvent = async (guestId: number) => {
    setTransferring(guestId);
    try {
      const response = await BaseClient.post<any>(
        `${eventEndPoint.removeGuestFromEvent}/remove-event-guest/${guestId}`,
        {
          id: params.event_id,
        }
      );
      if (response?.data?.success) {
        toast.success("Guest removed from event successfully");
        await fetchEventGuests();
        await fetchProjectGuests(); // Refresh to update available guests
      }
    } catch (error) {
      console.error("Error removing guest from event:", error);
      toast.error("Failed to remove guest from event");
    } finally {
      setTransferring(null);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEventDetails(),
        fetchProjectGuests(),
        fetchEventGuests(),
      ]);
      setLoading(false);
    };

    if (params.event_id) {
      initializeData();
    }
  }, [params.event_id]);

  // Filtered guests
  const filteredProjectGuests = projectGuests.filter((guest) => {
    // Check if guest is already added to the event
    const isAlreadyInEvent = eventGuests.some(
      (eventGuest) => eventGuest.guest.id === guest.id
    );

    // Only show guests who are not already in the event
    if (isAlreadyInEvent) return false;

    // Apply search filter
    return (
      (guest.name?.toLowerCase() || "").includes(searchProject.toLowerCase()) ||
      (guest.email?.toLowerCase() || "").includes(searchProject.toLowerCase())
    );
  });

  const filteredEventGuests = eventGuests.filter((eventGuest) => {
    const matchesSearch =
      (eventGuest.guest.name?.toLowerCase() || "").includes(
        searchEvent.toLowerCase()
      ) ||
      (eventGuest.guest.email?.toLowerCase() || "").includes(
        searchEvent.toLowerCase()
      );
    // Note: RSVP status is not in the current API response, so we'll show all as pending for now
    const matchesFilter = filterStatus === "all" || filterStatus === "pending";
    return matchesSearch && matchesFilter;
  });

  // Analytics
  const totalGuests = eventGuests.length;
  // Since RSVP status is not in the current API response, we'll show all as pending
  const confirmedGuests = eventGuests.filter(
    (eventGuest) => eventGuest.status === "CONFIRMED"
  ).length;
  const pendingGuests = eventGuests.filter(
    (eventGuest) => eventGuest.status === "PENDING"
  ).length;
  const declinedGuests = eventGuests.filter(
    (eventGuest) => eventGuest.status === "DECLINED"
  ).length;
  const totalExpectedMembers = eventGuests.reduce(
    (sum, eventGuest) => sum + eventGuest.expected_members,
    0
  );

  if (loading) {
    return (
      <div>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Skeleton className="h-4 w-48" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Skeleton className="h-auto w-auto rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between px-4 w-full">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/projects/${params?.id}`}>
                    {params?.id}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {eventDetails?.name || "Event Details"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            <AddEventDialog
              isEditing={true}
              id={Number(params.event_id)}
              projectId={Number(params.id)}
              onUpdate={fetchEventDetails}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Event Information */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Event Details Card */}
          <Card className="md:col-span-2 justify-between">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {eventDetails?.logo ? (
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={eventDetails.logo}
                        alt={eventDetails.name}
                      />
                      <AvatarFallback className="text-2xl">
                        {eventDetails?.logo ||
                          eventDetails.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl">
                      {eventDetails?.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {eventDetails?.description || "No description available"}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    eventDetails?.status === "active" ? "default" : "secondary"
                  }
                >
                  {eventDetails?.status || "Unknown"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Event Date</p>
                    <p className="text-sm text-muted-foreground">
                      {eventDetails?.start_date &&
                        new Date(eventDetails.start_date).toLocaleDateString()}
                      {eventDetails?.end_date &&
                        eventDetails.end_date !== eventDetails.start_date &&
                        ` - ${new Date(
                          eventDetails.end_date
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {eventDetails?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {eventDetails.location}
                      </p>
                    </div>
                  </div>
                )}

                {eventDetails?.type && (
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">
                        {eventDetails.type}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {eventDetails?.createdAt &&
                        new Date(eventDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {eventDetails?.long_description && (
                  <div className="flex items-center gap-3 col-span-2">
                    <List className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Long Description</p>
                      <p className="text-sm text-muted-foreground">
                        {eventDetails.long_description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            {/* Template Creator Section */}
            <div className="flex justify-end p-6 ">
              <Button
                onClick={() => {
                  window.location.href = `/projects/${params.id}/events/${params.event_id}/template-creator`;
                }}
              >
                Go to Template Creator
              </Button>
            </div>
          </Card>

          {/* Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Guests</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {totalGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Confirmed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {confirmedGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {pendingGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Declined</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {declinedGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">
                      Expected Members
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {totalExpectedMembers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guest Transfer Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Management
            </CardTitle>
            <CardDescription>
              Transfer guests between project and event. Drag and drop or use
              the transfer buttons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Project Guests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Project Guests</h3>
                  <Badge variant="outline">
                    {filteredProjectGuests.length} available
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search project guests..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="h-96 overflow-y-auto rounded-lg border">
                  {filteredProjectGuests.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {filteredProjectGuests.map((guest) => (
                        <div
                          key={guest.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "text/plain",
                              guest.id.toString()
                            );
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt={guest.name} />
                              <AvatarFallback className="text-xs">
                                {(guest.name || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {guest.name || "Unnamed Guest"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {guest.email || "No email"}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addGuestToEvent(guest.id)}
                            disabled={transferring === guest.id}
                            className="ml-2"
                          >
                            {transferring === guest.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No project guests available
                    </div>
                  )}
                </div>
              </div>

              {/* Event Guests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Event Guests</h3>
                  <div className="flex items-center gap-2">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline">
                      {filteredEventGuests.length} guests
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search event guests..."
                    value={searchEvent}
                    onChange={(e) => setSearchEvent(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div
                  className="h-96 overflow-y-auto rounded-lg border border-dashed border-muted-foreground/25"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const guestId = parseInt(
                      e.dataTransfer.getData("text/plain")
                    );
                    addGuestToEvent(guestId);
                  }}
                >
                  {filteredEventGuests.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {filteredEventGuests.map((eventGuest) => (
                        <div
                          key={eventGuest.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt={eventGuest.guest.name} />
                              <AvatarFallback className="text-xs">
                                {(eventGuest.guest.name || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {eventGuest.guest.name || "Unnamed Guest"}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {eventGuest.guest.email || "No email"}
                              </p>
                              {eventGuest.guest.expected_members > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  +{eventGuest.guest.expected_members - 1}{" "}
                                  family members
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={eventGuest.status || "PENDING"}
                                onValueChange={async (newStatus) => {
                                  try {
                                    const response = await BaseClient.post<any>(
                                      `${eventEndPoint.updateEventExpectedMembers}/${eventDetails?.id}`,
                                      {
                                        guestId: eventGuest.guest_id,
                                        status: newStatus,
                                      }
                                    );
                                    if (response?.data?.success) {
                                      toast.success(
                                        "Guest status updated successfully"
                                      );
                                      await fetchEventGuests();
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error updating guest status:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to update guest status"
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="CONFIRMED">
                                    Confirmed
                                  </SelectItem>
                                  <SelectItem value="DECLINED">
                                    Declined
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center h-8 gap-2 shadow-full rounded-md ">
                              <Input
                                type="number"
                                min={1}
                                max={eventGuest.guest.family_members + 1}
                                defaultValue={eventGuest.guest.expected_members}
                                onChange={(e) => {
                                  const updatedValue = parseInt(
                                    e.target.value,
                                    10
                                  );
                                  if (
                                    !isNaN(updatedValue) &&
                                    updatedValue > 0
                                  ) {
                                    eventGuest.guest.expected_members =
                                      updatedValue;
                                  }
                                }}
                                className="w-20 border-0 shadow-unset focus:ring-0"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-0 shadow-unset focus:ring-0"
                                onClick={async () => {
                                  try {
                                    const response = await BaseClient.post<any>(
                                      `${eventEndPoint.updateEventExpectedMembers}/${eventDetails?.id}`,
                                      {
                                        guestId: eventGuest.guest_id,
                                        expectedMembers:
                                          eventGuest.guest.expected_members,
                                      }
                                    );
                                    if (response?.data?.success) {
                                      toast.success(
                                        "Expected members updated successfully"
                                      );
                                      await fetchEventGuests();
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error updating expected members:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to update expected members"
                                    );
                                  }
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                removeGuestFromEvent(eventGuest.guest_id)
                              }
                              disabled={transferring === eventGuest.guest_id}
                            >
                              {transferring === eventGuest.guest_id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No event guests yet</p>
                        <p className="text-sm">
                          Drag guests from the left or use the transfer buttons
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
