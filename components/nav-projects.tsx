"use client";

import { GalleryVerticalEnd } from "lucide-react";

import Image from "next/image";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    id: number;
    name: string;
    description: string;
    cover_image: string | null;
  }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={`/projects/${item?.id}`}>
                {item?.cover_image ? (
                  item.cover_image.includes("http") ? (
                    <Image
                      src={item.cover_image}
                      alt={item.name}
                      width={400}
                      height={128}
                      className="w-32 h-32 object-cover rounded-t"
                    />
                  ) : (
                    <div className="text-xl">{item.cover_image}</div>
                  )
                ) : (
                  <GalleryVerticalEnd className="size-4 text-primary" />
                )}
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
