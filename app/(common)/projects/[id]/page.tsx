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
import { eventEndPoint, guestEndPoint } from "@/utils/apiEndPoints";
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
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { resetEvent } from "@/store/slices/event";
import { useDispatch } from "react-redux";
import { GalleryVerticalEnd } from "lucide-react";
import { DeleteEventDialog } from "@/components/project/delete_event";
import { GuestTable } from "@/components/project/guest_table";
import { AddGuestDialog } from "@/components/project/add_guest";

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

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
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

  const eventChanged = useSelector(
    (state: RootState) => state.event.eventChanged
  );

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

    fetchRecentEvents();

    dispatch(resetEvent());
  }, [eventChanged, params?.id]);

  const fetchGuests = async () => {
    try {
      setGuestsLoading(true);
      const response = await BaseClient.get<GetGuestsInterface>(
        `${guestEndPoint.getProjectGuests}/${params?.id}`
      );

      if (response?.data?.success) {
        setGuests({
          rows: response?.data?.data?.rows,
          count: response?.data?.data?.count,
        });
      } else {
        console.error("Error fetching guests: ", response);
      }
    } catch (error) {
      console.error("Error fetching guests: ", error);
    } finally {
      setGuestsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [params?.id]);

  const handleGuestUpdate = () => {
    fetchGuests();
  };

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
