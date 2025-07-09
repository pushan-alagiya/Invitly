"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Move,
  Trash2,
  Edit3,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Group,
  Ungroup,
} from "lucide-react";

interface Layer {
  id: string;
  name: string;
  type: "text" | "shape" | "image" | "background" | "group";
  visible: boolean;
  locked: boolean;
  object: any;
  children?: Layer[];
  isGroup?: boolean;
  isExpanded?: boolean;
}

interface AdvancedLayerPanelProps {
  layers: Layer[];
  onLayerUpdate: (layers: Layer[]) => void;
  onLayerSelect: (layer: Layer) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerGroup: (layerIds: string[]) => void;
  onLayerUngroup: (groupId: string) => void;
  selectedLayerId?: string;
}

export default function AdvancedLayerPanel({
  layers,
  onLayerUpdate,
  onLayerSelect,
  onLayerDelete,
  onLayerDuplicate,
  onLayerGroup,
  onLayerUngroup,
  selectedLayerId,
}: AdvancedLayerPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);

  const toggleLayerVisibility = (layerId: string) => {
    const updatedLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    onLayerUpdate(updatedLayers);
  };

  const toggleLayerLock = (layerId: string) => {
    const updatedLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    );
    onLayerUpdate(updatedLayers);
  };

  const startEditing = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const saveLayerName = () => {
    if (editingLayerId && editingName.trim()) {
      const updatedLayers = layers.map((layer) =>
        layer.id === editingLayerId
          ? { ...layer, name: editingName.trim() }
          : layer
      );
      onLayerUpdate(updatedLayers);
    }
    setEditingLayerId(null);
    setEditingName("");
  };

  const cancelEditing = () => {
    setEditingLayerId(null);
    setEditingName("");
  };

  const handleLayerClick = (layer: Layer, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedLayers((prev) =>
        prev.includes(layer.id)
          ? prev.filter((id) => id !== layer.id)
          : [...prev, layer.id]
      );
    } else {
      // Single select
      setSelectedLayers([layer.id]);
      onLayerSelect(layer);
    }
  };

  const moveLayer = (layerId: string, direction: "up" | "down") => {
    const currentIndex = layers.findIndex((layer) => layer.id === layerId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= layers.length) return;

    const updatedLayers = [...layers];
    [updatedLayers[currentIndex], updatedLayers[newIndex]] = [
      updatedLayers[newIndex],
      updatedLayers[currentIndex],
    ];
    onLayerUpdate(updatedLayers);
  };

  const toggleGroupExpansion = (layerId: string) => {
    const updatedLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, isExpanded: !layer.isExpanded } : layer
    );
    onLayerUpdate(updatedLayers);
  };

  const renderLayer = (layer: Layer, depth = 0) => {
    const isSelected =
      selectedLayerId === layer.id || selectedLayers.includes(layer.id);
    const isEditing = editingLayerId === layer.id;

    return (
      <div key={layer.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? "bg-blue-100 border border-blue-300"
              : "hover:bg-gray-50"
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={(e) => handleLayerClick(layer, e)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* Group expansion toggle */}
            {layer.isGroup && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroupExpansion(layer.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {layer.isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Layer type icon */}
            <div className="flex-shrink-0">
              {layer.isGroup ? (
                layer.isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-600" />
                )
              ) : (
                <div
                  className={`w-4 h-4 rounded ${
                    layer.type === "text"
                      ? "bg-green-500"
                      : layer.type === "shape"
                      ? "bg-purple-500"
                      : layer.type === "image"
                      ? "bg-orange-500"
                      : "bg-gray-500"
                  }`}
                />
              )}
            </div>

            {/* Layer name */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveLayerName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveLayerName();
                    if (e.key === "Escape") cancelEditing();
                  }}
                  className="w-full px-1 py-0.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <span className="text-sm truncate">{layer.name}</span>
              )}
            </div>
          </div>

          {/* Layer controls */}
          <div className="flex items-center space-x-1">
            {/* Visibility toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={layer.visible ? "Hide layer" : "Show layer"}
            >
              {layer.visible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </button>

            {/* Lock toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerLock(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={layer.locked ? "Unlock layer" : "Lock layer"}
            >
              {layer.locked ? (
                <Lock className="w-3 h-3" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
            </button>

            {/* Edit name */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEditing(layer);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Rename layer"
            >
              <Edit3 className="w-3 h-3" />
            </button>

            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLayerDuplicate(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Duplicate layer"
            >
              <Copy className="w-3 h-3" />
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLayerDelete(layer.id);
              }}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Delete layer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Render children for groups */}
        {layer.isGroup && layer.isExpanded && layer.children && (
          <div className="ml-4">
            {layer.children.map((child) => renderLayer(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Layers</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => {
              if (selectedLayers.length > 1) {
                onLayerGroup(selectedLayers);
              }
            }}
            disabled={selectedLayers.length < 2}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
            title="Group selected layers"
          >
            <Group className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (selectedLayers.length === 1) {
                const layer = layers.find((l) => l.id === selectedLayers[0]);
                if (layer?.isGroup) {
                  onLayerUngroup(layer.id);
                }
              }
            }}
            disabled={
              selectedLayers.length !== 1 ||
              !layers.find((l) => l.id === selectedLayers[0])?.isGroup
            }
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
            title="Ungroup selected layer"
          >
            <Ungroup className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer list */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {layers.map((layer) => renderLayer(layer))}
      </div>

      {/* Layer actions */}
      {selectedLayers.length > 0 && (
        <div className="border-t pt-2">
          <div className="text-xs text-gray-500 mb-2">
            {selectedLayers.length} layer{selectedLayers.length > 1 ? "s" : ""}{" "}
            selected
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                const firstSelected = layers.find(
                  (l) => l.id === selectedLayers[0]
                );
                if (firstSelected) {
                  const currentIndex = layers.findIndex(
                    (l) => l.id === firstSelected.id
                  );
                  if (currentIndex > 0) {
                    moveLayer(firstSelected.id, "up");
                  }
                }
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              Move Up
            </button>
            <button
              onClick={() => {
                const firstSelected = layers.find(
                  (l) => l.id === selectedLayers[0]
                );
                if (firstSelected) {
                  const currentIndex = layers.findIndex(
                    (l) => l.id === firstSelected.id
                  );
                  if (currentIndex < layers.length - 1) {
                    moveLayer(firstSelected.id, "down");
                  }
                }
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              Move Down
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
