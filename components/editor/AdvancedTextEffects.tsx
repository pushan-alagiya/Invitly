"use client";

import { useState } from "react";
import {
  Type,
  Palette,
  Droplets,
  Sparkles,
  RotateCw,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Download,
  Heart,
  Star,
  Zap,
} from "lucide-react";

interface TextEffect {
  id: string;
  name: string;
  type: "shadow" | "outline" | "gradient" | "curved" | "glow";
  settings: any;
  preview: string;
}

interface AdvancedTextEffectsProps {
  onEffectApply: (effect: TextEffect) => void;
  onEffectSave: (effect: TextEffect) => void;
  onEffectLoad: (effectId: string) => void;
  savedEffects: TextEffect[];
}

const FONT_PAIRS = [
  {
    name: "Elegant Classic",
    heading: "Playfair Display",
    body: "Lato",
    description: "Perfect for traditional weddings",
  },
  {
    name: "Modern Minimal",
    heading: "Montserrat",
    body: "Open Sans",
    description: "Clean and contemporary",
  },
  {
    name: "Romantic Script",
    heading: "Dancing Script",
    body: "Poppins",
    description: "Romantic and flowing",
  },
  {
    name: "Luxury Serif",
    heading: "Cormorant Garamond",
    body: "Inter",
    description: "Sophisticated and elegant",
  },
  {
    name: "Bold Modern",
    heading: "Roboto",
    body: "Source Sans Pro",
    description: "Strong and confident",
  },
];

const PRESET_EFFECTS: Omit<TextEffect, "id">[] = [
  {
    name: "Elegant Shadow",
    type: "shadow",
    settings: {
      shadowColor: "#000000",
      shadowBlur: 10,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      shadowOpacity: 0.3,
    },
    preview: "Elegant",
  },
  {
    name: "Golden Outline",
    type: "outline",
    settings: {
      stroke: "#D4AF37",
      strokeWidth: 2,
      strokeDashArray: null,
    },
    preview: "Golden",
  },
  {
    name: "Sunset Gradient",
    type: "gradient",
    settings: {
      gradientType: "linear",
      gradientColors: ["#FF6B6B", "#FFE66D", "#4ECDC4"],
      gradientAngle: 45,
    },
    preview: "Sunset",
  },
  {
    name: "Curved Love",
    type: "curved",
    settings: {
      curveType: "arc",
      curveRadius: 200,
      curveSpacing: 2,
    },
    preview: "Love",
  },
  {
    name: "Glowing Heart",
    type: "glow",
    settings: {
      glowColor: "#FF69B4",
      glowBlur: 15,
      glowSpread: 5,
    },
    preview: "Heart",
  },
];

