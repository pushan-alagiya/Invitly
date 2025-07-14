"use client";

import { Label } from "@/components/ui/label";
import { EditorObject } from "@/lib/editor-state";
import { Move } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CommonPropertiesProps {
  selectedObject: EditorObject;
  onUpdateObjectField: (field: string, value: string | number) => void;
  onFieldBlur: () => void;
}

// Helper component for section headers
const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) => (
  <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
    <Icon className="w-3 h-3" />
    <span>{title}</span>
  </div>
);

export default function CommonProperties({
  selectedObject,
  onUpdateObjectField,
  onFieldBlur,
}: CommonPropertiesProps) {
  return (
    <div className="space-y-6">
      <Separator />

      <div>
        <SectionHeader icon={Move} title="Position & Size" />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="left"
                className="text-xs font-medium text-gray-700 mb-1 block"
              >
                X Position
              </Label>
              <input
                type="number"
                id="left"
                value={selectedObject.left || 0}
                onChange={(e) =>
                  onUpdateObjectField("left", parseInt(e.target.value))
                }
                onBlur={onFieldBlur}
                className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <Label
                htmlFor="top"
                className="text-xs font-medium text-gray-700 mb-1 block"
              >
                Y Position
              </Label>
              <input
                type="number"
                id="top"
                value={selectedObject.top || 0}
                onChange={(e) =>
                  onUpdateObjectField("top", parseInt(e.target.value))
                }
                onBlur={onFieldBlur}
                className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="width"
                className="text-xs font-medium text-gray-700 mb-1 block"
              >
                Width
              </Label>
              <input
                type="number"
                id="width"
                value={selectedObject.width || 100}
                onChange={(e) =>
                  onUpdateObjectField("width", parseInt(e.target.value))
                }
                onBlur={onFieldBlur}
                className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <Label
                htmlFor="height"
                className="text-xs font-medium text-gray-700 mb-1 block"
              >
                Height
              </Label>
              <input
                type="number"
                id="height"
                value={selectedObject.height || 100}
                onChange={(e) =>
                  onUpdateObjectField("height", parseInt(e.target.value))
                }
                onBlur={onFieldBlur}
                className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
