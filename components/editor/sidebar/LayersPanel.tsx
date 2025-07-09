"use client";

import {
  Type,
  Square,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
} from "lucide-react";
import { EditorPage } from "@/lib/editor-state";

interface LayersPanelProps {
  currentPage: EditorPage | null;
  selectedObjectId: string | null;
  onObjectSelect: (objectId: string) => void;
  onMoveObjectUp: (objectId: string) => void;
  onMoveObjectDown: (objectId: string) => void;
  onDuplicateObject: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
}

export default function LayersPanel({
  currentPage,
  selectedObjectId,
  onObjectSelect,
  onMoveObjectUp,
  onMoveObjectDown,
  onDuplicateObject,
  onDeleteObject,
}: LayersPanelProps) {
  if (!currentPage) {
    return null;
  }

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
              className={`p-1 lg:p-2 rounded border cursor-pointer transition-colors ${
                selectedObjectId === obj.id
                  ? "bg-blue-100 border-blue-300"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => onObjectSelect(obj.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 lg:gap-2 min-w-0">
                  {obj.type === "text" && (
                    <Type className="w-2 h-2 lg:w-3 lg:h-3 flex-shrink-0" />
                  )}
                  {obj.type === "shape" && (
                    <Square className="w-2 h-2 lg:w-3 lg:h-3 flex-shrink-0" />
                  )}
                  {obj.type === "image" && (
                    <ImageIcon className="w-2 h-2 lg:w-3 lg:h-3 flex-shrink-0" />
                  )}
                  <span className="text-xs lg:text-sm font-medium truncate">
                    {obj.type} {obj.id.slice(-4)}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveObjectUp(obj.id);
                    }}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Move Down"
                  >
                    <ChevronDown className="w-2 h-2 lg:w-3 lg:h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateObject(obj.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Duplicate"
                  >
                    <Copy className="w-2 h-2 lg:w-3 lg:h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(obj.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-600"
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
