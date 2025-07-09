/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  Archive,
  ChevronsUpDown,
  GalleryVerticalEnd,
  Plus,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    id: number;
    name: string;
    description: string;
    cover_image: string | null;
  }[];
}) {
  const router = useRouter();
  const params = useParams();
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  useEffect(() => {
    const selectedTeam = teams.find((team) => team.id === Number(params.id));
    if (selectedTeam) {
      setActiveTeam(selectedTeam);
    }
  }, [teams, params.id]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary/10 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {activeTeam?.cover_image ? (
                  activeTeam.cover_image.includes("http") ? (
                    <Image
                      src={activeTeam.cover_image}
                      alt={activeTeam.name}
                      width={400}
                      height={128}
                      className="w-32 h-32 object-cover rounded-t"
                    />
                  ) : (
                    <div className="text-xl">{activeTeam.cover_image}</div>
                  )
                ) : (
                  <GalleryVerticalEnd className="size-4 text-primary" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">
                  {activeTeam.description}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Projects
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => {
                  router.push(`/projects/${team.id}`);
                  setActiveTeam(team);
                }}
                className={`gap-2 p-2 flex items-center ${
                  team.id === activeTeam.id
                    ? "bg-sidebar-accent  text-sidebar-accent-foreground "
                    : ""
                }`}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {team?.cover_image ? (
                    team.cover_image.includes("http") ? (
                      <Image
                        src={team.cover_image}
                        alt={team.name}
                        width={400}
                        height={128}
                        className="w-32 h-32 object-cover rounded-t"
                      />
                    ) : (
                      <div className="text-lg">{team.cover_image}</div>
                    )
                  ) : (
                    <GalleryVerticalEnd className="size-4" />
                  )}
                </div>
                {team.name}
                <DropdownMenuShortcut>#{team?.id}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => {
                router.push(`/projects`);
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Archive className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                All Projects
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
