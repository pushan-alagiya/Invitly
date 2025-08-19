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
import { Skeleton } from "@/components/ui/skeleton";
import {
  eventEndPoint,
  guestEndPoint,
  templateEndPoint,
} from "@/utils/apiEndPoints";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AddEventDialog } from "@/components/project/create_event";
import { GalleryVerticalEnd, FileText, Edit3, Star, Plus } from "lucide-react";
import { DeleteEventDialog } from "@/components/project/delete_event";
import { GuestTable } from "@/components/project/guest_table";
import { AddGuestDialog } from "@/components/project/add_guest";
import { Badge } from "@/components/ui/badge";

export type EventInterface = {
  id: number;
  project_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location?: string | null;
  logo: string | null;
  status: "planning" | "active" | "inactive" | "completed";
};

export type GuestInterface = {
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
};

interface GetEventsInterface {
  success: boolean;
  data: {
    rows: EventInterface[];
    count: number;
  };
  message: string;
  code: number;
}

interface GetGuestsInterface {
  success: boolean;
  data: {
    rows: GuestInterface[];
    count: number;
  };
  message: string;
  code: number;
}

interface Template {
  id: number;
  project_id: number;
  event_id: number;
  name: string;
  template_data: any;
  version: string;
  status: string;
  is_default: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  event?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [recentEvents, setRecentEvents] = useState<{
    rows: EventInterface[];
    count: number;
  }>({
    rows: [],
    count: 0,
  });

  const [recentEventLoading, setRecentEventLoading] = useState<boolean>(false);

  const [guests, setGuests] = useState<{
    rows: GuestInterface[];
    count: number;
  }>({
    rows: [],
    count: 0,
  });

  const [guestsLoading, setGuestsLoading] = useState<boolean>(false);

  // Template state
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setRecentEventLoading(true);
        const events = await BaseClient.get<GetEventsInterface>(
          `${eventEndPoint.getRecentEvents}/${params?.id}`
        );

