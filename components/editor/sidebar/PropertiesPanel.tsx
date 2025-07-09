"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EditorObject } from "@/lib/editor-state";
import {
  Bold,
  Italic,
  Underline,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Layers,
  Move,
  Square,
  Eye,
  List,
  Hash,
  Minus,
  Plus,
  ListOrdered,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PropertiesPanelProps {
  selectedObject: EditorObject | null;
  selectedObjectId: string | null;
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
            : "Shape Properties"}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {selectedObject.type === "text"
            ? "Customize your text appearance"
            : "Adjust shape settings"}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {selectedObject.type === "text" && (
            <>
              {/* Text Content Section */}
              <div>
                <SectionHeader icon={Type} title="Content" />
                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="text"
                      className="text-xs font-medium text-gray-700 mb-1 block"
                    >
                      Text Content
                    </Label>
                    <textarea
                      id="text"
                      value={selectedObject.text || ""}
                      onChange={(e) =>
                        onUpdateObjectField("text", e.target.value)
                      }
                      onBlur={onFieldBlur}
                      className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Enter your text here..."
                    />
                  </div>

                  {/* Live Preview */}
                  {/* {selectedObject.text && (
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">
                        Preview
                      </Label>
                      <div
                        className="text-sm break-words"
                        style={{
                          fontFamily: selectedObject.fontFamily || "Arial",
                          fontSize: `${Math.min(
                            selectedObject.fontSize || 24,
                            16
                          )}px`,
                          fontWeight: selectedObject.fontWeight || "normal",
                          fontStyle: selectedObject.fontStyle || "normal",
                          textDecoration:
                            selectedObject.textDecoration === "underline"
                              ? "underline"
                              : "none",
                          color: selectedObject.fill || "#000000",
                          backgroundColor:
                            selectedObject.textBackgroundColor || "transparent",
                          textAlign:
                            (selectedObject.textAlign as
                              | "left"
                              | "center"
                              | "right"
                              | "justify") || "left",
                          letterSpacing: `${
                            selectedObject.letterSpacing || 0
                          }px`,
                          lineHeight: selectedObject.lineHeight || 1.2,
                          opacity: selectedObject.opacity || 1,
                        }}
                      >
                        {selectedObject.text}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>

              <Separator />

              {/* Typography Section */}
              <div>
                <SectionHeader icon={Type} title="Typography" />
                <div className="space-y-4">
                  {/* Font Family and Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="fontFamily"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Font Family
                      </Label>
                      <select
                        id="fontFamily"
                        value={selectedObject.fontFamily || "Arial"}
                        onChange={(e) =>
                          onUpdateObjectField("fontFamily", e.target.value)
                        }
                        onBlur={onFieldBlur}
                        className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <optgroup label="System Fonts">
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </optgroup>
                        <optgroup label="Modern Fonts">
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Inter">Inter</option>
                        </optgroup>
                        <optgroup label="Elegant Fonts">
                          <option value="Playfair Display">
                            Playfair Display
                          </option>
                          <option value="Dancing Script">Dancing Script</option>
                          <option value="Great Vibes">Great Vibes</option>
                          <option value="Alex Brush">Alex Brush</option>
                          <option value="Satisfy">Satisfy</option>
                          <option value="Pacifico">Pacifico</option>
                        </optgroup>
                        <optgroup label="Serif Fonts">
                          <option value="Crimson Text">Crimson Text</option>
                          <option value="Lora">Lora</option>
                          <option value="Merriweather">Merriweather</option>
                          <option value="PT Serif">PT Serif</option>
                          <option value="Libre Baskerville">
                            Libre Baskerville
                          </option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <Label
                        htmlFor="fontSize"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Font Size
                      </Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentSize = selectedObject.fontSize || 24;
                            onUpdateObjectField(
                              "fontSize",
                              Math.max(8, currentSize - 2)
                            );
                            onFieldBlur();
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <input
                          type="number"
                          id="fontSize"
                          value={selectedObject.fontSize || 24}
                          onChange={(e) =>
                            onUpdateObjectField(
                              "fontSize",
                              parseInt(e.target.value)
                            )
                          }
                          onBlur={onFieldBlur}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="8"
                          max="200"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentSize = selectedObject.fontSize || 24;
                            onUpdateObjectField(
                              "fontSize",
                              Math.min(200, currentSize + 2)
                            );
                            onFieldBlur();
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <Label
                      htmlFor="fontWeight"
                      className="text-xs font-medium text-gray-700 mb-1 block"
                    >
                      Font Weight
                    </Label>
                    <select
                      id="fontWeight"
                      value={selectedObject.fontWeight || "normal"}
                      onChange={(e) =>
                        onUpdateObjectField("fontWeight", e.target.value)
                      }
                      onBlur={onFieldBlur}
                      className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="100">Thin (100)</option>
                      <option value="200">Extra Light (200)</option>
                      <option value="300">Light (300)</option>
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>

                  {/* Quick Style Buttons */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Quick Styles
                    </Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={
                          selectedObject.fontWeight === "bold"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          const newWeight =
                            selectedObject.fontWeight === "bold"
                              ? "normal"
                              : "bold";
                          onUpdateObjectField("fontWeight", newWeight);
                          onFieldBlur();
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Bold className="w-3 h-3 mr-1" />
                        Bold
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedObject.fontStyle === "italic"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          const newStyle =
                            selectedObject.fontStyle === "italic"
                              ? "normal"
                              : "italic";
                          onUpdateObjectField("fontStyle", newStyle);
                          onFieldBlur();
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Italic className="w-3 h-3 mr-1" />
                        Italic
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedObject.textDecoration === "underline"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          const newDecoration =
                            selectedObject.textDecoration === "underline"
                              ? "none"
                              : "underline";
                          onUpdateObjectField("textDecoration", newDecoration);
                          onFieldBlur();
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Underline className="w-3 h-3 mr-1" />
                        Underline
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Quick Actions
                    </Label>
                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentText = selectedObject.text || "";
                          const newText = currentText.toUpperCase();
                          onUpdateObjectField("text", newText);
                          onFieldBlur();
                        }}
                        className="h-8 text-xs"
                      >
                        <Type className="w-3 h-3 mr-1" />
                        UPPERCASE
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentText = selectedObject.text || "";
                          const newText = currentText.toLowerCase();
                          onUpdateObjectField("text", newText);
                          onFieldBlur();
                        }}
                        className="h-8 text-xs"
                      >
                        <Type className="w-3 h-3 mr-1" />
                        lowercase
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentText = selectedObject.text || "";
                          const newText = currentText.replace(/\b\w/g, (l) =>
                            l.toUpperCase()
                          );
                          onUpdateObjectField("text", newText);
                          onFieldBlur();
                        }}
                        className="h-8 text-xs"
                      >
                        <Type className="w-3 h-3 mr-1" />
                        Title Case
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentText = selectedObject.text || "";
                          const newText = currentText
                            .replace(/\s+/g, " ")
                            .trim();
                          onUpdateObjectField("text", newText);
                          onFieldBlur();
                        }}
                        className="h-8 text-xs"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        Clean
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Colors Section */}
              <div>
                <SectionHeader icon={Palette} title="Colors" />
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={selectedObject.fill || "#000000"}
                    onChange={(value) => onUpdateObjectField("fill", value)}
                    onBlur={onFieldBlur}
                    id="fill"
                  />
                  <ColorPicker
                    label="Background Color"
                    value={selectedObject.textBackgroundColor || "#ffffff"}
                    onChange={(value) =>
                      onUpdateObjectField("textBackgroundColor", value)
                    }
                    onBlur={onFieldBlur}
                    id="textBackgroundColor"
                  />
                </div>
              </div>

              <Separator />

              {/* Layout Section */}
              <div>
                <SectionHeader icon={AlignLeft} title="Layout" />
                <div className="space-y-4">
                  {/* Text Alignment */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Text Alignment
                    </Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={
                          selectedObject.textAlign === "left"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          onUpdateObjectField("textAlign", "left");
                          onFieldBlur();
                        }}
                        className="flex-1 h-8"
                      >
                        <AlignLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedObject.textAlign === "center"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          onUpdateObjectField("textAlign", "center");
                          onFieldBlur();
                        }}
                        className="flex-1 h-8"
                      >
                        <AlignCenter className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedObject.textAlign === "right"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          onUpdateObjectField("textAlign", "right");
                          onFieldBlur();
                        }}
                        className="flex-1 h-8"
                      >
                        <AlignRight className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedObject.textAlign === "justify"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          onUpdateObjectField("textAlign", "justify");
                          onFieldBlur();
                        }}
                        className="flex-1 h-8"
                      >
                        <AlignJustify className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Text Spacing */}
                  <div className="space-y-3">
                    <RangeSlider
                      label="Letter Spacing"
                      value={selectedObject.letterSpacing || 0}
                      onChange={(value) =>
                        onUpdateObjectField("letterSpacing", value)
                      }
                      onBlur={onFieldBlur}
                      min={-5}
                      max={20}
                      step={0.5}
                      unit="px"
                    />
                    <RangeSlider
                      label="Line Height"
                      value={selectedObject.lineHeight || 1.2}
                      onChange={(value) =>
                        onUpdateObjectField("lineHeight", value)
                      }
                      onBlur={onFieldBlur}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                    <RangeSlider
                      label="Word Spacing"
                      value={selectedObject.wordSpacing || 0}
                      onChange={(value) =>
                        onUpdateObjectField("wordSpacing", value)
                      }
                      onBlur={onFieldBlur}
                      min={-5}
                      max={20}
                      step={0.5}
                      unit="px"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Effects Section */}
              <div>
                <SectionHeader icon={Layers} title="Effects" />
                <div className="space-y-4">
                  {/* Text Shadow */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Text Shadow
                    </Label>
                    <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                      <ColorPicker
                        label="Shadow Color"
                        value={selectedObject.textShadow?.color || "#000000"}
                        onChange={(value) => {
                          const currentShadow = selectedObject.textShadow || {
                            color: "#000000",
                            blur: 0,
                            offsetX: 0,
                            offsetY: 0,
                          };
                          onUpdateObject(selectedObjectId!, {
                            textShadow: { ...currentShadow, color: value },
                          });
                        }}
                        onBlur={onFieldBlur}
                        id="shadowColor"
                      />
                      <RangeSlider
                        label="Blur"
                        value={selectedObject.textShadow?.blur || 0}
                        onChange={(value) => {
                          const currentShadow = selectedObject.textShadow || {
                            color: "#000000",
                            blur: 0,
                            offsetX: 0,
                            offsetY: 0,
                          };
                          onUpdateObject(selectedObjectId!, {
                            textShadow: { ...currentShadow, blur: value },
                          });
                        }}
                        onBlur={onFieldBlur}
                        min={0}
                        max={20}
                        unit="px"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <RangeSlider
                          label="Offset X"
                          value={selectedObject.textShadow?.offsetX || 0}
                          onChange={(value) => {
                            const currentShadow = selectedObject.textShadow || {
                              color: "#000000",
                              blur: 0,
                              offsetX: 0,
                              offsetY: 0,
                            };
                            onUpdateObject(selectedObjectId!, {
                              textShadow: { ...currentShadow, offsetX: value },
                            });
                          }}
                          onBlur={onFieldBlur}
                          min={-20}
                          max={20}
                          unit="px"
                        />
                        <RangeSlider
                          label="Offset Y"
                          value={selectedObject.textShadow?.offsetY || 0}
                          onChange={(value) => {
                            const currentShadow = selectedObject.textShadow || {
                              color: "#000000",
                              blur: 0,
                              offsetX: 0,
                              offsetY: 0,
                            };
                            onUpdateObject(selectedObjectId!, {
                              textShadow: { ...currentShadow, offsetY: value },
                            });
                          }}
                          onBlur={onFieldBlur}
                          min={-20}
                          max={20}
                          unit="px"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Opacity */}
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
                </div>
              </div>

              <Separator />

              {/* List Formatting */}
              <div>
                <SectionHeader icon={List} title="List Formatting" />
                <div className="space-y-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1 block">
                      List Type
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          selectedObject.listType === "bullet"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          onUpdateObjectField(
                            "listType",
                            selectedObject.listType === "bullet" ? "" : "bullet"
                          );
                          onFieldBlur();
                        }}
                        className="w-fit"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedObject.listType === "number"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          onUpdateObjectField(
                            "listType",
                            selectedObject.listType === "number" ? "" : "number"
                          );
                          onFieldBlur();
                        }}
                        className="w-fit"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedObject.listType &&
                    selectedObject.listType !== "none" && (
                      <div>
                        <Label
                          htmlFor="listStyle"
                          className="text-xs font-medium text-gray-700 mb-1 block"
                        >
                          List Style
                        </Label>
                        <select
                          id="listStyle"
                          value={
                            selectedObject.listStyle ||
                            (selectedObject.listType === "bullet"
                              ? "disc"
                              : "decimal")
                          }
                          onChange={(e) =>
                            onUpdateObjectField("listStyle", e.target.value)
                          }
                          onBlur={onFieldBlur}
                          className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {selectedObject.listType === "bullet" ? (
                            <>
                              <option value="disc">Disc (•)</option>
                              <option value="circle">Circle (○)</option>
                              <option value="square">Square (■)</option>
                            </>
                          ) : (
                            <>
                              <option value="decimal">
                                Decimal (1. 2. 3.)
                              </option>
                              <option value="lower-alpha">
                                Lower Alpha (a. b. c.)
                              </option>
                              <option value="upper-alpha">
                                Upper Alpha (A. B. C.)
                              </option>
                              <option value="lower-roman">
                                Lower Roman (i. ii. iii.)
                              </option>
                              <option value="upper-roman">
                                Upper Roman (I. II. III.)
                              </option>
                            </>
                          )}
                        </select>
                      </div>
                    )}
                </div>
              </div>
            </>
          )}

          {/* Shape Properties */}
          {selectedObject.type === "shape" && (
            <>
              <div>
                <SectionHeader icon={Square} title="Shape Type" />
                <select
                  id="shapeType"
                  value={selectedObject.shapeType || "rect"}
                  onChange={(e) => {
                    onUpdateObjectField("shapeType", e.target.value);
                    onUpdateObject(selectedObjectId!, {
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
                    onChange={(value) =>
                      onUpdateObjectField("strokeWidth", value)
                    }
                    onBlur={onFieldBlur}
                    min={0}
                    max={20}
                    unit="px"
                  />
                </div>
              </div>

              <Separator />

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
                      onChange={(value) =>
                        onUpdateObjectField("cornerRadius", value)
                      }
                      onBlur={onFieldBlur}
                      min={0}
                      max={50}
                      unit="px"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Common Properties */}
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
      </div>
    </div>
  );
}
