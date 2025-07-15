export interface ShapeConfig {
  type: string;
  name: string;
  icon: string;
  category: string;
  supportsCornerRadius?: boolean;
  defaultCornerRadius?: number;
  color: string;
}

export const SHAPES_CONFIG: ShapeConfig[] = [
  // Basic Shapes
  {
    type: "rect",
    name: "Rectangle",
    icon: "⬜",
    category: "Basic",
    supportsCornerRadius: true,
    defaultCornerRadius: 0,
    color: "#3B82F6",
  },
  {
    type: "square",
    name: "Square",
    icon: "⬜",
    category: "Basic",
    supportsCornerRadius: true,
    defaultCornerRadius: 0,
    color: "#10B981",
  },
  {
    type: "circle",
    name: "Circle",
    icon: "⭕",
    category: "Basic",
    color: "#F59E0B",
  },
  {
    type: "oval",
    name: "Oval",
    icon: "⬭",
    category: "Basic",
    color: "#8B5CF6",
  },
  {
    type: "triangle",
    name: "Triangle",
    icon: "▲",
    category: "Basic",
    color: "#EF4444",
  },
  {
    type: "diamond",
    name: "Diamond",
    icon: "◆",
    category: "Basic",
    color: "#EC4899",
  },

  // Polygons
  {
    type: "pentagon",
    name: "Pentagon",
    icon: "⬟",
    category: "Polygons",
    color: "#F97316",
  },
  {
    type: "hexagon",
    name: "Hexagon",
    icon: "⬡",
    category: "Polygons",
    color: "#6366F1",
  },
  {
    type: "octagon",
    name: "Octagon",
    icon: "⯃",
    category: "Polygons",
    color: "#A855F7",
  },
  {
    type: "star",
    name: "Star",
    icon: "⭐",
    category: "Polygons",
    color: "#FCD34D",
  },
  {
    type: "cross",
    name: "Cross",
    icon: "✚",
    category: "Polygons",
    color: "#DC2626",
  },

  // Arrows
  {
    type: "arrow-right",
    name: "Arrow Right",
    icon: "→",
    category: "Arrows",
    color: "#DC2626",
  },
  {
    type: "arrow-left",
    name: "Arrow Left",
    icon: "←",
    category: "Arrows",
    color: "#DC2626",
  },
  {
    type: "arrow-up",
    name: "Arrow Up",
    icon: "↑",
    category: "Arrows",
    color: "#DC2626",
  },
  {
    type: "arrow-down",
    name: "Arrow Down",
    icon: "↓",
    category: "Arrows",
    color: "#DC2626",
  },

  // Lines
  {
    type: "line",
    name: "Line",
    icon: "━",
    category: "Lines",
    color: "#6B7280",
  },
  {
    type: "line-vertical",
    name: "Vertical Line",
    icon: "┃",
    category: "Lines",
    color: "#6B7280",
  },
  {
    type: "line-diagonal",
    name: "Diagonal Line",
    icon: "╱",
    category: "Lines",
    color: "#6B7280",
  },
  {
    type: "line-zigzag",
    name: "Zigzag Line",
    icon: "⚡",
    category: "Lines",
    color: "#6B7280",
  },
  {
    type: "line-wavy",
    name: "Wavy Line",
    icon: "〰",
    category: "Lines",
    color: "#6B7280",
  },
];

export const SHAPE_CATEGORIES = ["Basic", "Polygons", "Arrows", "Lines"];

export function getShapesByCategory() {
  const shapesByCategory: Record<string, ShapeConfig[]> = {};

  SHAPE_CATEGORIES.forEach((category) => {
    shapesByCategory[category] = SHAPES_CONFIG.filter(
      (shape) => shape.category === category
    );
  });

  return shapesByCategory;
}

export function getShapeConfig(shapeType: string): ShapeConfig | undefined {
  return SHAPES_CONFIG.find((shape) => shape.type === shapeType);
}
