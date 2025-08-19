"use client";

import {
  ChevronRight,
  GalleryVerticalEnd,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      logo?: string;
      isActive?: boolean;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Update open items based on current pathname
  useEffect(() => {
    const newOpenItems = new Set<string>();

    items.forEach((item) => {
      if (item.title === "Events") {
        // Keep Events open if on main project page or any events page
        if (
          pathname === `/projects/${pathname.split("/")[2]}` ||
          pathname.includes("/events/")
        ) {
          newOpenItems.add(item.title);
        }
      } else if (item.title === "Settings") {
        // Keep Settings open if on any settings page
        if (pathname.includes("/settings")) {
          newOpenItems.add(item.title);
        }
      } else if (item.isActive) {
        // Keep other items open if they are marked as active
        newOpenItems.add(item.title);
      }
    });

    setOpenItems(newOpenItems);
  }, [pathname, items]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if current item is active based on pathname - more precise logic
          const isItemActive =
            // Exact match for main item URL
            pathname === item.url ||
            // For settings section, check if we're on a settings page
            (item.title === "Settings" && pathname.includes("/settings")) ||
            // For events section, check if we're on any events page (main project page or specific event page)
            (item.title === "Events" &&
              (pathname === `/projects/${pathname.split("/")[2]}` ||
                pathname.includes("/events/")) &&
              !pathname.includes("/settings"));

          const isOpen = openItems.has(item.title);

          // If item has no sub-items, render as direct link
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isItemActive}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // If item has sub-items, render as collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={(open) => {
                const newOpenItems = new Set(openItems);
                if (open) {
                  newOpenItems.add(item.title);
                } else {
                  newOpenItems.delete(item.title);
                }
                setOpenItems(newOpenItems);
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      // For events, only highlight if we're on the specific event page
                      const isSubItemActive =
                        item.title === "Events"
                          ? subItem.isActive // Use the isActive prop we set in the sidebar
                          : pathname === subItem.url; // For other items, use URL matching

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubItemActive}
                          >
                            <Link href={subItem.url}>
                              {subItem?.logo ? (
                                subItem.logo.includes("http") ? (
                                  <Image
                                    src={subItem.logo}
                                    alt={subItem.title}
                                    width={400}
                                    height={128}
                                    className="w-32 h-32 object-cover rounded-t"
                                  />
                                ) : (
                                  <div className="text-md">{subItem.logo}</div>
                                )
                              ) : (
                                <GalleryVerticalEnd className="size-4 text-primary" />
                              )}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
