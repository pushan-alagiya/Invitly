"use client";

import { useRef, useEffect, useCallback } from "react";
import * as fabric from "fabric";
import { EditorPage, EditorObject, editorState } from "@/lib/editor-state";

interface JsonCanvasProps {
  page: EditorPage;
  onObjectSelect: (objectId: string | null) => void;
  onMultiSelect?: (objectIds: string[]) => void;
  showGrid?: boolean;
  showRuler?: boolean;
  zoomLevel?: number;
  forceCanvasUpdate?: number;
}

// Interface for Fabric.js objects with our custom data property
interface FabricObjectWithData extends fabric.Object {
  data?: {
    objectId?: string;
    isGridLine?: boolean;
    isRuler?: boolean;
    isUnderline?: boolean;
    hasUnderline?: boolean;
  };
  isMoving?: boolean;
  iconSvg?: string;
  iconName?: string;
  iconPrefix?: string;
  createSvgPattern?: (svgData: string, color: string) => void;
}

export default function JsonCanvas({
  page,
  onObjectSelect,
  onMultiSelect,
  showGrid = false,
  showRuler = false,
  zoomLevel = 1,
  forceCanvasUpdate,
}: JsonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moveUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);

  // Track Fabric.js objects by their object IDs for efficient updates
  const fabricObjectsRef = useRef<Map<string, FabricObjectWithData>>(new Map());

  // Helper function to convert numbers to Roman numerals
  const toRoman = (num: number): string => {
    const romanNumerals = [
      { value: 1000, numeral: "M" },
      { value: 900, numeral: "CM" },
      { value: 500, numeral: "D" },
      { value: 400, numeral: "CD" },
      { value: 100, numeral: "C" },
      { value: 90, numeral: "XC" },
      { value: 50, numeral: "L" },
      { value: 40, numeral: "XL" },
      { value: 10, numeral: "X" },
      { value: 9, numeral: "IX" },
      { value: 5, numeral: "V" },
      { value: 4, numeral: "IV" },
      { value: 1, numeral: "I" },
    ];

    let result = "";
    for (const { value, numeral } of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };

  // Create delete control
  const deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -15,
    offsetX: 15,
    cursorStyleHandler: () => "pointer",
    mouseUpHandler: (eventData, transform) => {
      const target = transform.target as FabricObjectWithData;
      const canvas = fabricCanvasRef.current;
      if (!canvas) return true;

      const activeSelection = canvas.getActiveObjects();
      if (activeSelection && activeSelection.length > 1) {
        activeSelection.forEach((obj) => {
          const fabricObj = obj as FabricObjectWithData;
          if (fabricObj?.data?.objectId) {
            editorState.deleteObject(fabricObj.data.objectId);
          }
        });

        activeSelection.forEach((obj) => {
          canvas.remove(obj);
        });
        canvas.renderAll();
        canvas.discardActiveObject();
        onObjectSelect(null);
      } else if (target?.data?.objectId) {
        editorState.deleteObject(target.data.objectId);
        canvas.remove(target);
        canvas.renderAll();
        canvas.discardActiveObject();
        onObjectSelect(null);
      }
      return true;
    },
    render: (ctx, left, top, styleOverride, fabricObject) => {
      const size = 20;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));

      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(6, 6);
      ctx.moveTo(6, -6);
      ctx.lineTo(-6, 6);
      ctx.stroke();

      ctx.restore();
    },
  });

  // Create duplicate control
  const duplicateControl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    offsetY: -15,
    offsetX: -15,
    cursorStyleHandler: () => "pointer",
    mouseUpHandler: (eventData, transform) => {
      const target = transform.target as FabricObjectWithData;
      const canvas = fabricCanvasRef.current;
      if (!canvas) return true;

      const activeSelection = canvas.getActiveObjects();
      if (activeSelection && activeSelection.length > 1) {
        activeSelection.forEach((obj) => {
          const fabricObj = obj as FabricObjectWithData;
          if (fabricObj?.data?.objectId) {
            editorState.duplicateObject(fabricObj.data.objectId);
          }
        });
      } else if (target?.data?.objectId) {
        editorState.duplicateObject(target.data.objectId);
      }
      return true;
    },
    render: (ctx, left, top, styleOverride, fabricObject) => {
      const size = 20;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));

      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Draw a plus sign
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();

      ctx.restore();
    },
  });

  // Function to draw grid
  const drawGrid = (canvas: fabric.Canvas) => {
    const gridSize = 20;
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    const objects = canvas.getObjects();
    const gridLines = objects.filter(
      (obj) => (obj as FabricObjectWithData).data?.isGridLine === true
    );
    gridLines.forEach((line) => canvas.remove(line));

    if (showGrid) {
      for (let x = 0; x <= width; x += gridSize) {
        const line = new fabric.Line([x, 0, x, height], {
          stroke: "#e5e7eb",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isGridLine: true };
        canvas.insertAt(0, line);
      }

      for (let y = 0; y <= height; y += gridSize) {
        const line = new fabric.Line([0, y, width, y], {
          stroke: "#e5e7eb",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isGridLine: true };
        canvas.insertAt(0, line);
      }
    }

    canvas.renderAll();
  };

  // Function to draw ruler
  const drawRuler = (canvas: fabric.Canvas) => {
    const rulerSize = 30;
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    const objects = canvas.getObjects();
    const rulerElements = objects.filter(
      (obj) => (obj as FabricObjectWithData).data?.isRuler === true
    );
    rulerElements.forEach((element) => canvas.remove(element));

    if (showRuler) {
      for (let x = 0; x <= width; x += 50) {
        const line = new fabric.Line([x, 0, x, rulerSize], {
          stroke: "#374151",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isRuler: true };
        canvas.add(line);

        const text = new fabric.Text(x.toString(), {
          left: x + 2,
          top: 5,
          fontSize: 10,
          fill: "#374151",
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (text as FabricObjectWithData).data = { isRuler: true };
        canvas.add(text);
      }

      for (let y = 0; y <= height; y += 50) {
        const line = new fabric.Line([0, y, rulerSize, y], {
          stroke: "#374151",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isRuler: true };
        canvas.add(line);

        const text = new fabric.Text(y.toString(), {
          left: 5,
          top: y + 2,
          fontSize: 10,
          fill: "#374151",
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (text as FabricObjectWithData).data = { isRuler: true };
        canvas.add(text);
      }
    }

    canvas.renderAll();
  };

  const updateGridAndRuler = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      drawGrid(canvas);
      drawRuler(canvas);
    }
  };

  // Create Fabric.js objects
  const createShapeObject = (obj: EditorObject): FabricObjectWithData => {
    let fabricObject: FabricObjectWithData;

    switch (obj.shapeType) {
      case "circle":
        fabricObject = new fabric.Circle({
          left: obj.left || 0,
          top: obj.top || 0,
          radius: (obj.width || 100) / 2,
          fill: obj.fill || "#3B82F6",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;
        break;

      case "square":
        fabricObject = new fabric.Rect({
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#10B981",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          rx: obj.cornerRadius || 0,
          ry: obj.cornerRadius || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;
        break;

      case "oval":
        fabricObject = new fabric.Ellipse({
          left: obj.left || 0,
          top: obj.top || 0,
          rx: (obj.width || 100) / 2,
          ry: (obj.height || 100) / 2,
          fill: obj.fill || "#8B5CF6",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "triangle":
        fabricObject = new fabric.Triangle({
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#3B82F6",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;
        break;

      case "diamond":
        // Create diamond using a polygon
        const diamondPoints = [
          { x: 0, y: -50 }, // top
          { x: 50, y: 0 }, // right
          { x: 0, y: 50 }, // bottom
          { x: -50, y: 0 }, // left
        ];
        fabricObject = new fabric.Polygon(diamondPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#EC4899",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "pentagon":
        const pentagonPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          pentagonPoints.push({
            x: 50 * Math.cos(angle),
            y: 50 * Math.sin(angle),
          });
        }
        fabricObject = new fabric.Polygon(pentagonPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#F97316",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "hexagon":
        const hexagonPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          hexagonPoints.push({
            x: 50 * Math.cos(angle),
            y: 50 * Math.sin(angle),
          });
        }
        fabricObject = new fabric.Polygon(hexagonPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#6366F1",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "octagon":
        const octagonPoints = [];
        for (let i = 0; i < 8; i++) {
          const angle = (i * 45 - 90) * (Math.PI / 180);
          octagonPoints.push({
            x: 50 * Math.cos(angle),
            y: 50 * Math.sin(angle),
          });
        }
        fabricObject = new fabric.Polygon(octagonPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#A855F7",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "star":
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * 36 - 90) * (Math.PI / 180);
          const radius = i % 2 === 0 ? 50 : 25;
          starPoints.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
          });
        }
        fabricObject = new fabric.Polygon(starPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#FCD34D",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "cross":
        // Create cross using a polygon
        const crossPoints = [
          { x: -30, y: -10 },
          { x: -10, y: -10 },
          { x: -10, y: -30 },
          { x: 10, y: -30 },
          { x: 10, y: -10 },
          { x: 30, y: -10 },
          { x: 30, y: 10 },
          { x: 10, y: 10 },
          { x: 10, y: 30 },
          { x: -10, y: 30 },
          { x: -10, y: 10 },
          { x: -30, y: 10 },
        ];
        fabricObject = new fabric.Polygon(crossPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#DC2626",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "arrow-right":
        const arrowRightPoints = [
          { x: -50, y: -20 },
          { x: 0, y: -20 },
          { x: 0, y: -30 },
          { x: 50, y: 0 },
          { x: 0, y: 30 },
          { x: 0, y: 20 },
          { x: -50, y: 20 },
        ];
        fabricObject = new fabric.Polygon(arrowRightPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#DC2626",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "arrow-left":
        const arrowLeftPoints = [
          { x: 50, y: -20 },
          { x: 0, y: -20 },
          { x: 0, y: -30 },
          { x: -50, y: 0 },
          { x: 0, y: 30 },
          { x: 0, y: 20 },
          { x: 50, y: 20 },
        ];
        fabricObject = new fabric.Polygon(arrowLeftPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#DC2626",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "arrow-up":
        const arrowUpPoints = [
          { x: -20, y: 50 },
          { x: -20, y: 0 },
          { x: -30, y: 0 },
          { x: 0, y: -50 },
          { x: 30, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 50 },
        ];
        fabricObject = new fabric.Polygon(arrowUpPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#DC2626",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "arrow-down":
        const arrowDownPoints = [
          { x: -20, y: -50 },
          { x: -20, y: 0 },
          { x: -30, y: 0 },
          { x: 0, y: 50 },
          { x: 30, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: -50 },
        ];
        fabricObject = new fabric.Polygon(arrowDownPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#DC2626",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "line":
        fabricObject = new fabric.Line([0, 0, obj.width || 100, 0], {
          left: obj.left || 0,
          top: obj.top || 0,
          stroke: obj.fill || "#6B7280",
          strokeWidth: obj.strokeWidth || 3,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;
        break;

      case "line-vertical":
        fabricObject = new fabric.Line([0, 0, 0, obj.height || 100], {
          left: obj.left || 0,
          top: obj.top || 0,
          stroke: obj.fill || "#6B7280",
          strokeWidth: obj.strokeWidth || 3,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;
        break;

      case "line-diagonal":
        fabricObject = new fabric.Line(
          [0, 0, obj.width || 100, obj.height || 100],
          {
            left: obj.left || 0,
            top: obj.top || 0,
            stroke: obj.fill || "#6B7280",
            strokeWidth: obj.strokeWidth || 3,
            opacity: obj.opacity || 1,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          }
        ) as FabricObjectWithData;
        break;

      case "line-zigzag":
        // Create zigzag line using multiple line segments
        const zigzagPoints = [];
        const zigzagWidth = obj.width || 100;
        const zigzagSegments = 8;
        for (let i = 0; i <= zigzagSegments; i++) {
          const x = (zigzagWidth / zigzagSegments) * i;
          const y = i % 2 === 0 ? 0 : 20;
          zigzagPoints.push({ x, y });
        }
        fabricObject = new fabric.Polyline(zigzagPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          stroke: obj.fill || "#6B7280",
          strokeWidth: obj.strokeWidth || 3,
          fill: "transparent",
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      case "line-wavy":
        // Create wavy line using curve
        const wavyPoints = [];
        const wavyWidth = obj.width || 100;
        const wavySegments = 12;
        for (let i = 0; i <= wavySegments; i++) {
          const x = (wavyWidth / wavySegments) * i;
          const y = Math.sin((i / wavySegments) * Math.PI * 4) * 15;
          wavyPoints.push({ x, y });
        }
        fabricObject = new fabric.Polyline(wavyPoints, {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          stroke: obj.fill || "#6B7280",
          strokeWidth: obj.strokeWidth || 3,
          fill: "transparent",
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          objectCaching: false,
          originX: "center",
          originY: "center",
        }) as FabricObjectWithData;
        break;

      default:
        // Default to rectangle for any unrecognized shape type
        fabricObject = new fabric.Rect({
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100,
          fill: obj.fill || "#3B82F6",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 0,
          rx: obj.cornerRadius || 0,
          ry: obj.cornerRadius || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;
    }

    // Ensure delete control is applied to this object
    fabricObject.controls = {
      ...fabricObject.controls,
      delete: deleteControl,
      duplicate: duplicateControl,
    };

    fabricObject.data = { objectId: obj.id };
    return fabricObject;
  };

  const createTextObject = (obj: EditorObject): FabricObjectWithData => {
    const applyListFormatting = (
      text: string,
      listType: string,
      listStyle?: string
    ): string => {
      if (!listType || listType === "none") return text;

      const lines = text.split("\n");
      const formattedLines = lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return line;

        // Remove existing list markers first
        const cleanLine = trimmedLine
          .replace(/^[•\-\*○■]\s*/, "")
          .replace(/^\d+\.\s*/, "")
          .replace(/^[a-z]\.\s*/i, "")
          .replace(/^[ivxlcdm]+\.\s*/i, "");

        if (listType === "bullet") {
          switch (listStyle) {
            case "circle":
              return `○ ${cleanLine}`;
            case "square":
              return `■ ${cleanLine}`;
            default:
              return `• ${cleanLine}`;
          }
        } else if (listType === "number") {
          switch (listStyle) {
            case "lower-alpha":
              return `${String.fromCharCode(97 + index)}. ${cleanLine}`;
            case "upper-alpha":
              return `${String.fromCharCode(65 + index)}. ${cleanLine}`;
            case "lower-roman":
              return `${toRoman(index + 1).toLowerCase()}. ${cleanLine}`;
            case "upper-roman":
              return `${toRoman(index + 1)}. ${cleanLine}`;
            default:
              return `${index + 1}. ${cleanLine}`;
          }
        }
        return cleanLine;
      });

      return formattedLines.join("\n");
    };

    let displayText = obj.text || "";
    if (obj.listType && obj.listType !== "none") {
      displayText = applyListFormatting(
        displayText,
        obj.listType,
        obj.listStyle
      );
    }

    const fabricObject = new fabric.Text(displayText, {
      left: obj.left || 0,
      top: obj.top || 0,
      fontSize: obj.fontSize || 24,
      fontFamily: obj.fontFamily || "Arial",
      fontWeight: obj.fontWeight || "normal",
      fontStyle: obj.fontStyle || "normal",
      fill: obj.fill || "#000000",
      backgroundColor: obj.textBackgroundColor || "transparent",
      textAlign:
        (obj.textAlign as "left" | "center" | "right" | "justify") || "left",
      lineHeight: obj.lineHeight || 1.2,
      charSpacing: obj.letterSpacing || 0,
      opacity: obj.opacity || 1,
      angle: obj.angle || 0,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      editable: true,
    }) as FabricObjectWithData;

    // Set textDecoration property correctly
    if (obj.textDecoration === "underline") {
      fabricObject.set({ underline: true });
    } else {
      fabricObject.set({ underline: false });
    }

    // Apply word spacing using a different approach - modify the text with spaces
    if (obj.wordSpacing && obj.wordSpacing > 0) {
      // Split text into words and add extra spaces
      const words = displayText.split(" ");
      const spacedText = words.join(
        " ".repeat(Math.floor(obj.wordSpacing / 2) + 1)
      );
      fabricObject.set({ text: spacedText });
    }

    if (obj.textShadow) {
      fabricObject.set({
        shadow: new fabric.Shadow({
          color: obj.textShadow.color,
          blur: obj.textShadow.blur,
          offsetX: obj.textShadow.offsetX,
          offsetY: obj.textShadow.offsetY,
        }),
      });
    }

    // Ensure delete control is applied to this object
    fabricObject.controls = {
      ...fabricObject.controls,
      delete: deleteControl,
      duplicate: duplicateControl,
    };

    fabricObject.data = { objectId: obj.id };
    return fabricObject;
  };

  const createIconObject = async (
    obj: EditorObject
  ): Promise<FabricObjectWithData> => {
    if (!obj.iconSvg) {
      // Fallback to a simple rectangle if no SVG is provided
      const fabricObject = new fabric.Rect({
        left: obj.left || 0,
        top: obj.top || 0,
        width: obj.width || 48,
        height: obj.height || 48,
        fill: obj.fill || "#000000",
        stroke: "transparent",
        strokeWidth: 0,
        opacity: obj.opacity || 1,
        angle: obj.angle || 0,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
      }) as FabricObjectWithData;

      fabricObject.data = { objectId: obj.id };
      return fabricObject;
    }

    return new Promise((resolve) => {
      try {
        // Extract path data using regex (simpler approach)
        const pathMatch = obj.iconSvg?.match(/d="([^"]+)"/);
        if (!pathMatch) {
          createFallbackObject();
          return;
        }

        const pathData = pathMatch[1];

        // Create a fabric.js path object from the SVG path data
        const fabricObject = new fabric.Path(pathData, {
          left: obj.left || 0,
          top: obj.top || 0,
          fill: obj.fill || "transparent",
          stroke: "transparent",
          strokeWidth: 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;

        fabricObject.data = { objectId: obj.id };
        fabricObject.iconSvg = obj.iconSvg;
        fabricObject.iconName = obj.iconName;
        fabricObject.iconPrefix = obj.iconPrefix;

        // Ensure delete control is applied to this object
        fabricObject.controls = {
          ...fabricObject.controls,
          delete: deleteControl,
          duplicate: duplicateControl,
        };

        resolve(fabricObject);

        function createFallbackObject() {
          const fabricObject = new fabric.Circle({
            left: obj.left || 0,
            top: obj.top || 0,
            radius: 20,
            fill: obj.fill || "transparent",
            stroke: "transparent",
            strokeWidth: 0,
            opacity: obj.opacity || 1,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          }) as FabricObjectWithData;

          // Ensure delete control is applied to this object
          fabricObject.controls = {
            ...fabricObject.controls,
            delete: deleteControl,
            duplicate: duplicateControl,
          };

          fabricObject.data = { objectId: obj.id };
          fabricObject.iconSvg = obj.iconSvg;
          fabricObject.iconName = obj.iconName;
          fabricObject.iconPrefix = obj.iconPrefix;
          resolve(fabricObject);
        }
      } catch {
        // Create fallback circle
        const fabricObject = new fabric.Circle({
          left: obj.left || 0,
          top: obj.top || 0,
          radius: 20,
          fill: obj.fill || "transparent",
          stroke: "transparent",
          strokeWidth: 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        }) as FabricObjectWithData;

        // Ensure delete control is applied to this object
        fabricObject.controls = {
          ...fabricObject.controls,
          delete: deleteControl,
          duplicate: duplicateControl,
        };

        fabricObject.data = { objectId: obj.id };
        fabricObject.iconSvg = obj.iconSvg;
        fabricObject.iconName = obj.iconName;
        fabricObject.iconPrefix = obj.iconPrefix;
        resolve(fabricObject);
      }
    });
  };

  const createImageObject = async (
    obj: EditorObject
  ): Promise<FabricObjectWithData> => {
    return new Promise((resolve, reject) => {
      if (!obj.imageUrl) {
        reject(new Error("No image URL provided"));
        return;
      }

      // Load the image first
      const img = new Image();

      // Try different CORS settings
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const fabricObject = new fabric.Image(img, {
            left: obj.left || 0,
            top: obj.top || 0,
            opacity: obj.opacity || 1,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          }) as FabricObjectWithData;

          // Ensure delete control is applied to this object
          fabricObject.controls = {
            ...fabricObject.controls,
            delete: deleteControl,
            duplicate: duplicateControl,
          };

          fabricObject.data = { objectId: obj.id };
          resolve(fabricObject);
        } catch (error) {
          console.error("Error creating Fabric.js image object:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error(
          "Failed to load image with CORS anonymous:",
          obj.imageUrl,
          error
        );

        // Try without CORS as fallback
        const imgWithoutCors = new Image();
        imgWithoutCors.onload = () => {
          try {
            const fabricObject = new fabric.Image(imgWithoutCors, {
              left: obj.left || 0,
              top: obj.top || 0,
              opacity: obj.opacity || 1,
              angle: obj.angle || 0,
              scaleX: obj.scaleX || 1,
              scaleY: obj.scaleY || 1,
            }) as FabricObjectWithData;

            // Ensure delete control is applied to this object
            fabricObject.controls = {
              ...fabricObject.controls,
              delete: deleteControl,
              duplicate: duplicateControl,
            };

            fabricObject.data = { objectId: obj.id };
            resolve(fabricObject);
          } catch (error) {
            console.error(
              "Error creating Fabric.js image object without CORS:",
              error
            );
            createFallbackObject();
          }
        };

        imgWithoutCors.onerror = () => {
          console.error("Failed to load image without CORS:", obj.imageUrl);
          createFallbackObject();
        };

        imgWithoutCors.src = obj.imageUrl || "";
      };

      const createFallbackObject = () => {
        // Create a fallback rectangle with error message
        const fallbackObject = new fabric.Rect({
          left: obj.left || 0,
          top: obj.top || 0,
          width: 200,
          height: 150,
          fill: "#ff0000",
          stroke: "#000000",
          strokeWidth: 2,
        }) as FabricObjectWithData;

        // Ensure delete control is applied to this object
        fallbackObject.controls = {
          ...fallbackObject.controls,
          delete: deleteControl,
          duplicate: duplicateControl,
        };

        fallbackObject.data = { objectId: obj.id };

        // Add error text
        const errorText = new fabric.Text("Image failed to load", {
          left: obj.left || 0,
          top: (obj.top || 0) + 75,
          fontSize: 12,
          fill: "#ffffff",
          textAlign: "center",
        });

        // Create a group with the rectangle and text
        const group = new fabric.Group([fallbackObject, errorText], {
          left: obj.left || 0,
          top: obj.top || 0,
        }) as FabricObjectWithData;

        // Ensure delete control is applied to this group
        group.controls = {
          ...group.controls,
          delete: deleteControl,
          duplicate: duplicateControl,
        };

        group.data = { objectId: obj.id };
        resolve(group);
      };

      // Set the source after setting up event handlers
      img.src = obj.imageUrl || "";
    });
  };

  // Update individual objects efficiently
  const updateObject = useCallback(async (obj: EditorObject) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const fabricObject = fabricObjectsRef.current.get(obj.id);
    if (!fabricObject) return;

    switch (obj.type) {
      case "text":
        const applyListFormatting = (
          text: string,
          listType: string,
          listStyle?: string
        ): string => {
          if (!listType || listType === "none") return text;

          const lines = text.split("\n");
          const formattedLines = lines.map((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return line;

            // Remove existing list markers first
            const cleanLine = trimmedLine
              .replace(/^[•\-\*○■]\s*/, "")
              .replace(/^\d+\.\s*/, "")
              .replace(/^[a-z]\.\s*/i, "")
              .replace(/^[ivxlcdm]+\.\s*/i, "");

            if (listType === "bullet") {
              switch (listStyle) {
                case "circle":
                  return `○ ${cleanLine}`;
                case "square":
                  return `■ ${cleanLine}`;
                default:
                  return `• ${cleanLine}`;
              }
            } else if (listType === "number") {
              switch (listStyle) {
                case "lower-alpha":
                  return `${String.fromCharCode(97 + index)}. ${cleanLine}`;
                case "upper-alpha":
                  return `${String.fromCharCode(65 + index)}. ${cleanLine}`;
                case "lower-roman":
                  return `${toRoman(index + 1).toLowerCase()}. ${cleanLine}`;
                case "upper-roman":
                  return `${toRoman(index + 1)}. ${cleanLine}`;
                default:
                  return `${index + 1}. ${cleanLine}`;
              }
            }
            return cleanLine;
          });

          return formattedLines.join("\n");
        };

        let displayText = obj.text || "";
        if (obj.listType && obj.listType !== "none") {
          displayText = applyListFormatting(
            displayText,
            obj.listType,
            obj.listStyle
          );
        }

        // Update all text properties at once
        const textProperties = {
          text: displayText,
          fontSize: obj.fontSize || 24,
          fontFamily: obj.fontFamily || "Arial",
          fontWeight: obj.fontWeight || "normal",
          fontStyle: obj.fontStyle || "normal",
          fill: obj.fill || "#000000",
          backgroundColor: obj.textBackgroundColor || "transparent",
          textAlign:
            (obj.textAlign as "left" | "center" | "right" | "justify") ||
            "left",
          lineHeight: obj.lineHeight || 1.2,
          charSpacing: obj.letterSpacing || 0,
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        };

        fabricObject.set(textProperties);

        // Set textDecoration property correctly
        if (obj.textDecoration === "underline") {
          fabricObject.set({ underline: true });
        } else {
          fabricObject.set({ underline: false });
        }

        // Apply word spacing using a different approach - modify the text with spaces
        if (obj.wordSpacing && obj.wordSpacing > 0) {
          // Split text into words and add extra spaces
          const words = displayText.split(" ");
          const spacedText = words.join(
            " ".repeat(Math.floor(obj.wordSpacing / 2) + 1)
          );
          fabricObject.set({ text: spacedText });
        }

        // Apply text shadow
        if (obj.textShadow) {
          fabricObject.set({
            shadow: new fabric.Shadow({
              color: obj.textShadow.color,
              blur: obj.textShadow.blur,
              offsetX: obj.textShadow.offsetX,
              offsetY: obj.textShadow.offsetY,
            }),
          });
        } else {
          fabricObject.set({ shadow: null });
        }

        // Force immediate re-render
        canvas.requestRenderAll();

        break;

      case "shape":
        // Check if this is a custom shape (polygon, polyline, ellipse)
        if (
          obj.shapeType &&
          [
            "diamond",
            "pentagon",
            "hexagon",
            "octagon",
            "star",
            "cross",
            "arrow-right",
            "arrow-left",
            "arrow-up",
            "arrow-down",
            "line-zigzag",
            "line-wavy",
          ].includes(obj.shapeType)
        ) {
          // Handle custom shapes like icons - only update scale, opacity, angle, and fill
          const customShapeUpdates: Partial<fabric.Object> = {
            fill: obj.fill || "#3B82F6",
            stroke: obj.stroke || "#000000",
            strokeWidth: obj.strokeWidth || 0,
            opacity: obj.opacity || 1,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          };

          fabricObject.set(customShapeUpdates);

          // Force immediate re-render for custom shapes
          canvas.requestRenderAll();
        } else {
          // Handle basic shapes (rect, circle, triangle)
          // Check if the shape type has changed
          const currentShapeType = fabricObject.type;
          const newShapeType = obj.shapeType || "rect";

          // Map our shapeType values to Fabric.js types
          const getFabricShapeType = (shapeType: string) => {
            switch (shapeType) {
              case "circle":
                return "circle";
              case "triangle":
                return "triangle";
              case "rect":
              default:
                return "rect";
            }
          };

          const expectedFabricType = getFabricShapeType(newShapeType);

          if (currentShapeType !== expectedFabricType) {
            // Shape type changed, recreate the object
            // Store current selection state
            const wasSelected = canvas.getActiveObject() === fabricObject;
            const wasInSelection = canvas
              .getActiveObjects()
              .includes(fabricObject);

            // Remove the old shape object
            canvas.remove(fabricObject);
            fabricObjectsRef.current.delete(obj.id);

            // Create new shape object
            const newShapeObject = createShapeObject(obj);
            if (newShapeObject) {
              canvas.add(newShapeObject);
              fabricObjectsRef.current.set(obj.id, newShapeObject);

              // Restore selection state
              if (wasSelected) {
                canvas.setActiveObject(newShapeObject);
              } else if (wasInSelection) {
                // If it was part of a multi-selection, we need to rebuild the selection
                const currentSelection = canvas.getActiveObjects();
                const newSelection = new fabric.ActiveSelection(
                  [...currentSelection, newShapeObject],
                  {
                    canvas: canvas,
                  }
                );
                canvas.setActiveObject(newSelection);
              }

              canvas.renderAll();
            }
          } else {
            // Only update properties if shape type hasn't changed
            const shapeUpdates: Partial<fabric.Object> = {
              fill: obj.fill || "#3B82F6",
              stroke: obj.stroke || "#000000",
              strokeWidth: obj.strokeWidth || 0,
              opacity: obj.opacity || 1,
              angle: obj.angle || 0,
              scaleX: obj.scaleX || 1,
              scaleY: obj.scaleY || 1,
            };

            if (obj.shapeType === "rect") {
              (shapeUpdates as fabric.Rect).rx = obj.cornerRadius || 0;
              (shapeUpdates as fabric.Rect).ry = obj.cornerRadius || 0;
            }

            fabricObject.set(shapeUpdates);

            // Force immediate re-render for shapes
            canvas.requestRenderAll();
          }
        }
        break;

      case "icon":
        // Update icon properties - respect transparent fill
        const iconUpdates: Partial<fabric.Object> = {
          fill: obj.fill || "transparent",
          opacity: obj.opacity || 1,
          angle: obj.angle || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
        };

        fabricObject.set(iconUpdates);

        // Force immediate re-render for icons
        canvas.requestRenderAll();
        break;

      case "image":
        // Check if the image URL has changed
        const currentImageUrl = (fabricObject as fabric.Image).getSrc();
        if (obj.imageUrl && currentImageUrl !== obj.imageUrl) {
          // Image URL changed, reload the image
          // Remove the old image object
          canvas.remove(fabricObject);
          fabricObjectsRef.current.delete(obj.id);

          // Create new image object
          const newImageObject = await createImageObject(obj);
          if (newImageObject) {
            canvas.add(newImageObject);
            fabricObjectsRef.current.set(obj.id, newImageObject);
          }
        } else {
          // Only update position and transform properties
          const imageUpdates: Partial<fabric.Object> = {
            opacity: obj.opacity || 1,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          };
          fabricObject.set(imageUpdates);

          // Force immediate re-render for images
          canvas.requestRenderAll();
        }
        break;
    }

    // Force re-render to ensure changes are visible
    canvas.requestRenderAll();
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: page.width,
      height: page.height,
      backgroundColor: page.backgroundColor,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Add delete control to all objects
    fabric.Object.prototype.controls = {
      ...fabric.Object.prototype.controls,
      delete: deleteControl,
      duplicate: duplicateControl,
    };

    // Event handlers
    const handleSelectionCreated = (e: { selected?: fabric.Object[] }) => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      selectionTimeoutRef.current = setTimeout(() => {
        const selected = e.selected || [];
        if (selected.length === 1) {
          const fabricObj = selected[0] as FabricObjectWithData;
          if (fabricObj?.data?.objectId) {
            onObjectSelect(fabricObj.data.objectId);
          }
        } else if (selected.length > 1) {
          const objectIds = selected
            .map((obj) => (obj as FabricObjectWithData).data?.objectId)
            .filter((id) => id !== undefined) as string[];
          onMultiSelect?.(objectIds);
        }
      }, 100);
    };

    const handleSelectionUpdated = (e: { selected?: fabric.Object[] }) => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      selectionTimeoutRef.current = setTimeout(() => {
        const selected = e.selected || [];
        if (selected.length === 1) {
          const fabricObj = selected[0] as FabricObjectWithData;
          if (fabricObj?.data?.objectId) {
            onObjectSelect(fabricObj.data.objectId);
          }
        } else if (selected.length > 1) {
          const objectIds = selected
            .map((obj) => (obj as FabricObjectWithData).data?.objectId)
            .filter((id) => id !== undefined) as string[];
          onMultiSelect?.(objectIds);
        }
      }, 100);
    };

    const handleSelectionCleared = () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      selectionTimeoutRef.current = setTimeout(() => {
        onObjectSelect(null);
      }, 100);
    };

    const handleObjectModified = (e: { target?: fabric.Object }) => {
      const target = e.target as FabricObjectWithData;
      if (!target?.data?.objectId) return;

      isDraggingRef.current = false;

      const updates: Partial<EditorObject> = {
        left: target.left || 0,
        top: target.top || 0,
        angle: target.angle || 0,
        scaleX: target.scaleX || 1,
        scaleY: target.scaleY || 1,
      };

      if (target.type === "text") {
        const textObj = target as fabric.Text;
        // Don't update the text content to avoid word spacing feedback loop
        // updates.text = textObj.text || "";
        updates.fontSize = textObj.fontSize || 24;
        updates.fontFamily = textObj.fontFamily || "Arial";
        updates.fontWeight = (textObj.fontWeight as string) || "normal";
        updates.fontStyle = textObj.fontStyle || "normal";
        updates.textDecoration = textObj.underline ? "underline" : "none";
        updates.fill = (textObj.fill as string) || "#000000";
        updates.textAlign = textObj.textAlign || "left";
        updates.lineHeight = textObj.lineHeight || 1.2;
        updates.letterSpacing = textObj.charSpacing || 0;
        updates.opacity = textObj.opacity || 1;

        // Note: Word spacing is not extracted from text content to avoid feedback loop
        // Word spacing is preserved from the original object state
      } else if (
        target.type === "rect" ||
        target.type === "circle" ||
        target.type === "triangle"
      ) {
        updates.width = target.width || 100;
        updates.height = target.height || 100;
        updates.fill = (target.fill as string) || "#3B82F6";
        updates.stroke = (target.stroke as string) || "#000000";
        updates.strokeWidth = target.strokeWidth || 0;
        updates.opacity = target.opacity || 1;

        if (target.type === "rect") {
          updates.cornerRadius = (target as fabric.Rect).rx || 0;
        }
      } else if (
        target.type === "polygon" ||
        target.type === "polyline" ||
        target.type === "ellipse"
      ) {
        // For custom shapes, ONLY update scale, NEVER update width/height during scaling!
        // This allows fabric.js to handle scaling smoothly.
        // Width/height will be updated in handleObjectModified if you want to persist the new size.
        console.log(
          "Custom shape scaling - only updating scale, not width/height"
        );
      } else if (target.type === "image") {
        // For images, preserve the original dimensions and only update position/transform
        updates.opacity = target.opacity || 1;
        // Don't update width/height for images to preserve their original size
      }

      if (target.data?.objectId) {
        editorState.updateObjectSilent(target.data.objectId, updates);
      }
    };

    const handleObjectMoving = (e: { target?: fabric.Object }) => {
      const target = e.target as FabricObjectWithData;
      if (!target?.data?.objectId) return;

      target.isMoving = true;
      isDraggingRef.current = true;

      if (moveUpdateTimeoutRef.current) {
        clearTimeout(moveUpdateTimeoutRef.current);
      }

      moveUpdateTimeoutRef.current = setTimeout(() => {
        if (target.isMoving && target.data?.objectId) {
          const updates: Partial<EditorObject> = {
            left: target.left || 0,
            top: target.top || 0,
          };
          editorState.updateObjectSilent(target.data.objectId, updates);
          target.isMoving = false;
        }
      }, 50);
    };

    const handleObjectScaling = (e: { target?: fabric.Object }) => {
      const target = e.target as FabricObjectWithData;
      if (!target?.data?.objectId) return;

      isDraggingRef.current = true;

      console.log(
        "Scaling object:",
        target.type,
        "scaleX:",
        target.scaleX,
        "scaleY:",
        target.scaleY
      );

      const updates: Partial<EditorObject> = {
        scaleX: target.scaleX || 1,
        scaleY: target.scaleY || 1,
      };

      // Handle width/height updates based on object type
      if (target.type === "image") {
        // Images don't need width/height updates during scaling
        // They maintain their aspect ratio and dimensions
        console.log("Image scaling - no width/height update");
      } else if (target.type === "text") {
        // Text objects use their own width/height
        updates.width = target.width || 100;
        updates.height = target.height || 100;
        console.log(
          "Text scaling - updating width/height:",
          updates.width,
          updates.height
        );
      } else if (
        target.type === "rect" ||
        target.type === "circle" ||
        target.type === "triangle"
      ) {
        // Basic shapes use their width/height
        updates.width = target.width || 100;
        updates.height = target.height || 100;
        console.log(
          "Basic shape scaling - updating width/height:",
          updates.width,
          updates.height
        );
      } else if (
        target.type === "polygon" ||
        target.type === "polyline" ||
        target.type === "ellipse"
      ) {
        // For custom shapes, ONLY update scale, NEVER update width/height during scaling!
        // This allows fabric.js to handle scaling smoothly.
        // Width/height will be updated in handleObjectModified if you want to persist the new size.
        console.log(
          "Custom shape scaling - only updating scale, not width/height"
        );
      } else {
        // Default fallback for other object types
        updates.width = target.width || 100;
        updates.height = target.height || 100;
        console.log(
          "Default scaling - updating width/height:",
          updates.width,
          updates.height
        );
      }

      console.log("Final updates:", updates);
      editorState.updateObjectSilent(target.data.objectId, updates);
    };

    const handleObjectRotating = (e: { target?: fabric.Object }) => {
      const target = e.target as FabricObjectWithData;
      if (!target?.data?.objectId) return;

      isDraggingRef.current = true;

      const updates: Partial<EditorObject> = {
        angle: target.angle || 0,
      };

      editorState.updateObjectSilent(target.data.objectId, updates);
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectScaling);
    canvas.on("object:rotating", handleObjectRotating);

    // Add double-click event for text editing
    canvas.on("mouse:dblclick", (e) => {
      const target = e.target as FabricObjectWithData;
      if (target && target.type === "text" && target.data?.objectId) {
        // Enter text editing mode using canvas methods
        canvas.setActiveObject(target);
        canvas.renderAll();
      }
    });

    // Handle text editing completion
    canvas.on("text:changed", (e) => {
      const target = e.target as FabricObjectWithData;
      if (target && target.data?.objectId) {
        // Update the text content in the editor state
        const textObject = target as fabric.Text;
        const updates: Partial<EditorObject> = {
          text: textObject.text || "",
        };
        editorState.updateObjectSilent(target.data.objectId, updates);
      }
    });

    // Handle text editing end
    canvas.on("text:editing:exited", (e) => {
      const target = e.target as FabricObjectWithData;
      if (target && target.data?.objectId) {
        // Update the text content in the editor state when editing is finished
        const textObject = target as fabric.Text;
        const updates: Partial<EditorObject> = {
          text: textObject.text || "",
        };
        editorState.updateObjectSilent(target.data.objectId, updates);
      }
    });

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      const fabricObj = activeObject as FabricObjectWithData;
      if (!fabricObj?.data?.objectId) return;

      const updates: Partial<EditorObject> = {};
      const moveAmount = e.shiftKey ? 10 : 1; // Shift for larger movement

      switch (e.key) {
        case "Delete":
          e.preventDefault();
          editorState.deleteObject(fabricObj.data.objectId);
          canvas.remove(activeObject);
          canvas.renderAll();
          canvas.discardActiveObject();
          onObjectSelect(null);
          break;

        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + arrow for rotation
            updates.angle = (fabricObj.angle || 0) - 15;
          } else {
            // Regular arrow for movement with boundary checking
            const newLeft = Math.max(0, (fabricObj.left || 0) - moveAmount);
            updates.left = newLeft;
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + arrow for rotation
            updates.angle = (fabricObj.angle || 0) + 15;
          } else {
            // Regular arrow for movement with boundary checking
            const maxLeft = page.width - (fabricObj.width || 100);
            const newLeft = Math.min(
              maxLeft,
              (fabricObj.left || 0) + moveAmount
            );
            updates.left = newLeft;
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          // Regular arrow for movement with boundary checking
          const newTop = Math.max(0, (fabricObj.top || 0) - moveAmount);
          updates.top = newTop;
          break;

        case "ArrowDown":
          e.preventDefault();
          // Regular arrow for movement with boundary checking
          const maxTop = page.height - (fabricObj.height || 100);
          const newTopDown = Math.min(
            maxTop,
            (fabricObj.top || 0) + moveAmount
          );
          updates.top = newTopDown;
          break;

        case "b":
        case "B":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (fabricObj.type === "text") {
              const textObj = fabricObj as fabric.Text;
              const newWeight =
                textObj.fontWeight === "bold" ? "normal" : "bold";
              updates.fontWeight = newWeight;
            }
          }
          break;

        case "i":
        case "I":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (fabricObj.type === "text") {
              const textObj = fabricObj as fabric.Text;
              const newStyle =
                textObj.fontStyle === "italic" ? "normal" : "italic";
              updates.fontStyle = newStyle;
            }
          }
          break;

        case "u":
        case "U":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (fabricObj.type === "text") {
              const textObj = fabricObj as fabric.Text;
              const newDecoration =
                (textObj as fabric.Text & { textDecoration?: string })
                  .textDecoration === "underline"
                  ? ""
                  : "underline";
              updates.textDecoration = newDecoration;
            }
          }
          break;
      }

      if (Object.keys(updates).length > 0) {
        // Update the editor state
        editorState.updateObjectSilent(fabricObj.data.objectId, updates);

        // Also update the Fabric.js object directly for immediate visual feedback
        if (updates.left !== undefined) {
          fabricObj.set({ left: updates.left });
        }
        if (updates.top !== undefined) {
          fabricObj.set({ top: updates.top });
        }
        if (updates.angle !== undefined) {
          fabricObj.set({ angle: updates.angle });
        }
        if (updates.fontWeight !== undefined) {
          fabricObj.set({ fontWeight: updates.fontWeight });
        }
        if (updates.fontStyle !== undefined) {
          fabricObj.set({ fontStyle: updates.fontStyle });
        }
        if (updates.textDecoration !== undefined) {
          fabricObj.set({ underline: updates.textDecoration === "underline" });
        }

        // Force immediate canvas update
        canvas.requestRenderAll();
      }
    };

    // Attach keyboard handler to the canvas element itself
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener("keydown", handleKeyDown);
    }

    // Also attach to document for when canvas doesn't have focus
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.dispose();
      if (canvasElement) {
        canvasElement.removeEventListener("keydown", handleKeyDown);
      }
      document.removeEventListener("keydown", handleKeyDown);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      if (moveUpdateTimeoutRef.current) {
        clearTimeout(moveUpdateTimeoutRef.current);
      }
    };
  }, [page.width, page.height, page.backgroundColor]);

  // Update background color when it changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Check if the background is a gradient or pattern
    if (
      page.backgroundColor.startsWith("linear-gradient") ||
      page.backgroundColor.startsWith("radial-gradient")
    ) {
      // For gradients, we need to create a pattern
      const gradientCanvas = document.createElement("canvas");
      const gradientCtx = gradientCanvas.getContext("2d");
      if (gradientCtx) {
        gradientCanvas.width = page.width;
        gradientCanvas.height = page.height;

        // Parse gradient string
        const gradientStr = page.backgroundColor;

        if (gradientStr.startsWith("linear-gradient")) {
          // Handle linear gradients
          const matches = gradientStr.match(/#[A-Fa-f0-9]{6}/g);
          if (matches && matches.length >= 2) {
            const gradient = gradientCtx.createLinearGradient(
              0,
              0,
              page.width,
              page.height
            );

            // Add color stops
            matches.forEach((color, index) => {
              const stop = index / (matches.length - 1);
              gradient.addColorStop(stop, color);
            });

            gradientCtx.fillStyle = gradient;
            gradientCtx.fillRect(0, 0, page.width, page.height);
          }
        } else if (gradientStr.startsWith("radial-gradient")) {
          // Handle radial gradients
          const matches = gradientStr.match(/#[A-Fa-f0-9]{6}/g);
          if (matches && matches.length >= 2) {
            const gradient = gradientCtx.createRadialGradient(
              page.width / 2,
              page.height / 2,
              0,
              page.width / 2,
              page.height / 2,
              Math.max(page.width, page.height) / 2
            );

            // Add color stops
            matches.forEach((color, index) => {
              const stop = index / (matches.length - 1);
              gradient.addColorStop(stop, color);
            });

            gradientCtx.fillStyle = gradient;
            gradientCtx.fillRect(0, 0, page.width, page.height);
          }
        }

        // Create fabric pattern from the canvas
        const pattern = new fabric.Pattern({
          source: gradientCanvas,
          repeat: "no-repeat",
        });

        if (pattern) {
          canvas.backgroundColor = pattern;
          canvas.renderAll();
        }
      }
    } else if (page.backgroundColor.startsWith("url(")) {
      // Handle image backgrounds
      const imageUrl = page.backgroundColor.match(
        /url\(['"]?([^'"]+)['"]?\)/
      )?.[1];
      if (imageUrl) {
        // Create a fabric pattern from the image using the same pattern as createImageObject
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          // Create a canvas to scale the image to cover the full page
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) {
            canvas.backgroundColor = "#ffffff";
            canvas.renderAll();
            return;
          }

          tempCanvas.width = page.width;
          tempCanvas.height = page.height;

          // Calculate scaling to cover the full canvas
          const imgAspectRatio = img.width / img.height;
          const canvasAspectRatio = page.width / page.height;

          let drawWidth, drawHeight, drawX, drawY;

          if (imgAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas - scale to height and crop width
            drawHeight = page.height;
            drawWidth = page.height * imgAspectRatio;
            drawX = (page.width - drawWidth) / 2;
            drawY = 0;
          } else {
            // Image is taller than canvas - scale to width and crop height
            drawWidth = page.width;
            drawHeight = page.width / imgAspectRatio;
            drawX = 0;
            drawY = (page.height - drawHeight) / 2;
          }

          // Draw the scaled image
          tempCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Create fabric pattern from the scaled canvas
          const pattern = new fabric.Pattern({
            source: tempCanvas,
            repeat: "no-repeat",
          });

          canvas.backgroundColor = pattern;
          canvas.renderAll();
        };

        img.onerror = () => {
          // Fallback to white background if image fails to load
          canvas.backgroundColor = "#ffffff";
          canvas.renderAll();
        };

        img.src = imageUrl;
      }
    } else {
      // For solid colors, use the backgroundColor directly
      canvas.backgroundColor = page.backgroundColor;
      canvas.renderAll();
    }

    // Force a complete re-sync of all objects after background change
    setTimeout(async () => {
      if (canvas) {
        try {
          // Get all current objects
          const currentObjects = Array.from(fabricObjectsRef.current.entries());

          // Remove all content objects (but keep grid/ruler)
          const objects = canvas.getObjects();
          objects.forEach((obj) => {
            if (
              !(obj as FabricObjectWithData).data?.isGridLine &&
              !(obj as FabricObjectWithData).data?.isRuler
            ) {
              canvas.remove(obj);
            }
          });

          // Re-add all objects to ensure proper layering
          // Handle images specially since they are async
          for (const [objectId, fabricObject] of currentObjects) {
            const pageObject = page.objects.find((obj) => obj.id === objectId);
            if (pageObject && pageObject.type === "image") {
              // Re-create image object to ensure proper loading
              try {
                const newImageObject = await createImageObject(pageObject);
                if (newImageObject) {
                  canvas.add(newImageObject);
                  fabricObjectsRef.current.set(objectId, newImageObject);
                }
              } catch (error) {
                console.error("Error recreating image object:", error);
                // Fallback: add the original object
                canvas.add(fabricObject);
              }
            } else {
              // For non-image objects, just re-add them
              canvas.add(fabricObject);
            }
          }

          // Force a re-render
          canvas.renderAll();
          canvas.requestRenderAll();

          // Re-add grid and ruler after background change to ensure they stay on top
          updateGridAndRuler();
        } catch (error) {
          console.error("Error during background update:", error);
          // Fallback: just render the canvas
          canvas.renderAll();
        }
      }
    }, 100);
  }, [page.backgroundColor, page.width, page.height]);

  // Efficiently sync canvas objects with state
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Don't update during drag operations
    if (isDraggingRef.current) {
      return;
    }

    const currentObjects = new Set(page.objects.map((obj) => obj.id));
    const fabricObjects = fabricObjectsRef.current;

    // Store current selection before any changes
    const activeSelection = canvas.getActiveObjects();
    const selectedObjectIds = activeSelection
      .map((obj) => (obj as FabricObjectWithData).data?.objectId)
      .filter((id) => id !== undefined) as string[];

    // Check if this is just a reordering operation (same objects, different order)
    const currentObjectIds = Array.from(fabricObjects.keys());
    const newObjectIds = page.objects.map((obj) => obj.id);
    const isReordering =
      currentObjectIds.length === newObjectIds.length &&
      currentObjectIds.every((id) => newObjectIds.includes(id));

    if (isReordering) {
      // Handle reordering more surgically - only move objects without recreating
      const currentCanvasObjects = canvas
        .getObjects()
        .filter(
          (obj) =>
            !(obj as FabricObjectWithData).data?.isGridLine &&
            !(obj as FabricObjectWithData).data?.isRuler
        );

      // Create a map of current positions
      const currentPositions = new Map();
      currentCanvasObjects.forEach((obj, index) => {
        const fabricObj = obj as FabricObjectWithData;
        if (fabricObj.data?.objectId) {
          currentPositions.set(fabricObj.data.objectId, index);
        }
      });

      // Check if any objects need to be moved
      let needsReordering = false;
      for (let i = 0; i < page.objects.length; i++) {
        const expectedId = page.objects[i].id;
        const currentIndex = currentPositions.get(expectedId);
        if (currentIndex !== i) {
          needsReordering = true;
          break;
        }
      }

      if (needsReordering) {
        // Remove all content objects (but keep grid/ruler)
        currentCanvasObjects.forEach((obj) => {
          canvas.remove(obj);
        });

        // Add objects back in the correct order
        for (const obj of page.objects) {
          const fabricObject = fabricObjects.get(obj.id);
          if (fabricObject) {
            canvas.add(fabricObject);
          }
        }
      }
    } else {
      // Handle object addition/removal
      // Remove objects that no longer exist in state
      for (const [objectId, fabricObject] of fabricObjects) {
        if (!currentObjects.has(objectId)) {
          canvas.remove(fabricObject);
          fabricObjects.delete(objectId);
        }
      }

      // Add new objects and update existing ones
      for (const obj of page.objects) {
        let fabricObject = fabricObjects.get(obj.id);

        if (!fabricObject) {
          // Create new object
          (async () => {
            switch (obj.type) {
              case "text":
                fabricObject = createTextObject(obj);
                break;
              case "shape":
                fabricObject = createShapeObject(obj);
                break;
              case "icon":
                fabricObject = await createIconObject(obj);
                break;
              case "image":
                fabricObject = await createImageObject(obj);
                break;
              default:
                return;
            }

            if (fabricObject) {
              canvas.add(fabricObject);
              fabricObjects.set(obj.id, fabricObject);
              canvas.renderAll();
            }
          })();
        } else {
          // Check if shape type changed
          if (obj.type === "shape" && fabricObject.type !== obj.shapeType) {
            // If shape type changed, recreate the object
            canvas.remove(fabricObject);
            fabricObjects.delete(obj.id);

            const newFabricObject = createShapeObject(obj);
            canvas.add(newFabricObject);
            fabricObjects.set(obj.id, newFabricObject);
            canvas.renderAll();
          } else {
            // Update existing object properties
            updateObject(obj);
          }
        }
      }
    }

    // Restore selection after any changes
    if (selectedObjectIds.length > 0) {
      const objectsToSelect = selectedObjectIds
        .map((id) => fabricObjects.get(id))
        .filter((obj) => obj !== undefined) as FabricObjectWithData[];

      if (objectsToSelect.length === 1) {
        // Single selection
        canvas.setActiveObject(objectsToSelect[0]);
      } else if (objectsToSelect.length > 1) {
        // Multi-selection
        const selection = new fabric.ActiveSelection(objectsToSelect, {
          canvas: canvas,
        });
        canvas.setActiveObject(selection);
      }
      canvas.renderAll();
    }

    // Force a final re-render to ensure all changes are visible
    setTimeout(() => {
      if (canvas) {
        canvas.requestRenderAll();
      }
    }, 100);

    // Update grid and ruler
    updateGridAndRuler();
  }, [page.objects, updateObject]);

  // Force immediate updates when object properties change
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Update all existing objects with their latest properties
    for (const obj of page.objects) {
      const fabricObject = fabricObjectsRef.current.get(obj.id);
      if (fabricObject) {
        updateObject(obj);
      }
    }
  }, [page.objects, updateObject, forceCanvasUpdate]);

  // Handle onObjectSelect callback changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
  }, [onObjectSelect, onMultiSelect]);

  // Handle grid and ruler visibility changes
  useEffect(() => {
    updateGridAndRuler();
  }, [showGrid, showRuler]);

  return (
    <div className="h-full overflow-auto">
      <div
        className="bg-white shadow-lg relative inline-block"
        style={{
          position: "relative",
          zIndex: 1,
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          transition: "transform 0.2s ease-in-out",
          width: `${page.width}px`,
          height: `${page.height}px`,
        }}
        onClick={() => {
          // Ensure canvas gets focus when clicked
          if (canvasRef.current) {
            canvasRef.current.focus();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          className="border border-gray-300"
          tabIndex={0}
          style={{
            display: "block",
            position: "relative",
            width: `${page.width}px`,
            height: `${page.height}px`,
          }}
        />
      </div>
    </div>
  );
}
