"use client";

import { useState } from "react";
import * as fabric from "fabric";

interface EffectsEditorProps {
  selectedObject: fabric.Object | null;
  onApplyEffect: (effectType: string, options: Record<string, unknown>) => void;
  onClearEffect: (effectType: string) => void;
}

export default function EffectsEditor({
  selectedObject,
  onApplyEffect,
  onClearEffect,
}: EffectsEditorProps) {
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(10);
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(2);
  const [gradientColor1, setGradientColor1] = useState("#FF6B6B");
  const [gradientColor2, setGradientColor2] = useState("#4ECDC4");

  const isTextSelected = selectedObject && selectedObject.type === "i-text";

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700 mb-2">Text Effects</h3>

      {!isTextSelected && (
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⚠️ Select a text object first to apply effects
          </p>
        </div>
      )}

      {/* Shadow Effect */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Shadow</h4>
        <div className="space-y-2">
          <input
            type="color"
            value={shadowColor}
            onChange={(e) => setShadowColor(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded"
          />
          <div>
            <label className="text-xs text-gray-500">
              Blur: {shadowBlur}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={shadowBlur}
              onChange={(e) => setShadowBlur(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                onApplyEffect("shadow", {
                  color: shadowColor,
                  blur: shadowBlur,
                })
              }
              disabled={!isTextSelected}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply Shadow
            </button>
            <button
              onClick={() => onClearEffect("shadow")}
              disabled={!isTextSelected}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Clear Shadow"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Outline Effect */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Outline</h4>
        <div className="space-y-2">
          <input
            type="color"
            value={outlineColor}
            onChange={(e) => setOutlineColor(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded"
          />
          <div>
            <label className="text-xs text-gray-500">
              Width: {outlineWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={outlineWidth}
              onChange={(e) => setOutlineWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                onApplyEffect("outline", {
                  color: outlineColor,
                  width: outlineWidth,
                })
              }
              disabled={!isTextSelected}
              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply Outline
            </button>
            <button
              onClick={() => onClearEffect("outline")}
              disabled={!isTextSelected}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Clear Outline"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Gradient Effect */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Gradient</h4>
        <div className="space-y-2">
          <input
            type="color"
            value={gradientColor1}
            onChange={(e) => setGradientColor1(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded"
          />
          <input
            type="color"
            value={gradientColor2}
            onChange={(e) => setGradientColor2(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded"
          />
          <div className="flex space-x-2">
            <button
              onClick={() =>
                onApplyEffect("gradient", {
                  color1: gradientColor1,
                  color2: gradientColor2,
                })
              }
              disabled={!isTextSelected}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded hover:from-pink-600 hover:to-violet-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed"
            >
              Apply Gradient
            </button>
            <button
              onClick={() => onClearEffect("gradient")}
              disabled={!isTextSelected}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Clear Gradient"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Effects */}
      <div className="pt-2 border-t">
        <button
          onClick={() => onClearEffect("all")}
          disabled={!isTextSelected}
          className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Clear All Effects
        </button>
      </div>

      {isTextSelected && (
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ Text object selected - effects will apply to selected text
          </p>
        </div>
      )}
    </div>
  );
}
