"use client";

import { EditorObject } from "@/lib/editor-state";
import TextProperties from "./properties/TextProperties";
import ShapeProperties from "./properties/ShapeProperties";
import IconProperties from "./properties/IconProperties";
import ImageProperties from "./properties/ImageProperties";
import CommonProperties from "./properties/CommonProperties";

interface PropertiesPanelProps {
  selectedObject: EditorObject | null;
  selectedObjectId: string | null;
  onUpdateObjectField: (field: string, value: string | number) => void;
  onFieldBlur: () => void;
  onUpdateObject: (objectId: string, updates: Partial<EditorObject>) => void;
  onForceRender: () => void;
}

export default function PropertiesPanel({
  selectedObject,
  selectedObjectId,
  onUpdateObjectField,
  onFieldBlur,
  onUpdateObject,
  onForceRender,
}: PropertiesPanelProps) {
  if (!selectedObject) {
    return null;
  }

  return (
    <div className="w-72 lg:w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm">
          {selectedObject.type === "text"
            ? "Text Properties"
            : selectedObject.type === "icon"
            ? "Icon Properties"
            : selectedObject.type === "image"
            ? "Image Properties"
            : "Shape Properties"}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {selectedObject.type === "text"
            ? "Customize your text appearance"
            : selectedObject.type === "icon"
            ? "Adjust icon settings"
            : selectedObject.type === "image"
            ? "Edit or enhance your image (AI tools in demo mode)"
            : "Adjust shape settings"}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Type-specific properties */}
          {selectedObject.type === "text" && (
            <TextProperties
              selectedObject={selectedObject}
              selectedObjectId={selectedObjectId!}
              onUpdateObjectField={onUpdateObjectField}
              onFieldBlur={onFieldBlur}
              onUpdateObject={onUpdateObject}
            />
          )}

          {selectedObject.type === "shape" && (
            <ShapeProperties
              selectedObject={selectedObject}
              selectedObjectId={selectedObjectId!}
              onUpdateObjectField={onUpdateObjectField}
              onFieldBlur={onFieldBlur}
              onUpdateObject={onUpdateObject}
              onForceRender={onForceRender}
            />
          )}

          {selectedObject.type === "icon" && (
            <IconProperties
              selectedObject={selectedObject}
              onUpdateObjectField={onUpdateObjectField}
              onFieldBlur={onFieldBlur}
            />
          )}

          {selectedObject.type === "image" && (
            <ImageProperties
              selectedObject={selectedObject}
              selectedObjectId={selectedObjectId!}
              onUpdateObject={onUpdateObject}
            />
          )}

          {/* Common properties for all types */}
          <CommonProperties
            selectedObject={selectedObject}
            onUpdateObjectField={onUpdateObjectField}
            onFieldBlur={onFieldBlur}
          />
        </div>
      </div>
    </div>
  );
}
