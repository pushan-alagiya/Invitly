"use client";

import { Button } from "@/components/ui/button";
import { EditorObject } from "@/lib/editor-state";
import {
  Type,
  Square,
  Save,
  Upload,
  Download,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useRef, useState } from "react";
import { SHAPE_CATEGORIES, getShapesByCategory } from "@/lib/shapes-config";

interface ElementsTabProps {
  selectedObject: EditorObject | null;
  onAddText: () => void;
  onAddShape: (shapeType: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export default function ElementsTab({
  selectedObject,
  onAddText,
  onAddShape,
  onSave,
  onLoad,
  onExport,
  onImport,
}: ElementsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const shapesByCategory = getShapesByCategory();

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const isCategoryExpanded = (category: string) => {
    return expandedCategories.includes(category);
  };

  return (
    <div className="p-2 lg:p-4 space-y-3 lg:space-y-4">
      {/* Quick Actions */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <Button
            onClick={onAddText}
            className="h-8 lg:h-10 text-xs lg:text-sm"
            variant="outline"
          >
            <Type className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            Add Text
          </Button>
          <Button
            onClick={() => onAddShape("rect")}
            className="h-8 lg:h-10 text-xs lg:text-sm"
            variant="outline"
          >
            <Square className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            Add Shape
          </Button>
        </div>
      </div>

      {/* Text Elements */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Text Elements
        </h3>
        <div className="space-y-1 lg:space-y-2">
          <div className="p-2 lg:p-3 bg-gray-50 rounded border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Type className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs lg:text-sm font-medium truncate">
                  Sample Text
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddText()}
                className="h-6 w-6 lg:h-8 lg:w-8 p-0"
              >
                <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Shape Elements - Accordion Style */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Shape Elements
        </h3>
        <div className="space-y-2">
          {SHAPE_CATEGORIES.map((category) => (
            <div
              key={category}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700">
                  {category}
                </span>
                {isCategoryExpanded(category) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isCategoryExpanded(category) && (
                <div className="p-3 bg-white">
                  <div className="grid grid-cols-3 gap-2 lg:gap-3">
                    {shapesByCategory[category].map((shape) => (
                      <Button
                        key={shape.type}
                        onClick={() => onAddShape(shape.type)}
                        className="h-12 lg:h-16 flex flex-col items-center justify-center gap-1 lg:gap-2 p-2"
                        variant="outline"
                        style={{ borderColor: shape.color }}
                      >
                        <span className="text-lg lg:text-xl">{shape.icon}</span>
                        <span className="text-xs font-medium text-center leading-tight">
                          {shape.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Object Actions */}
      {selectedObject && (
        <div className="space-y-2 lg:space-y-3">
          <h3 className="text-sm lg:text-base font-semibold text-gray-700">
            Selected: {selectedObject.type}
          </h3>
        </div>
      )}

      {/* Project Management */}
      {selectedObject && (
        <div className="space-y-2 lg:space-y-3 pt-2 lg:pt-4 border-t border-gray-200">
          <h3 className="text-sm lg:text-base font-semibold text-gray-700">
            Project
          </h3>
          <div className="space-y-2 lg:space-y-3">
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <Button
                onClick={onSave}
                className="h-8 lg:h-10 text-xs lg:text-sm"
                variant="outline"
              >
                <Save className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Save
              </Button>
              <Button
                onClick={onLoad}
                className="h-8 lg:h-10 text-xs lg:text-sm"
                variant="outline"
              >
                <Upload className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Load
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <Button
                onClick={onExport}
                className="h-8 lg:h-10 text-xs lg:text-sm"
                variant="outline"
              >
                <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Export
              </Button>
              <Button
                onClick={handleImport}
                className="h-8 lg:h-10 text-xs lg:text-sm"
                variant="outline"
              >
                <Upload className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </div>
  );
}
