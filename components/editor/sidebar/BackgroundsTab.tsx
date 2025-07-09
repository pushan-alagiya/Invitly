"use client";

interface BackgroundsTabProps {
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundPatternSelect: (patternId: string) => void;
}

export default function BackgroundsTab({
  backgroundColor,
  onBackgroundColorChange,
  onBackgroundPatternSelect,
}: BackgroundsTabProps) {
  const backgroundPatterns = [
    {
      id: "floral",
      name: "Floral Pattern",
      preview: "🌸🌺🌹",
      color: "#FDF2F8",
    },
    { id: "geometric", name: "Geometric", preview: "⬡⬢⬣", color: "#EFF6FF" },
    { id: "abstract", name: "Abstract", preview: "✨💫🌟", color: "#FEF3C7" },
    { id: "elegant", name: "Elegant", preview: "💎💍👑", color: "#F3E8FF" },
  ];

  const presetColors = [
    "#FFFFFF",
    "#F8F9FA",
    "#E9ECEF",
    "#DEE2E6",
    "#F8F0FC",
    "#F3E8FF",
    "#EDE9FE",
    "#DDD6FE",
    "#FEF3C7",
    "#FDE68A",
    "#FCD34D",
    "#FBBF24",
    "#DBEAFE",
    "#BFDBFE",
    "#93C5FD",
    "#60A5FA",
    "#FCE7F3",
    "#FBCFE8",
    "#F9A8D4",
    "#EC4899",
    "#D1FAE5",
    "#A7F3D0",
    "#6EE7B7",
    "#10B981",
  ];

  const gradients = [
    {
      id: "gradient-pink",
      name: "Pink to Purple",
      gradient: "linear-gradient(135deg, #EC4899, #8B5CF6)",
    },
    {
      id: "gradient-blue",
      name: "Blue to Cyan",
      gradient: "linear-gradient(135deg, #3B82F6, #06B6D4)",
    },
    {
      id: "gradient-gold",
      name: "Gold to Orange",
      gradient: "linear-gradient(135deg, #F59E0B, #F97316)",
    },
    {
      id: "gradient-green",
      name: "Green to Emerald",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
    },
    {
      id: "gradient-rose",
      name: "Rose to Pink",
      gradient: "linear-gradient(135deg, #F43F5E, #EC4899)",
    },
    {
      id: "gradient-indigo",
      name: "Indigo to Purple",
      gradient: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    },
  ];

  return (
    <div className="p-2 lg:p-4 space-y-3 lg:space-y-4">
      {/* Color Picker */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Background Color
        </h3>
        <div className="flex gap-2 lg:gap-3">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-8 h-8 lg:w-12 lg:h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="flex-1 p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Preset Colors */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Preset Colors
        </h3>
        <div className="grid grid-cols-6 gap-2 lg:gap-3">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => onBackgroundColorChange(color)}
              className="w-8 h-8 lg:w-10 lg:h-10 rounded border-2 border-gray-300 hover:border-blue-400 transition-colors"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Gradient Backgrounds */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Gradient Backgrounds
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          {gradients.map((gradient) => (
            <button
              key={gradient.id}
              onClick={() => onBackgroundColorChange(gradient.gradient)}
              className="h-12 lg:h-16 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors relative overflow-hidden"
              style={{ background: gradient.gradient }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                <span className="text-xs lg:text-sm font-medium text-white drop-shadow-lg">
                  {gradient.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Backgrounds */}
      <div className="space-y-2 lg:space-y-3 pt-2 lg:pt-4 border-t border-gray-200">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Pattern Backgrounds
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          {backgroundPatterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => onBackgroundPatternSelect(pattern.id)}
              className="h-16 lg:h-20 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors relative overflow-hidden bg-gray-50"
            >
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                <span className="text-xs lg:text-sm font-medium text-gray-700 bg-white bg-opacity-90 px-2 py-1 rounded">
                  {pattern.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
