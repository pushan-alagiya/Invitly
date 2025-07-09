"use client";

import { useState } from "react";
import {
  Type,
  Square,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  GripVertical,
} from "lucide-react";
import { EditorPage } from "@/lib/editor-state";

interface LayersPanelProps {
  currentPage: EditorPage | null;
  selectedObjectIds?: string[]; // Add multi-selection support
  onObjectSelect: (objectId: string) => void;
  onMoveObjectUp: (objectId: string) => void;
  onMoveObjectDown: (objectId: string) => void;
  onDuplicateObject: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
  onReorderObjects?: (fromIndex: number, toIndex: number) => void;
}

export default function LayersPanel({
  currentPage,
  selectedObjectIds = [], // Default to empty array
  onObjectSelect,
  onMoveObjectUp,
  onMoveObjectDown,
  onDuplicateObject,
  onDeleteObject,
  onReorderObjects,
}: LayersPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!currentPage) {
    return null;
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());

    // Add a small delay to make the drag effect more visible
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = "0.4";
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear dragOverIndex if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (
      draggedIndex !== null &&
      draggedIndex !== targetIndex &&
      onReorderObjects
    ) {
      onReorderObjects(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  return (
    <div className="w-48 lg:w-64 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-2 lg:p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-700 text-sm lg:text-base">
          Layers
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 lg:p-4">
        <div className="space-y-1 lg:space-y-2">
          {currentPage.objects.map((obj, index) => (
            <div
              key={obj.id}
              className={`p-1 lg:p-2 rounded border cursor-pointer transition-all duration-300 ease-in-out transform ${
                selectedObjectIds.includes(obj.id)
                  ? "bg-blue-100 border-blue-300 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              } ${
                draggedIndex === index
                  ? "opacity-40 scale-95 rotate-1 shadow-lg z-10"
                  : "opacity-100 scale-100 rotate-0"
              } ${
                dragOverIndex === index
                  ? "border-dashed border-blue-400 bg-blue-50 scale-105 shadow-md"
                  : ""
              } ${
                isDragging && draggedIndex !== index
                  ? "transition-transform duration-200 ease-out"
                  : ""
              }`}
              onClick={() => onObjectSelect(obj.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                transform:
                  draggedIndex === index
                    ? "rotate(2deg) scale(0.95)"
                    : "rotate(0deg) scale(1)",
                transition: isDragging
                  ? "transform 0.2s ease-out"
                  : "all 0.3s ease-in-out",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 lg:gap-2 min-w-0 flex-1">
                  {/* Drag handle */}
                  <div
                    className={`flex-shrink-0 cursor-grab active:cursor-grabbing transition-colors duration-200 ${
                      draggedIndex === index
                        ? "text-blue-500"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <GripVertical className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>

                  {/* Object icon */}
                  <div className="flex-shrink-0 transition-transform duration-200 hover:scale-110">
                    {obj.type === "text" && (
                      <Type className="w-2 h-2 lg:w-3 lg:h-3" />
                    )}
                    {obj.type === "shape" && (
                      <Square className="w-2 h-2 lg:w-3 lg:h-3" />
                    )}
                    {obj.type === "image" && (
                      <ImageIcon className="w-2 h-2 lg:w-3 lg:h-3" />
                    )}
                  </div>

                  {/* Object name */}
                  <span className="text-xs lg:text-sm font-medium truncate flex-1 transition-colors duration-200">
                    {obj.type === "text" && obj.text
                      ? obj.text.slice(0, 20) +
                        (obj.text.length > 20 ? "..." : "")
                      : `${obj.type} ${obj.id.slice(-4)}`}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveObjectUp(obj.id);
                    }}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Move Up"
                  >
                    <ChevronUp className="w-2 h-2 lg:w-3 lg:h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveObjectDown(obj.id);
                    }}
                    disabled={index === (currentPage?.objects.length || 0) - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Move Down"
                  >
                    <ChevronDown className="w-2 h-2 lg:w-3 lg:h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateObject(obj.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Duplicate"
                  >
                    <Copy className="w-2 h-2 lg:w-3 lg:h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(obj.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-600 transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Delete"
                  >
                    <Trash2 className="w-2 h-2 lg:w-3 lg:h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
