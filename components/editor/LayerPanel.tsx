"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Move,
  Trash2,
  Copy,
  Layers,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Layer {
  id: string;
  name: string;
  type: "text" | "shape" | "image" | "background";
  visible: boolean;
  locked: boolean;
  object: fabric.Object;
}

interface LayerPanelProps {
  layers: Layer[];
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  onLayerLockChange: (layerId: string, locked: boolean) => void;
  onLayerSelect: (layer: Layer) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerMoveUp: (layerId: string) => void;
  onLayerMoveDown: (layerId: string) => void;
}

export default function LayerPanel({
  layers,
  onLayerVisibilityChange,
  onLayerLockChange,
  onLayerSelect,
  onLayerDelete,
  onLayerDuplicate,
  onLayerMoveUp,
  onLayerMoveDown,
}: LayerPanelProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const toggleLayerExpansion = (layerId: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "text":
        return "T";
      case "shape":
        return "■";
      case "image":
        return "🖼️";
      case "background":
        return "🎨";
      default:
        return "●";
    }
  };

  const getLayerColor = (type: string) => {
    switch (type) {
      case "text":
        return "text-blue-600";
      case "shape":
        return "text-green-600";
      case "image":
        return "text-purple-600";
      case "background":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* Layer Panel Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700 flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Layers ({layers.length})
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={() => {
              // Select all layers
              console.log("Select all layers");
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Select All"
          >
            <Move className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              // Show/hide all layers
              console.log("Toggle all layers visibility");
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Toggle All Visibility"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors"
          >
            {/* Layer Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                {/* Visibility Toggle */}
                <button
                  onClick={() =>
                    onLayerVisibilityChange(layer.id, !layer.visible)
                  }
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={layer.visible ? "Hide Layer" : "Show Layer"}
                >
                  {layer.visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>

                {/* Lock Toggle */}
                <button
                  onClick={() => onLayerLockChange(layer.id, !layer.locked)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                >
                  {layer.locked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </button>

                {/* Layer Icon */}
                <span
                  className={`text-sm font-medium ${getLayerColor(layer.type)}`}
                >
                  {getLayerIcon(layer.type)}
                </span>

                {/* Layer Name */}
                <span
                  className={`text-sm flex-1 cursor-pointer ${
                    layer.locked ? "text-gray-400" : "text-gray-700"
                  }`}
                  onClick={() => onLayerSelect(layer)}
                >
                  {layer.name}
                </span>
              </div>

              {/* Layer Actions */}
              <div className="flex items-center space-x-1">
                {/* Move Up */}
                <button
                  onClick={() => onLayerMoveUp(layer.id)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                  title="Move Up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => onLayerMoveDown(layer.id)}
                  disabled={index === layers.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                  title="Move Down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => onLayerDuplicate(layer.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Duplicate Layer"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => onLayerDelete(layer.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete Layer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Layer Properties (Expandable) */}
            {expandedLayers.has(layer.id) && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="space-y-2">
                  {/* Layer Type */}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-gray-700 capitalize">
                      {layer.type}
                    </span>
                  </div>

                  {/* Layer Position */}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Position:</span>
                    <span className="text-gray-700">
                      {Math.round(layer.object.left || 0)},{" "}
                      {Math.round(layer.object.top || 0)}
                    </span>
                  </div>

                  {/* Layer Size */}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Size:</span>
                    <span className="text-gray-700">
                      {Math.round(layer.object.width || 0)} ×{" "}
                      {Math.round(layer.object.height || 0)}
                    </span>
                  </div>

                  {/* Layer Opacity */}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Opacity:</span>
                    <span className="text-gray-700">
                      {Math.round(((layer.object as any).opacity || 1) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleLayerExpansion(layer.id)}
              className="w-full mt-1 text-xs text-gray-400 hover:text-gray-600 text-center"
            >
              {expandedLayers.has(layer.id) ? "Hide Details" : "Show Details"}
            </button>
          </div>
        ))}
      </div>

      {/* Layer Panel Footer */}
      <div className="border-t border-gray-200 pt-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Objects: {layers.length}</span>
          <span>Visible: {layers.filter((l) => l.visible).length}</span>
        </div>
      </div>
    </div>
  );
}
