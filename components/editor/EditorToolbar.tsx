"use client";

import {
  Undo,
  Redo,
  Copy,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Grid,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Save,
  Share,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  zoom: number;
  showGrid: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleGrid: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignJustify: () => void;
  onSave: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onShare: () => void;
  onSettings: () => void;
}

export default function EditorToolbar({
  canUndo,
  canRedo,
  hasSelection,
  zoom,
  showGrid,
  onUndo,
  onRedo,
  onDuplicate,
  onDelete,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleGrid,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,
  onSave,
  onExportPNG,
  onExportPDF,
  onShare,
  onSettings,
}: EditorToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Left Section - History and Selection Tools */}
        <div className="flex items-center space-x-2">
          {/* History */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Selection Tools */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onDuplicate}
              disabled={!hasSelection}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              disabled={!hasSelection}
              className="p-2 text-gray-600 hover:text-red-600 disabled:text-gray-300 transition-colors"
              title="Delete (Delete)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onZoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Zoom In (Ctrl+=)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={onResetZoom}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Reset Zoom (Ctrl+0)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* View Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleGrid}
              className={`p-2 transition-colors ${
                showGrid
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              title="Toggle Grid (G)"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Section - Alignment Tools */}
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500 mr-2">Align:</span>
          <button
            onClick={onAlignLeft}
            disabled={!hasSelection}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onAlignCenter}
            disabled={!hasSelection}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={onAlignRight}
            disabled={!hasSelection}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={onAlignJustify}
            disabled={!hasSelection}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Save and Share */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onSave}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
              title="Save Design (Ctrl+S)"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={onShare}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
              title="Share Design"
            >
              <Share className="w-4 h-4 mr-1" />
              Share
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Export Options */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onExportPNG}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              title="Export as PNG"
            >
              PNG
            </button>
            <button
              onClick={onExportPDF}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
              title="Export as PDF"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Settings */}
          <button
            onClick={onSettings}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-2 text-xs text-gray-500">
        <span className="mr-4">Ctrl+Z: Undo</span>
        <span className="mr-4">Ctrl+Y: Redo</span>
        <span className="mr-4">Ctrl+D: Duplicate</span>
        <span className="mr-4">Delete: Remove</span>
        <span className="mr-4">Ctrl+S: Save</span>
        <span>G: Toggle Grid</span>
      </div>
    </div>
  );
}
