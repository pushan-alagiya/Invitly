"use client";

import { Label } from "@/components/ui/label";
import { EditorObject } from "@/lib/editor-state";
import { Square, Palette, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ShapePropertiesProps {
  selectedObject: EditorObject;
  selectedObjectId: string;
  onUpdateObjectField: (field: string, value: string | number) => void;
  onFieldBlur: () => void;
  onUpdateObject: (objectId: string, updates: Partial<EditorObject>) => void;
  onForceRender: () => void;
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

// Helper component for color picker
const ColorPicker = ({
  label,
  value,
  onChange,
  onBlur,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  id: string;
}) => (
  <div>
    <Label
      htmlFor={id}
      className="text-xs font-medium text-gray-700 mb-1 block"
    >
      {label}
    </Label>
    <div className="flex gap-2">
      <input
        type="color"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-10 h-8 border border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="#000000"
      />
    </div>
  </div>
);

// Helper component for range slider
const RangeSlider = ({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <span className="text-xs text-gray-500">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      onBlur={onBlur}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{
        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
          ((value - min) / (max - min)) * 100
        }%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`,
      }}
    />
    <style jsx>{`
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .slider::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `}</style>
  </div>
);

export default function ShapeProperties({
  selectedObject,
  selectedObjectId,
  onUpdateObjectField,
  onFieldBlur,
  onUpdateObject,
  onForceRender,
}: ShapePropertiesProps) {
  return (
    <div className="space-y-6">
      {/* Shape Type Section */}
      <div>
        <SectionHeader icon={Square} title="Shape Type" />
        <select
          id="shapeType"
          value={selectedObject.shapeType || "rect"}
          onChange={(e) => {
            onUpdateObjectField("shapeType", e.target.value);
            onUpdateObject(selectedObjectId, {
              shapeType: e.target.value,
            });
            onForceRender();
          }}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="rect">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

      <Separator />

      {/* Colors Section */}
      <div>
        <SectionHeader icon={Palette} title="Colors" />
        <div className="space-y-3">
          <ColorPicker
            label="Fill Color"
            value={selectedObject.fill || "#3B82F6"}
            onChange={(value) => onUpdateObjectField("fill", value)}
            onBlur={onFieldBlur}
            id="fill"
          />
          <ColorPicker
            label="Border Color"
            value={selectedObject.stroke || "#000000"}
            onChange={(value) => onUpdateObjectField("stroke", value)}
            onBlur={onFieldBlur}
            id="stroke"
          />
          <RangeSlider
            label="Border Width"
            value={selectedObject.strokeWidth || 0}
            onChange={(value) => onUpdateObjectField("strokeWidth", value)}
            onBlur={onFieldBlur}
            min={0}
            max={20}
            unit="px"
          />
        </div>
      </div>

      <Separator />

      {/* Appearance Section */}
      <div>
        <SectionHeader icon={Eye} title="Appearance" />
        <div className="space-y-3">
          <RangeSlider
            label="Opacity"
            value={selectedObject.opacity || 1}
            onChange={(value) => onUpdateObjectField("opacity", value)}
            onBlur={onFieldBlur}
            min={0}
            max={1}
            step={0.1}
            unit="%"
          />
          {(selectedObject.shapeType === "rect" ||
            selectedObject.shapeType === "square") && (
            <RangeSlider
              label="Corner Radius"
              value={selectedObject.cornerRadius || 0}
              onChange={(value) => onUpdateObjectField("cornerRadius", value)}
              onBlur={onFieldBlur}
              min={0}
              max={50}
              unit="px"
            />
          )}
        </div>
      </div>
    </div>
  );
}