        if (events?.data?.success) {
          setRecentEvents(events?.data?.data);
        } else {
          console.error("Error fetching events: ", events);
        }
      } catch (error) {
        console.error("Error fetching events: ", error);
      } finally {
        setRecentEventLoading(false);
      }
    };

    if (params?.id) {
      fetchRecentEvents();
      fetchGuests();
      fetchRecentTemplates();
    }
  }, [params?.id]);

  const fetchGuests = async () => {
    setGuestsLoading(true);
    try {
      const response = await BaseClient.get<GetGuestsInterface>(
        `${guestEndPoint.getProjectGuests}/${params?.id}`
      );
      if (response?.data?.success) {
        // Handle both cases: when guests exist and when the list is empty
        const guestData = response.data.data;
        if (guestData && guestData.rows) {
          setGuests(guestData);
        } else {
          // Set empty guests structure when no guests exist
          setGuests({ rows: [], count: 0 });
        }
      } else {
        // Set empty guests structure when API returns success: false
        setGuests({ rows: [], count: 0 });
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      // Set empty guests structure on error
      setGuests({ rows: [], count: 0 });
    } finally {
      setGuestsLoading(false);
    }
  };

  const fetchRecentTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await BaseClient.get<any>(
        `${templateEndPoint.getRecentProjectTemplates}/${params?.id}/recent`
      );
      if (response?.data?.success) {
        // Handle both cases: when templates exist and when the list is empty
        const templateData = response.data.data;
        if (templateData && Array.isArray(templateData)) {
          setRecentTemplates(templateData);
        } else {
          // Set empty templates array when no templates exist
          setRecentTemplates([]);
        }
      } else {
        // Set empty templates array when API returns success: false
        setRecentTemplates([]);
      }
    } catch (error) {
      console.error("Error fetching recent templates:", error);
      // Set empty templates array on error
      setRecentTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleGuestUpdate = () => {
    fetchGuests();
  };

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between px-4 w-full">
          <div className="flex items-center gap-2">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <div className="ml-4"></div>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{params?.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <AddEventDialog projectId={Number(params?.id)} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-2">
        {recentEvents?.count > 0 ? (
          <div className="relative w-full h-[330px]">
            {/* Horizontal timeline line */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            <div className="absolute inset-0 flex gap-4 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
              {recentEvents?.rows?.map((event) => (
                <div
                  key={event.id}
                  className="relative mt-8 min-w-[280px] max-w-[280px] md:min-w-[300px] md:max-w-[300px] lg:min-w-[320px] lg:max-w-[320px] flex-shrink-0 snap-center"
                >
                  {/* Timeline dot */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20" />

                  {/* add a line that connects dot and card */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-primary/20" />

                  <Card className="w-full bg-gradient-to-br from-secondary/10 via-white to-primary/10 h-full hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pt-4">
                      {/* show the logo */}
                      <div className="flex items-center gap-2">
                        {event?.logo ? (
                          event.logo.includes("http") ? (
                            <Image
                              src={event.logo}
                              alt={event.name}
                              width={400}
                              height={128}
                              className="w-32 h-32 object-cover rounded-t"
                            />
                          ) : (
                            <div className="text-xl">{event.logo}</div>
                          )
                        ) : (
                          <GalleryVerticalEnd className="size-6" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <CardTitle className="text-primary text-lg line-clamp-1">
                          {event.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardDescription className="px-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-calendar"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span className="line-clamp-1">
                          {new Date(event.start_date).toLocaleDateString()} -{" "}
                          {new Date(event.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-black/80 line-clamp-2 mt-2">
                        {event.description || "No description available"}
                      </div>
                    </CardDescription>
                    <CardFooter className="flex justify-between px-4">
                      <div className="flex items-center justify-center gap-2">
                        <AddEventDialog
                          isEditing={true}
                          id={event.id}
                          projectId={Number(params?.id)}
                        />
                        <DeleteEventDialog eventId={event.id} />
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="hover:scale-105 transition-transform duration-200"
                        onClick={() => {
                          router.push(
                            `/projects/${params?.id}/events/${event.id}`
                          );
                        }}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : recentEventLoading ? (
          <div className="flex flex-1 flex-col gap-4">
            <div className="relative w-full h-[330px]">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              <div className="absolute inset-0 flex gap-4 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="relative mt-8 min-w-[280px] max-w-[280px] md:min-w-[300px] md:max-w-[300px] lg:min-w-[320px] lg:max-w-[320px] flex-shrink-0 snap-center"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/20 ring-4 ring-primary/10" />

                    {/* Connecting line */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-primary/10" />

                    <Card className="w-full bg-gradient-to-br from-secondary/10 via-white to-primary/10 h-full">
                      <CardHeader className="pt-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-8 h-8 rounded-t bg-primary/10" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-6 w-3/4 bg-primary/10" />
                        </div>
                      </CardHeader>
                      <CardDescription className="px-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 bg-primary/10" />
                          <Skeleton className="h-4 w-32 bg-primary/10" />
                        </div>
                        <div className="mt-2">
                          <Skeleton className="h-4 w-full bg-primary/10" />
                          <Skeleton className="h-4 w-2/3 mt-1 bg-primary/10" />
                        </div>
                      </CardDescription>
                      <CardFooter className="flex justify-between px-4">
                        <Skeleton className="h-8 w-8 rounded-md bg-primary/10" />
                        <Skeleton className="h-8 w-24 bg-primary/10" />
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-lg font-semibold text-muted">
              No Recent Projects
            </p>
          </div>
        )}
      </div>

      <Separator className="px-6" />
      {/* Project Recent Templates */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Recent Templates</h2>
          </div>

          {templatesLoading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-lg font-semibold text-muted">
                Loading templates...
              </p>
            </div>
          ) : recentTemplates.length > 0 ? (
            <div className="space-y-3">
              {recentTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1 sm:mt-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="text-sm font-medium truncate">
                          {template.name}
                        </h4>
                        {template.is_default && (
                          <Badge
                            variant="default"
                            className="text-xs px-1 py-0"
                          >
                            <Star className="h-2.5 w-2.5 mr-1" />
                            Default
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {template.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">
                            v{template.version}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">
                            {template.template_data?.pages?.length || 0}
                          </span>
                          <span>pages</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">
                            {template.template_data?.pages?.reduce(
                              (total: number, page: any) =>
                                total + (page.objects?.length || 0),
                              0
                            ) || 0}
                          </span>
                          <span>objects</span>
                        </span>
                        {template.event && (
                          <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                            <span className="font-medium">Event:</span>
                            <span className="truncate">
                              {template.event.name}
                            </span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                          <span className="font-medium">
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                    {template.creator && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        by {template.creator.name}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        window.location.href = `/projects/${params.id}/events/${template.event_id}/template-creator?templateId=${template.id}`;
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <h3 className="text-sm font-medium mb-1">No templates yet</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Create your first invitation template to get started.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  window.location.href = `/projects/${params.id}`;
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      </div>

      <Separator className="px-6" />

      <div className="flex flex-1 flex-col gap-4 p-6 ">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Guests</h2>
            <div className="flex gap-2 items-center">
              <AddGuestDialog
                projectId={Number(params?.id)}
                onGuestAdded={handleGuestUpdate}
              />
            </div>
          </div>

          {guestsLoading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-lg font-semibold text-muted">
                Loading guests...
              </p>
            </div>
          ) : guests?.count > 0 ? (
            <GuestTable
              projectId={Number(params?.id)}
              guests={guests.rows}
              onGuestUpdate={handleGuestUpdate}
              language="en"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-lg font-semibold text-muted">
                No guests found
              </p>
              <p className="text-sm text-muted-foreground">
                Add your first guest using the button above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
