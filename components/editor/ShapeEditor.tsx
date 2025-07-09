"use client";

import { useState } from "react";
import { Square, Circle, Triangle, Move } from "lucide-react";
import * as fabric from "fabric";

interface ShapeEditorProps {
  onAddShape: (type: string, options: Record<string, unknown>) => void;
  selectedObject: fabric.Object | null;
  onUpdateShape: (options: Record<string, unknown>) => void;
}

const shapes = [
  { name: "Rectangle", icon: Square, type: "rect" },
  { name: "Circle", icon: Circle, type: "circle" },
  { name: "Triangle", icon: Triangle, type: "triangle" },
  { name: "Ellipse", icon: Circle, type: "ellipse" },
  { name: "Line", icon: Move, type: "line" },
];

export default function ShapeEditor({
  onAddShape,
  selectedObject,
  onUpdateShape,
}: ShapeEditorProps) {
  const [shapeColor, setShapeColor] = useState("#3B82F6");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);

  const handleAddShape = (type: string) => {
    onAddShape(type, {
      fill: shapeColor,
      stroke: strokeWidth > 0 ? strokeColor : undefined,
      strokeWidth: strokeWidth > 0 ? strokeWidth : undefined,
    });
  };

  const handleUpdateShape = () => {
    if (selectedObject && selectedObject.type !== "i-text") {
      onUpdateShape({
        fill: shapeColor,
        stroke: strokeWidth > 0 ? strokeColor : undefined,
        strokeWidth: strokeWidth > 0 ? strokeWidth : undefined,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Add Shapes</h3>
        <div className="grid grid-cols-2 gap-2">
          {shapes.map((shape, index) => (
            <button
              key={index}
              onClick={() => handleAddShape(shape.type)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <shape.icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-700 mb-2">Fill Color</h3>
        <input
          type="color"
          value={shapeColor}
          onChange={(e) => {
            setShapeColor(e.target.value);
            if (selectedObject) handleUpdateShape();
          }}
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <h3 className="font-medium text-gray-700 mb-2">Stroke</h3>
        <div className="space-y-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => {
              setStrokeColor(e.target.value);
              if (selectedObject) handleUpdateShape();
            }}
            className="w-full h-8 border border-gray-300 rounded"
          />
          <div>
            <label className="text-xs text-gray-500">
              Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={strokeWidth}
              onChange={(e) => {
                setStrokeWidth(Number(e.target.value));
                if (selectedObject) handleUpdateShape();
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {selectedObject && selectedObject.type !== "i-text" && (
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ Shape object selected - changes will apply to selected shape
          </p>
        </div>
      )}
    </div>
  );
}