export default function AdvancedTextEffects({
  onEffectApply,
  onEffectSave,
  onEffectLoad,
  savedEffects,
}: AdvancedTextEffectsProps) {
  const [activeTab, setActiveTab] = useState<"effects" | "fonts" | "saved">(
    "effects"
  );
  const [selectedEffect, setSelectedEffect] = useState<TextEffect | null>(null);
  const [customSettings, setCustomSettings] = useState<any>({});
  const [showCustomPanel, setShowCustomPanel] = useState(false);

  const handleEffectSelect = (effect: Omit<TextEffect, "id">) => {
    const newEffect: TextEffect = {
      ...effect,
      id: `effect-${Date.now()}-${Math.random()}`,
    };
    setSelectedEffect(newEffect);
    setCustomSettings(effect.settings);
  };

  const handleEffectApply = () => {
    if (selectedEffect) {
      const effectToApply = {
        ...selectedEffect,
        settings: customSettings,
      };
      onEffectApply(effectToApply);
    }
  };

  const handleEffectSave = () => {
    if (selectedEffect) {
      const effectToSave = {
        ...selectedEffect,
        settings: customSettings,
      };
      onEffectSave(effectToSave);
    }
  };

  const renderShadowSettings = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shadow Color
        </label>
        <input
          type="color"
          value={customSettings.shadowColor || "#000000"}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              shadowColor: e.target.value,
            })
          }
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Blur Radius
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={customSettings.shadowBlur || 10}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              shadowBlur: Number(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">
          {customSettings.shadowBlur || 10}px
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Offset X
          </label>
          <input
            type="range"
            min="-20"
            max="20"
            value={customSettings.shadowOffsetX || 5}
            onChange={(e) =>
              setCustomSettings({
                ...customSettings,
                shadowOffsetX: Number(e.target.value),
              })
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Offset Y
          </label>
          <input
            type="range"
            min="-20"
            max="20"
            value={customSettings.shadowOffsetY || 5}
            onChange={(e) =>
              setCustomSettings({
                ...customSettings,
                shadowOffsetY: Number(e.target.value),
              })
            }
            className="w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={customSettings.shadowOpacity || 0.3}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              shadowOpacity: Number(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">
          {Math.round((customSettings.shadowOpacity || 0.3) * 100)}%
        </div>
      </div>
    </div>
  );

  const renderOutlineSettings = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Outline Color
        </label>
        <input
          type="color"
          value={customSettings.stroke || "#000000"}
          onChange={(e) =>
            setCustomSettings({ ...customSettings, stroke: e.target.value })
          }
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Outline Width
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={customSettings.strokeWidth || 2}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              strokeWidth: Number(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">
          {customSettings.strokeWidth || 2}px
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dash Pattern
        </label>
        <select
          value={customSettings.strokeDashArray || "solid"}
          onChange={(e) => {
            const value = e.target.value;
            setCustomSettings({
              ...customSettings,
              strokeDashArray: value === "solid" ? null : value,
            });
          }}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="solid">Solid</option>
          <option value="5,5">Dashed</option>
          <option value="2,2">Dotted</option>
          <option value="10,5,5,5">Dash-Dot</option>
        </select>
      </div>
    </div>
  );

  const renderGradientSettings = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gradient Type
        </label>
        <select
          value={customSettings.gradientType || "linear"}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              gradientType: e.target.value,
            })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Colors
        </label>
        <div className="space-y-2">
          {(
            customSettings.gradientColors || ["#FF6B6B", "#FFE66D", "#4ECDC4"]
          ).map((color: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const newColors = [...(customSettings.gradientColors || [])];
                  newColors[index] = e.target.value;
                  setCustomSettings({
                    ...customSettings,
                    gradientColors: newColors,
                  });
                }}
                className="w-8 h-8 border border-gray-300 rounded"
              />
              <button
                onClick={() => {
                  const newColors = (
                    customSettings.gradientColors || []
                  ).filter((_, i) => i !== index);
                  setCustomSettings({
                    ...customSettings,
                    gradientColors: newColors,
                  });
                }}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newColors = [
                ...(customSettings.gradientColors || []),
                "#000000",
              ];
              setCustomSettings({
                ...customSettings,
                gradientColors: newColors,
              });
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Color
          </button>
        </div>
      </div>
      {customSettings.gradientType === "linear" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Angle
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={customSettings.gradientAngle || 45}
            onChange={(e) =>
              setCustomSettings({
                ...customSettings,
                gradientAngle: Number(e.target.value),
              })
            }
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">
            {customSettings.gradientAngle || 45}°
          </div>
        </div>
      )}
    </div>
  );

  const renderCurvedSettings = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Curve Type
        </label>
        <select
          value={customSettings.curveType || "arc"}
          onChange={(e) =>
            setCustomSettings({ ...customSettings, curveType: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="arc">Arc</option>
          <option value="spiral">Spiral</option>
          <option value="wave">Wave</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Radius
        </label>
        <input
          type="range"
          min="50"
          max="500"
          value={customSettings.curveRadius || 200}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              curveRadius: Number(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">
          {customSettings.curveRadius || 200}px
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Letter Spacing
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={customSettings.curveSpacing || 2}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              curveSpacing: Number(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">
          {customSettings.curveSpacing || 2}px
        </div>
      </div>
    </div>
  );

  const renderGlowSettings = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Glow Color
        </label>
        <input
          type="color"
          value={customSettings.glowColor || "#FF69B4"}
          onChange={(e) =>
            setCustomSettings({ ...customSettings, glowColor: e.target.value })
          }
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Blur Radius
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={customSettings.glowBlur || 15}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              glowBlur: Number(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">
          {customSettings.glowBlur || 15}px
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Spread
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={customSettings.glowSpread || 5}
          onChange={(e) =>
            setCustomSettings({
              ...customSettings,
              glowSpread: Number(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">
          {customSettings.glowSpread || 5}px
        </div>
      </div>
    </div>
  );

  const renderSettingsPanel = () => {
    if (!selectedEffect) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">
          {selectedEffect.name} Settings
        </h4>
        {selectedEffect.type === "shadow" && renderShadowSettings()}
        {selectedEffect.type === "outline" && renderOutlineSettings()}
        {selectedEffect.type === "gradient" && renderGradientSettings()}
        {selectedEffect.type === "curved" && renderCurvedSettings()}
        {selectedEffect.type === "glow" && renderGlowSettings()}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleEffectApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Effect
          </button>
          <button
            onClick={handleEffectSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Effect
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Advanced Text Effects</h3>
        <button
          onClick={() => setShowCustomPanel(!showCustomPanel)}
          className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          title="Custom effects"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "effects", label: "Effects", icon: Zap },
          { id: "fonts", label: "Font Pairs", icon: Type },
          { id: "saved", label: "Saved", icon: Heart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4 mx-auto mb-1" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "effects" && (
          <div className="space-y-4">
            {/* Preset Effects */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Preset Effects</h4>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_EFFECTS.map((effect, index) => (
                  <button
                    key={index}
                    onClick={() => handleEffectSelect(effect)}
                    className={`p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                      selectedEffect?.name === effect.name
                        ? "border-purple-500 bg-purple-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {effect.type === "shadow" && <Eye className="w-4 h-4" />}
                      {effect.type === "outline" && (
                        <Settings className="w-4 h-4" />
                      )}
                      {effect.type === "gradient" && (
                        <Droplets className="w-4 h-4" />
                      )}
                      {effect.type === "curved" && (
                        <RotateCw className="w-4 h-4" />
                      )}
                      {effect.type === "glow" && (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span className="font-medium text-sm">{effect.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {effect.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Panel */}
            {selectedEffect && renderSettingsPanel()}
          </div>
        )}

        {activeTab === "fonts" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              Font Pairing Suggestions
            </h4>
            <div className="space-y-3">
              {FONT_PAIRS.map((pair, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">{pair.name}</h5>
                    <button
                      onClick={() => {
                        // Apply font pair
                        console.log("Applying font pair:", pair);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="space-y-1 mb-2">
                    <div className="text-sm">
                      <span className="font-medium">Heading:</span>{" "}
                      {pair.heading}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Body:</span> {pair.body}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{pair.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Saved Effects</h4>
            {savedEffects.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No saved effects yet</p>
                <p className="text-sm">
                  Create and save effects to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedEffects.map((effect) => (
                  <div
                    key={effect.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{effect.name}</div>
                      <div className="text-xs text-gray-500">{effect.type}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEffectLoad(effect.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Load effect"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onEffectApply(effect)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Apply effect"
                      >
                        <Zap className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
