"use client";

import { useState, useRef, useEffect } from "react";
import * as fabric from "fabric";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Download,
  Settings,
  FileText,
  Image as ImageIcon,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";

interface Page {
  id: string;
  name: string;
  type: "front" | "back" | "rsvp" | "reception" | "custom";
  width: number;
  height: number;
  canvas: fabric.Canvas;
  thumbnail?: string;
  visible: boolean;
}

interface MultiPageEditorProps {
  onPageChange: (pageId: string) => void;
  onPageAdd: (pageType: string) => void;
  onPageDelete: (pageId: string) => void;
  onPageDuplicate: (pageId: string) => void;
  onPageExport: (pageId: string, format: "pdf" | "png") => void;
  pages: Page[];
  currentPageId: string;
}

const PAGE_TEMPLATES = {
  front: {
    name: "Front Cover",
    width: 800,
    height: 1000,
    icon: FileText,
    defaultContent: {
      title: "Wedding Invitation",
      subtitle: "Join us for our special day",
      background: "#FFFFFF",
    },
  },
  back: {
    name: "Back Cover",
    width: 800,
    height: 1000,
    icon: FileText,
    defaultContent: {
      title: "Thank You",
      subtitle: "For being part of our journey",
      background: "#FFFFFF",
    },
  },
  rsvp: {
    name: "RSVP Card",
    width: 600,
    height: 400,
    icon: Mail,
    defaultContent: {
      title: "RSVP",
      subtitle: "Please respond by [Date]",
      background: "#F8F9FA",
    },
  },
  reception: {
    name: "Reception Details",
    width: 800,
    height: 600,
    icon: Calendar,
    defaultContent: {
      title: "Reception",
      subtitle: "Celebration continues",
      background: "#FFFFFF",
    },
  },
  custom: {
    name: "Custom Page",
    width: 800,
    height: 1000,
    icon: Settings,
    defaultContent: {
      title: "Custom Page",
      subtitle: "Add your content here",
      background: "#FFFFFF",
    },
  },
};

export default function MultiPageEditor({
  onPageChange,
  onPageAdd,
  onPageDelete,
  onPageDuplicate,
  onPageExport,
  pages,
  currentPageId,
}: MultiPageEditorProps) {
  const [showPageMenu, setShowPageMenu] = useState<string | null>(null);
  const [thumbnailUpdateInterval, setThumbnailUpdateInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Auto-update thumbnails every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateThumbnails();
    }, 5000);

    setThumbnailUpdateInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pages]);

  const updateThumbnails = () => {
    pages.forEach((page) => {
      if (page.canvas) {
        const thumbnail = page.canvas.toDataURL({
          format: "png",
          multiplier: 0.2,
        });
        // Update thumbnail in page object
        page.thumbnail = thumbnail;
      }
    });
  };

  const handlePageAdd = (pageType: string) => {
    onPageAdd(pageType);
    setShowPageMenu(null);
  };

  const handlePageDelete = (pageId: string) => {
    if (pages.length > 1) {
      onPageDelete(pageId);
    }
  };

  const handlePageDuplicate = (pageId: string) => {
    onPageDuplicate(pageId);
  };

  const handlePageExport = (pageId: string, format: "pdf" | "png") => {
    onPageExport(pageId, format);
  };

  const getPageIcon = (pageType: string) => {
    const template = PAGE_TEMPLATES[pageType as keyof typeof PAGE_TEMPLATES];
    return template?.icon || Settings;
  };

  const getPageColor = (pageType: string) => {
    switch (pageType) {
      case "front":
        return "bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200";
      case "back":
        return "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200";
      case "rsvp":
        return "bg-gradient-to-br from-green-100 to-emerald-100 border-green-200";
      case "reception":
        return "bg-gradient-to-br from-purple-100 to-violet-100 border-purple-200";
      default:
        return "bg-gradient-to-br from-gray-100 to-slate-100 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Pages</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPageMenu(showPageMenu ? null : "add")}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Add new page"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Page Menu */}
      {showPageMenu === "add" && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <h4 className="font-medium text-gray-700 mb-3">Add New Page</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PAGE_TEMPLATES).map(([type, template]) => {
              const IconComponent = template.icon;
              return (
                <button
                  key={type}
                  onClick={() => handlePageAdd(type)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {template.width} × {template.height}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Page Thumbnails */}
      <div className="space-y-3">
        {pages.map((page, index) => {
          const IconComponent = getPageIcon(page.type);
          const isCurrentPage = page.id === currentPageId;
          const pageColor = getPageColor(page.type);

          return (
            <div
              key={page.id}
              className={`relative border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
                isCurrentPage
                  ? "border-blue-500 shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onPageChange(page.id)}
            >
              {/* Page Thumbnail */}
              <div className="relative">
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-24 ${pageColor} flex items-center justify-center`}
                  >
                    <IconComponent className="w-8 h-8 text-gray-500" />
                  </div>
                )}

                {/* Page Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-3 h-3" />
                      <span className="text-xs font-medium">{page.name}</span>
                    </div>
                    <span className="text-xs opacity-75">
                      {page.width} × {page.height}
                    </span>
                  </div>
                </div>

                {/* Page Number */}
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">
                    {index + 1}
                  </span>
                </div>

                {/* Page Actions */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageDuplicate(page.id);
                    }}
                    className="p-1 bg-white bg-opacity-90 rounded hover:bg-opacity-100 transition-colors"
                    title="Duplicate page"
                  >
                    <Copy className="w-3 h-3 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPageMenu(
                        showPageMenu === page.id ? null : page.id
                      );
                    }}
                    className="p-1 bg-white bg-opacity-90 rounded hover:bg-opacity-100 transition-colors"
                    title="Page options"
                  >
                    <Settings className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Page Options Menu */}
              {showPageMenu === page.id && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageExport(page.id, "png");
                        setShowPageMenu(null);
                      }}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export PNG</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageExport(page.id, "pdf");
                        setShowPageMenu(null);
                      }}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export PDF</span>
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageDelete(page.id);
                        setShowPageMenu(null);
                      }}
                      disabled={pages.length <= 1}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-red-100 rounded flex items-center space-x-2 text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Page</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Page Navigation */}
      {pages.length > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <button
            onClick={() => {
              const currentIndex = pages.findIndex(
                (p) => p.id === currentPageId
              );
              const prevIndex =
                currentIndex > 0 ? currentIndex - 1 : pages.length - 1;
              onPageChange(pages[prevIndex].id);
            }}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(pages[index].id)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  pages[index].id === currentPageId
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                title={`Page ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              const currentIndex = pages.findIndex(
                (p) => p.id === currentPageId
              );
              const nextIndex =
                currentIndex < pages.length - 1 ? currentIndex + 1 : 0;
              onPageChange(pages[nextIndex].id);
            }}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Statistics */}
      <div className="text-xs text-gray-500 text-center">
        {pages.length} page{pages.length !== 1 ? "s" : ""} • Current:{" "}
        {pages.findIndex((p) => p.id === currentPageId) + 1} of {pages.length}
      </div>
    </div>
  );
}
