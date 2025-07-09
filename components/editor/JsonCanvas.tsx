"use client";

import { useRef, useEffect } from "react";
import * as fabric from "fabric";
import { EditorPage, EditorObject, editorState } from "@/lib/editor-state";

interface JsonCanvasProps {
  page: EditorPage;
  onObjectSelect: (objectId: string | null) => void;
  showGrid?: boolean;
  showRuler?: boolean;
  zoomLevel?: number;
}

// Interface for Fabric.js objects with our custom data property
interface FabricObjectWithData extends fabric.Object {
  data?: {
    objectId?: string;
    isGridLine?: boolean;
    isRuler?: boolean;
    isUnderline?: boolean;
    hasUnderline?: boolean; // Added for underline tracking
  };
  isMoving?: boolean; // Added for movement tracking
}

export default function JsonCanvas({
  page,
  onObjectSelect,
  showGrid = false,
  showRuler = false,
  zoomLevel = 1,
}: JsonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

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

  // Create delete control outside useEffect so it can be reused
  const deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -10,
    offsetX: 10,
    cursorStyleHandler: () => "pointer",
    mouseUpHandler: (eventData, transform) => {
      const target = transform.target as FabricObjectWithData;
      const canvas = fabricCanvasRef.current;
      if (!canvas) return true;

      // Check if this is a bulk selection (multiple objects selected)
      const activeSelection = canvas.getActiveObjects();
      if (activeSelection && activeSelection.length > 1) {
        // Delete all objects in the selection
        activeSelection.forEach((obj) => {
          const fabricObj = obj as FabricObjectWithData;
          if (fabricObj?.data?.objectId) {
            // Delete the object from state
            editorState.deleteObject(fabricObj.data.objectId);
          }
        });

        // Remove all selected objects from canvas
        activeSelection.forEach((obj) => {
          canvas.remove(obj);
        });
        canvas.renderAll();
        // Clear selection
        canvas.discardActiveObject();
        onObjectSelect(null);
      } else if (target?.data?.objectId) {
        // Single object deletion
        // Delete the object from state
        editorState.deleteObject(target.data.objectId);
        // Remove from canvas
        canvas.remove(target);
        canvas.renderAll();
        // Clear selection
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

      // Draw red background circle
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw white X
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
    actionHandler: fabric.controlsUtils.scalingEqually,
    actionName: "delete",
  });

  // Function to draw grid
  const drawGrid = (canvas: fabric.Canvas) => {
    const gridSize = 20;
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    // Always remove existing grid lines first
    const objects = canvas.getObjects();
    const gridLines = objects.filter(
      (obj) => (obj as FabricObjectWithData).data?.isGridLine === true
    );
    gridLines.forEach((line) => canvas.remove(line));

    // Only draw grid if showGrid is true
    if (showGrid) {
      // Draw vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        const line = new fabric.Line([x, 0, x, height], {
          stroke: "#e5e7eb",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isGridLine: true };
        canvas.add(line);
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        const line = new fabric.Line([0, y, width, y], {
          stroke: "#e5e7eb",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isGridLine: true };
        canvas.add(line);
      }
    }

    canvas.renderAll();
  };

  // Function to draw ruler
  const drawRuler = (canvas: fabric.Canvas) => {
    const rulerSize = 30;
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    // Always remove existing ruler elements first
    const objects = canvas.getObjects();
    const rulerElements = objects.filter(
      (obj) => (obj as FabricObjectWithData).data?.isRuler === true
    );
    rulerElements.forEach((element) => canvas.remove(element));

    // Only draw ruler if showRuler is true
    if (showRuler) {
      // Draw top ruler (horizontal)
      for (let x = 0; x <= width; x += 50) {
        // Ruler line
        const line = new fabric.Line([x, 0, x, rulerSize], {
          stroke: "#374151",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isRuler: true };
        canvas.add(line);

        // Ruler text
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

      // Draw left ruler (vertical)
      for (let y = 0; y <= height; y += 50) {
        // Ruler line
        const line = new fabric.Line([0, y, rulerSize, y], {
          stroke: "#374151",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        (line as FabricObjectWithData).data = { isRuler: true };
        canvas.add(line);

        // Ruler text
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

  // Function to update grid and ruler
  const updateGridAndRuler = () => {
    if (fabricCanvasRef.current) {
      drawGrid(fabricCanvasRef.current);
      drawRuler(fabricCanvasRef.current);
    }
  };

  // Function to create different types of shapes
  const createShapeObject = (obj: EditorObject): FabricObjectWithData => {
    const commonProps = {
      left: obj.left,
      top: obj.top,
      fill: obj.fill || "#3B82F6",
      stroke: obj.stroke || "#000000",
      strokeWidth: obj.strokeWidth || 0,
      opacity: obj.opacity !== undefined ? obj.opacity : 1,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      angle: obj.angle || 0,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      transparentCorners: false,
      cornerColor: "#00a0f5",
      cornerStrokeColor: "#0066cc",
      cornerSize: 10,
      cornerStyle: "circle" as const,
      borderColor: "#00a0f5",
      borderScaleFactor: 2,
      perPixelTargetFind: true,
    };

    switch (obj.shapeType) {
      case "rect":
      case "square":
        return new fabric.Rect({
          ...commonProps,
          width: obj.width || 100,
          height: obj.height || 100,
          rx: obj.cornerRadius || 0,
          ry: obj.cornerRadius || 0,
        });

      case "circle":
        return new fabric.Circle({
          ...commonProps,
          radius: (obj.width || 100) / 2,
        });

      case "oval":
        return new fabric.Ellipse({
          ...commonProps,
          rx: (obj.width || 100) / 2,
          ry: (obj.height || 60) / 2,
        });

      case "triangle":
        return new fabric.Triangle({
          ...commonProps,
          width: obj.width || 100,
          height: obj.height || 100,
        });

      case "diamond":
        return new fabric.Polygon(
          [
            { x: 0, y: -50 },
            { x: 50, y: 0 },
            { x: 0, y: 50 },
            { x: -50, y: 0 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 100,
          }
        );

      case "pentagon":
        return new fabric.Polygon(
          [
            { x: 0, y: -50 },
            { x: 47.6, y: -15.5 },
            { x: 29.4, y: 40.5 },
            { x: -29.4, y: 40.5 },
            { x: -47.6, y: -15.5 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 100,
          }
        );

      case "hexagon":
        return new fabric.Polygon(
          [
            { x: -50, y: 0 },
            { x: -25, y: -43.3 },
            { x: 25, y: -43.3 },
            { x: 50, y: 0 },
            { x: 25, y: 43.3 },
            { x: -25, y: 43.3 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 100,
          }
        );

      case "octagon":
        return new fabric.Polygon(
          [
            { x: -35.4, y: -35.4 },
            { x: 0, y: -50 },
            { x: 35.4, y: -35.4 },
            { x: 50, y: 0 },
            { x: 35.4, y: 35.4 },
            { x: 0, y: 50 },
            { x: -35.4, y: 35.4 },
            { x: -50, y: 0 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 100,
          }
        );

      case "star":
        return new fabric.Polygon(
          [
            { x: 0, y: -50 },
            { x: 14.5, y: -20.5 },
            { x: 47.6, y: -15.5 },
            { x: 23.5, y: 7.5 },
            { x: 29.4, y: 40.5 },
            { x: 0, y: 25 },
            { x: -29.4, y: 40.5 },
            { x: -23.5, y: 7.5 },
            { x: -47.6, y: -15.5 },
            { x: -14.5, y: -20.5 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 100,
          }
        );

      case "cross":
        return new fabric.Polygon(
          [
            { x: -10, y: -50 },
            { x: 10, y: -50 },
            { x: 10, y: -10 },
            { x: 50, y: -10 },
            { x: 50, y: 10 },
            { x: 10, y: 10 },
            { x: 10, y: 50 },
            { x: -10, y: 50 },
            { x: -10, y: 10 },
            { x: -50, y: 10 },
            { x: -50, y: -10 },
            { x: -10, y: -10 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 100,
          }
        );

      case "arrow-right":
        return new fabric.Polygon(
          [
            { x: -50, y: -20 },
            { x: 20, y: -20 },
            { x: 20, y: -40 },
            { x: 50, y: 0 },
            { x: 20, y: 40 },
            { x: 20, y: 20 },
            { x: -50, y: 20 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 40,
          }
        );

      case "arrow-left":
        return new fabric.Polygon(
          [
            { x: 50, y: -20 },
            { x: -20, y: -20 },
            { x: -20, y: -40 },
            { x: -50, y: 0 },
            { x: -20, y: 40 },
            { x: -20, y: 20 },
            { x: 50, y: 20 },
          ],
          {
            ...commonProps,
            width: obj.width || 100,
            height: obj.height || 40,
          }
        );

      case "arrow-up":
        return new fabric.Polygon(
          [
            { x: -20, y: 50 },
            { x: -20, y: -20 },
            { x: -40, y: -20 },
            { x: 0, y: -50 },
            { x: 40, y: -20 },
            { x: 20, y: -20 },
            { x: 20, y: 50 },
          ],
          {
            ...commonProps,
            width: obj.width || 40,
            height: obj.height || 100,
          }
        );

      case "arrow-down":
        return new fabric.Polygon(
          [
            { x: -20, y: -50 },
            { x: -20, y: 20 },
            { x: -40, y: 20 },
            { x: 0, y: 50 },
            { x: 40, y: 20 },
            { x: 20, y: 20 },
            { x: 20, y: -50 },
          ],
          {
            ...commonProps,
            width: obj.width || 40,
            height: obj.height || 100,
          }
        );

      case "line":
        return new fabric.Line([-50, 0, 50, 0], {
          ...commonProps,
          stroke: obj.fill || "#6B7280",
          strokeWidth: 3,
          fill: undefined,
        });

      case "line-vertical":
        return new fabric.Line([0, -50, 0, 50], {
          ...commonProps,
          stroke: obj.fill || "#6B7280",
          strokeWidth: 3,
          fill: undefined,
        });

      case "line-diagonal":
        return new fabric.Line([-50, -50, 50, 50], {
          ...commonProps,
          stroke: obj.fill || "#6B7280",
          strokeWidth: 3,
          fill: undefined,
        });

      case "line-zigzag":
        return new fabric.Path("M-50,0 L-25,25 L0,0 L25,25 L50,0", {
          ...commonProps,
          stroke: obj.fill || "#6B7280",
          strokeWidth: 3,
          fill: undefined,
          width: obj.width || 100,
          height: obj.height || 50,
        });

      case "line-wavy":
        return new fabric.Path("M-50,0 Q-25,-20 0,0 Q25,20 50,0", {
          ...commonProps,
          stroke: obj.fill || "#6B7280",
          strokeWidth: 3,
          fill: undefined,
          width: obj.width || 100,
          height: obj.height || 40,
        });

      case "cloud":
        return new fabric.Path(
          "M25,60 C10,60 0,50 0,35 C0,20 10,10 25,10 C30,5 40,0 50,0 C65,0 75,10 75,25 C85,30 90,40 90,50 C90,65 75,75 60,75 C45,75 35,65 35,50 C25,55 25,60 25,60 Z",
          {
            ...commonProps,
            width: obj.width || 90,
            height: obj.height || 75,
          }
        );

      default:
        // Default to rectangle
        return new fabric.Rect({
          ...commonProps,
          width: obj.width || 100,
          height: obj.height || 100,
          rx: obj.cornerRadius || 0,
          ry: obj.cornerRadius || 0,
        });
    }
  };

  // Function to update shape properties based on object type - optimized for performance
  const updateShapeProperties = (
    fabricObject: FabricObjectWithData,
    obj: EditorObject
  ) => {
    const updates: Record<string, unknown> = {};

    // Common properties for all objects
    updates.left = obj.left;
    updates.top = obj.top;
    updates.angle = obj.angle || 0;
    updates.scaleX = obj.scaleX || 1;
    updates.scaleY = obj.scaleY || 1;
    updates.fill = obj.fill || "#3B82F6";
    updates.stroke = obj.stroke || "#000000";
    updates.strokeWidth = obj.strokeWidth || 0;
    updates.opacity = obj.opacity !== undefined ? obj.opacity : 1;

    // Text-specific properties
    if (obj.type === "text" && fabricObject.type === "i-text") {
      updates.text = obj.text || "";
      updates.fontSize = obj.fontSize || 24;
      updates.fontFamily = obj.fontFamily || "Arial";
      updates.fontWeight = obj.fontWeight || "normal";
      updates.fontStyle = obj.fontStyle || "normal";
      updates.backgroundColor = obj.textBackgroundColor;
      updates.charSpacing = obj.letterSpacing || 0; // Use charSpacing for letter spacing
      updates.lineHeight = obj.lineHeight || 1.2;
      updates.textAlign = obj.textAlign || "left";
      // Set underline directly on the Fabric.js object, not in updates
      (fabricObject as fabric.IText).underline =
        obj.textDecoration === "underline";

      // Handle word spacing by adding extra spaces between words
      if (obj.wordSpacing && obj.wordSpacing > 0) {
        const words = obj.text?.split(" ") || [];
        const extraSpaces = " ".repeat(Math.floor(obj.wordSpacing / 2)); // Approximate spacing
        const spacedText = words.join(extraSpaces);
        updates.text = spacedText;
      }

      // Handle list formatting
      if (obj.listType && obj.listType !== "none") {
        let formattedText = obj.text || "";

        // Helper function to strip existing list formatting
        const stripListFormatting = (text: string): string => {
          return text
            .split("\n")
            .map((line) => {
              // Remove bullet formatting
              line = line.replace(/^[•○■]\s/, "");
              // Remove number formatting
              line = line.replace(/^[a-zA-Z0-9]+\.\s/, "");
              return line.trim();
            })
            .join("\n");
        };

        // Helper function to apply list formatting
        const applyListFormatting = (
          text: string,
          listType: string,
          listStyle?: string
        ): string => {
          const lines = text.split("\n");

          if (listType === "bullet") {
            const bulletChar =
              listStyle === "circle" ? "○" : listStyle === "square" ? "■" : "•";
            return lines
              .map((line) =>
                line.trim() ? `${bulletChar} ${line.trim()}` : line
              )
              .join("\n");
          } else if (listType === "number") {
            let counter = 1;
            return lines
              .map((line) => {
                if (line.trim()) {
                  let prefix = "";
                  if (listStyle === "lower-alpha") {
                    prefix = `${String.fromCharCode(96 + counter)}. `;
                  } else if (listStyle === "upper-alpha") {
                    prefix = `${String.fromCharCode(64 + counter)}. `;
                  } else if (listStyle === "lower-roman") {
                    prefix = `${toRoman(counter).toLowerCase()}. `;
                  } else if (listStyle === "upper-roman") {
                    prefix = `${toRoman(counter)}. `;
                  } else {
                    prefix = `${counter}. `;
                  }
                  counter++;
                  return `${prefix}${line.trim()}`;
                }
                return line;
              })
              .join("\n");
          }
          return text;
        };

        // Always strip existing formatting first, then apply new formatting
        formattedText = stripListFormatting(formattedText);
        formattedText = applyListFormatting(
          formattedText,
          obj.listType,
          obj.listStyle
        );

        updates.text = formattedText;
      } else {
        // Handle case where list formatting should be removed (listType is empty, "none", or undefined)
        let formattedText = obj.text || "";

        // Helper function to strip existing list formatting
        const stripListFormatting = (text: string): string => {
          return text
            .split("\n")
            .map((line) => {
              // Remove bullet formatting
              line = line.replace(/^[•○■]\s/, "");
              // Remove number formatting
              line = line.replace(/^[a-zA-Z0-9]+\.\s/, "");
              return line.trim();
            })
            .join("\n");
        };

        // Strip existing formatting when list formatting is being removed
        formattedText = stripListFormatting(formattedText);
        updates.text = formattedText;
      }

      // Handle text shadow
      if (obj.textShadow) {
        updates.shadow = new fabric.Shadow({
          color: obj.textShadow.color,
          blur: obj.textShadow.blur,
          offsetX: obj.textShadow.offsetX,
          offsetY: obj.textShadow.offsetY,
        });
      } else {
        updates.shadow = null;
      }
    }

    // Shape-specific properties
    if (obj.type === "shape") {
      // Handle different shape types
      if (fabricObject.type === "rect") {
        updates.width = obj.width || 100;
        updates.height = obj.height || 100;
        updates.rx = obj.cornerRadius || 0;
        updates.ry = obj.cornerRadius || 0;
      } else if (fabricObject.type === "circle") {
        updates.radius = (obj.width || 100) / 2;
      } else if (fabricObject.type === "ellipse") {
        updates.rx = (obj.width || 100) / 2;
        updates.ry = (obj.height || 60) / 2;
      } else if (fabricObject.type === "triangle") {
        updates.width = obj.width || 100;
        updates.height = obj.height || 100;
      } else if (fabricObject.type === "polygon") {
        // For polygons, we need to scale based on width/height
        const scaleX = (obj.width || 100) / 100;
        const scaleY = (obj.height || 100) / 100;
        updates.scaleX = scaleX;
        updates.scaleY = scaleY;
      } else if (fabricObject.type === "line") {
        // For lines, we need to scale based on width/height
        const scaleX = (obj.width || 100) / 100;
        const scaleY = (obj.height || 100) / 100;
        updates.scaleX = scaleX;
        updates.scaleY = scaleY;
      } else if (fabricObject.type === "path") {
        // For paths (zigzag, wavy lines, clouds), we need to scale based on width/height
        const scaleX = (obj.width || 100) / 100;
        const scaleY = (obj.height || 100) / 100;
        updates.scaleX = scaleX;
        updates.scaleY = scaleY;
      }
    }

    // Apply all updates
    fabricObject.set(updates);
  };

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    console.log(
      "Initializing canvas with dimensions:",
      page.width,
      page.height
    );

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: page.width,
      height: page.height,
      backgroundColor: page.backgroundColor,
      selection: true,
      preserveObjectStacking: true,
      controlsAboveOverlay: true,
    });

    fabricCanvasRef.current = canvas;
    console.log("Canvas initialized:", canvas);

    // Add custom delete control - ensure controls object exists
    if (!fabric.Object.prototype.controls) {
      fabric.Object.prototype.controls = {};
    }

    // Store the delete control
    fabric.Object.prototype.controls.deleteControl = deleteControl;

    // Ensure all objects have the delete control by setting it on the prototype
    fabric.Object.prototype.hasControls = true;
    fabric.Object.prototype.hasBorders = true;

    // Also apply delete control to groups for multi-selection
    if (!fabric.Group.prototype.controls) {
      fabric.Group.prototype.controls = {};
    }
    fabric.Group.prototype.controls.deleteControl = deleteControl;
    fabric.Group.prototype.hasControls = true;
    fabric.Group.prototype.hasBorders = true;

    // Enable group selection
    canvas.selection = true;
    canvas.preserveObjectStacking = true;
    canvas.controlsAboveOverlay = true;

    // Debug: Log the controls setup
    console.log("Delete control setup:", {
      objectControls: fabric.Object.prototype.controls,
      groupControls: fabric.Group.prototype.controls,
      objectHasControls: fabric.Object.prototype.hasControls,
      groupHasControls: fabric.Group.prototype.hasControls,
    });

    // Handle object selection - pure Fabric.js behavior
    canvas.on("selection:created", (e) => {
      console.log("Selection created:", e);
      console.log("Selected objects:", e.selected);
      console.log("Selected objects length:", e.selected?.length);

      // Check if this is a group selection (multiple objects)
      if (e.selected && e.selected.length > 1) {
        // For group selections, we don't set a specific object as selected
        // The delete button will appear on the group's selection box
        console.log(
          "Group selection created with",
          e.selected.length,
          "objects"
        );

        // Check if a group was actually created
        const activeObject = canvas.getActiveObject();
        console.log("Active object type:", activeObject?.type);
        console.log("Active object:", activeObject);

        if (activeObject && activeObject.type === "group") {
          console.log("Active group found:", activeObject);

          // Use a timeout to ensure the group is fully created
          setTimeout(() => {
            console.log(
              "Timeout executed, checking group again:",
              activeObject
            );
            if (!activeObject.controls) {
              activeObject.controls = {};
            }
            activeObject.controls.deleteControl = deleteControl;
            activeObject.hasControls = true;
            activeObject.hasBorders = true;

            // Force the group to show controls
            activeObject.setControlsVisibility({
              deleteControl: true,
            });

            console.log("Group controls after setup:", activeObject.controls);
            console.log("Group hasControls:", activeObject.hasControls);
            console.log("Group hasBorders:", activeObject.hasBorders);

            canvas.renderAll();
            console.log("Delete control applied to group after timeout");
          }, 100); // Increased timeout
        } else {
          console.log("No group found, active object is:", activeObject);

          // Try to manually create a group if multiple objects are selected
          if (e.selected && e.selected.length > 1) {
            console.log("Attempting to create group manually");
            try {
              const group = new fabric.Group(e.selected, {
                left: 0,
                top: 0,
                hasControls: true,
                hasBorders: true,
              });

              // Add delete control to the group
              if (!group.controls) {
                group.controls = {};
              }
              group.controls.deleteControl = deleteControl;
              group.hasControls = true;
              group.hasBorders = true;

              // Remove individual objects and add group
              e.selected.forEach((obj) => {
                canvas.remove(obj);
              });

              canvas.add(group);
              canvas.setActiveObject(group);
              canvas.renderAll();

              console.log("Group created manually:", group);
            } catch (error) {
              console.error("Error creating group:", error);
            }
          }
        }

        onObjectSelect(null); // Clear individual selection
      } else {
        // Single object selection
        const activeObject = e.selected?.[0] as FabricObjectWithData;
        if (activeObject?.data?.objectId) {
          onObjectSelect(activeObject.data.objectId);
        }
      }
    });

    canvas.on("selection:updated", (e) => {
      console.log("Selection updated:", e);

      // Check if this is a group selection (multiple objects)
      if (e.selected && e.selected.length > 1) {
        // For group selections, we don't set a specific object as selected
        console.log(
          "Group selection updated with",
          e.selected.length,
          "objects"
        );

        // Ensure the group has the delete control by accessing the active object
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === "group") {
          console.log("Active group updated:", activeObject);

          // Use a timeout to ensure the group is fully updated
          setTimeout(() => {
            if (!activeObject.controls) {
              activeObject.controls = {};
            }
            activeObject.controls.deleteControl = deleteControl;
            activeObject.hasControls = true;
            activeObject.hasBorders = true;

            // Force the group to show controls
            activeObject.setControlsVisibility({
              deleteControl: true,
            });

            canvas.renderAll();
            console.log(
              "Delete control applied to updated group after timeout"
            );
          }, 10);
        }

        onObjectSelect(null); // Clear individual selection
      } else {
        // Single object selection
        const activeObject = e.selected?.[0] as FabricObjectWithData;
        if (activeObject?.data?.objectId) {
          onObjectSelect(activeObject.data.objectId);
        }
      }
    });

    canvas.on("selection:cleared", () => {
      console.log("Selection cleared");
      onObjectSelect(null);
    });

    // Handle object moving - capture position changes during drag
    canvas.on("object:moving", (e) => {
      const object = e.target as FabricObjectWithData;
      if (object?.data?.objectId) {
        // Mark object as moving to prevent unnecessary operations
        object.isMoving = true;

        // Only update position during movement - no other operations
        const updates: Partial<EditorObject> = {
          left: object.left || 0,
          top: object.top || 0,
        };

        // Update state silently during movement
        editorState.updateObjectSilent(object.data.objectId, updates);

        // NO underline updates during movement - this causes lag
        // Underlines will be updated when movement ends
      }
    });

    // Handle object modified - when dragging ends
    canvas.on("object:modified", (e) => {
      const object = e.target as FabricObjectWithData;
      if (!object?.data?.objectId) return;

      // Clear moving flag
      object.isMoving = false;

      const updates: Partial<EditorObject> = {
        left: object.left || 0,
        top: object.top || 0,
        angle: object.angle || 0,
        scaleX: object.scaleX || 1,
        scaleY: object.scaleY || 1,
      };

      // Handle text-specific properties
      if (object.type === "i-text") {
        updates.text = (object as fabric.IText).text || "";
        updates.fontSize = (object as fabric.IText).fontSize || 24;
        updates.fontFamily = (object as fabric.IText).fontFamily || "Arial";
        updates.fontWeight = String(
          (object as fabric.IText).fontWeight || "normal"
        );
        updates.fontStyle = (object as fabric.IText).fontStyle || "normal";
        updates.textBackgroundColor = (object as fabric.IText)
          .backgroundColor as string;
        updates.letterSpacing = (object as fabric.IText).charSpacing || 0;
        updates.lineHeight = (object as fabric.IText).lineHeight || 1.2;
        updates.textAlign = (object as fabric.IText).textAlign || "left";
        // Note: wordSpacing is not supported in Fabric.js IText
        // Note: textDecoration is not a standard property on IText, we'll handle it differently
      }

      // Handle shape-specific properties
      if (
        object.type === "rect" ||
        object.type === "circle" ||
        object.type === "triangle" ||
        object.type === "polygon" ||
        object.type === "line" ||
        object.type === "path"
      ) {
        updates.fill = (object.fill as string) || "#3B82F6";
        updates.stroke = (object.stroke as string) || "#000000";
        updates.strokeWidth = object.strokeWidth || 0;

        if (object.type === "rect") {
          updates.width = (object as fabric.Rect).width || 100;
          updates.height = (object as fabric.Rect).height || 100;
          updates.cornerRadius = (object as fabric.Rect).rx || 0;
        } else if (object.type === "circle") {
          updates.width = ((object as fabric.Circle).radius || 50) * 2;
          updates.height = ((object as fabric.Circle).radius || 50) * 2;
        } else if (object.type === "triangle") {
          updates.width = (object as fabric.Triangle).width || 100;
          updates.height = (object as fabric.Triangle).height || 100;
        } else if (
          object.type === "polygon" ||
          object.type === "line" ||
          object.type === "path"
        ) {
          // For scaled objects, calculate width and height based on scale
          const baseWidth = 100;
          const baseHeight = 100;
          updates.width = baseWidth * (object.scaleX || 1);
          updates.height = baseHeight * (object.scaleY || 1);
        }
      }

      editorState.updateObjectSilent(object.data.objectId, updates);
    });

    // Handle object scaling
    canvas.on("object:scaling", (e) => {
      const object = e.target as FabricObjectWithData;
      if (!object?.data?.objectId) return;

      const updates: Partial<EditorObject> = {
        left: object.left || 0,
        top: object.top || 0,
        angle: object.angle || 0,
        scaleX: object.scaleX || 1,
        scaleY: object.scaleY || 1,
      };

      // Handle text-specific properties
      if (object.type === "i-text") {
        updates.text = (object as fabric.IText).text || "";
        updates.fontSize = (object as fabric.IText).fontSize || 24;
        updates.fontFamily = (object as fabric.IText).fontFamily || "Arial";
        updates.fontWeight = String(
          (object as fabric.IText).fontWeight || "normal"
        );
        updates.fontStyle = (object as fabric.IText).fontStyle || "normal";
        updates.textBackgroundColor = (object as fabric.IText)
          .backgroundColor as string;
        updates.letterSpacing = (object as fabric.IText).charSpacing || 0;
        updates.lineHeight = (object as fabric.IText).lineHeight || 1.2;
        updates.textAlign = (object as fabric.IText).textAlign || "left";
        // Note: wordSpacing is not supported in Fabric.js IText
        // Note: textDecoration is not a standard property on IText, we'll handle it differently
      }

      // Handle shape-specific properties
      if (
        object.type === "rect" ||
        object.type === "circle" ||
        object.type === "triangle" ||
        object.type === "polygon" ||
        object.type === "line" ||
        object.type === "path"
      ) {
        updates.fill = (object.fill as string) || "#3B82F6";
        updates.stroke = (object.stroke as string) || "#000000";
        updates.strokeWidth = object.strokeWidth || 0;

        if (object.type === "rect") {
          updates.width = (object as fabric.Rect).width || 100;
          updates.height = (object as fabric.Rect).height || 100;
          updates.cornerRadius = (object as fabric.Rect).rx || 0;
        } else if (object.type === "circle") {
          updates.width = ((object as fabric.Circle).radius || 50) * 2;
          updates.height = ((object as fabric.Circle).radius || 50) * 2;
        } else if (object.type === "triangle") {
          updates.width = (object as fabric.Triangle).width || 100;
          updates.height = (object as fabric.Triangle).height || 100;
        } else if (
          object.type === "polygon" ||
          object.type === "line" ||
          object.type === "path"
        ) {
          // For scaled objects, calculate width and height based on scale
          const baseWidth = 100;
          const baseHeight = 100;
          updates.width = baseWidth * (object.scaleX || 1);
          updates.height = baseHeight * (object.scaleY || 1);
        }
      }

      editorState.updateObjectSilent(object.data.objectId, updates);
    });

    // Handle keyboard events for bulk deletion
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        const activeSelection = canvas.getActiveObjects();
        if (activeSelection && activeSelection.length > 0) {
          // Delete all selected objects
          activeSelection.forEach((obj) => {
            const fabricObj = obj as FabricObjectWithData;
            if (fabricObj?.data?.objectId) {
              // Delete the object from state
              editorState.deleteObject(fabricObj.data.objectId);
            }
          });

          // Remove all selected objects from canvas
          activeSelection.forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.renderAll();
          // Clear selection
          canvas.discardActiveObject();
          onObjectSelect(null);

          // Prevent default behavior
          e.preventDefault();
        }
      }
    };

    // Add keyboard event listener
    document.addEventListener("keydown", handleKeyDown);

    // Handle text editing
    canvas.on("text:changed", (e) => {
      const textObject = e.target as FabricObjectWithData;
      if (textObject?.data?.objectId) {
        const updates: Partial<EditorObject> = {
          text: (textObject as fabric.IText).text || "",
          fontSize: (textObject as fabric.IText).fontSize || 24,
          fontFamily: (textObject as fabric.IText).fontFamily || "Arial",
          fontWeight: String(
            (textObject as fabric.IText).fontWeight || "normal"
          ),
          fontStyle: (textObject as fabric.IText).fontStyle || "normal",
          textBackgroundColor: (textObject as fabric.IText)
            .backgroundColor as string,
          letterSpacing: (textObject as fabric.IText).charSpacing || 0,
          lineHeight: (textObject as fabric.IText).lineHeight || 1.2,
          textAlign: (textObject as fabric.IText).textAlign || "left",
        };
        editorState.updateObjectSilent(textObject.data.objectId, updates);
        console.log(
          "Text changed, updated state:",
          textObject.data.objectId,
          updates
        );
      }
    });

    // Update grid and ruler when the canvas is ready
    updateGridAndRuler();

    return () => {
      canvas.dispose();
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Only run once on mount

  // Update grid and ruler when their states change
  useEffect(() => {
    updateGridAndRuler();
  }, [showGrid, showRuler]);

  // Handle page changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Update canvas dimensions and background
    canvas.setDimensions({
      width: page.width,
      height: page.height,
    });
    canvas.backgroundColor = page.backgroundColor;
    canvas.renderAll();

    // Update grid and ruler after canvas dimensions change
    updateGridAndRuler();
  }, [page.id, page.width, page.height, page.backgroundColor]);

  // Update canvas objects when page objects change
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    console.log("Updating canvas objects:", page.objects.length, "objects");

    // Helper function to get expected Fabric.js type for shape types
    const getExpectedFabricType = (shapeType: string | undefined): string => {
      if (!shapeType) return "rect";

      switch (shapeType) {
        case "rect":
        case "square":
          return "rect";
        case "circle":
          return "circle";
        case "oval":
          return "ellipse";
        case "triangle":
          return "triangle";
        case "diamond":
        case "pentagon":
        case "hexagon":
        case "octagon":
        case "star":
        case "cross":
        case "arrow-right":
        case "arrow-left":
        case "arrow-up":
        case "arrow-down":
          return "polygon";
        case "line":
        case "line-vertical":
        case "line-diagonal":
          return "line";
        case "line-zigzag":
        case "line-wavy":
        case "cloud":
          return "path";
        default:
          return "rect";
      }
    };

    // Store current selection before clearing
    const currentSelection = canvas.getActiveObject();
    const selectedObjectId = currentSelection
      ? (currentSelection as FabricObjectWithData).data?.objectId
      : null;

    // Get existing objects on canvas
    const existingObjects = canvas.getObjects() as FabricObjectWithData[];
    const existingObjectIds = existingObjects
      .map((obj) => obj.data?.objectId)
      .filter((id): id is string => id !== undefined);

    // Check if we need to recreate all objects or just update existing ones
    const newObjectIds = page.objects.map((obj) => obj.id);
    const objectsAdded = newObjectIds.filter(
      (id) => !existingObjectIds.includes(id)
    );
    const objectsRemoved = existingObjectIds.filter(
      (id) => !newObjectIds.includes(id)
    );

    // Check if any existing objects have changed shape type (for shapes)
    const objectsWithShapeTypeChanges = page.objects.filter((obj) => {
      if (obj.type !== "shape") return false;
      const existingObject = existingObjects.find(
        (fabricObj) => fabricObj.data?.objectId === obj.id
      );
      if (!existingObject) return false;

      // Check if the shape type has changed by comparing the expected Fabric.js type
      const expectedFabricType = getExpectedFabricType(obj.shapeType);
      return existingObject.type !== expectedFabricType;
    });

    // Check if layer order has changed
    const layerOrderChanged = page.objects.some((obj, index) => {
      const existingObject = existingObjects.find(
        (fabricObj) => fabricObj.data?.objectId === obj.id
      );
      if (!existingObject) return false;

      // Check if the object is at the same index in the canvas
      const canvasIndex = canvas.getObjects().indexOf(existingObject);
      return canvasIndex !== index;
    });

    // Check if any properties have changed significantly (optimization check)
    const objectsWithPropertyChanges = page.objects.filter((obj) => {
      const existingObject = existingObjects.find(
        (fabricObj) => fabricObj.data?.objectId === obj.id
      );
      if (!existingObject) return false;

      // Simple change detection - just check if object exists and needs updates
      return true; // Always update for performance
    });

    // If objects were added, removed, shape types changed, layer order changed, or properties changed significantly, update the canvas
    if (
      objectsAdded.length > 0 ||
      objectsRemoved.length > 0 ||
      objectsWithShapeTypeChanges.length > 0 ||
      layerOrderChanged
    ) {
      console.log(
        "Objects added/removed, shape types changed, or layer order changed, recreating canvas"
      );

      // Clear existing objects
      canvas.clear();

      // Ensure background is set correctly after clearing
      canvas.backgroundColor = page.backgroundColor;

      // Add objects from page
      page.objects.forEach((obj) => {
        console.log("Creating object:", obj.type, obj.id);
        let fabricObject: FabricObjectWithData;

        switch (obj.type) {
          case "text":
            // Handle word spacing by adding extra spaces between words
            let displayText = obj.text || "Double click to edit";
            if (obj.wordSpacing && obj.wordSpacing > 0) {
              const words = displayText.split(" ");
              const extraSpaces = " ".repeat(Math.floor(obj.wordSpacing / 2)); // Approximate spacing
              displayText = words.join(extraSpaces);
            }

            // Handle list formatting
            if (obj.listType && obj.listType !== "none") {
              let formattedText = displayText;

              // Helper function to strip existing list formatting
              const stripListFormatting = (text: string): string => {
                return text
                  .split("\n")
                  .map((line) => {
                    // Remove bullet formatting
                    line = line.replace(/^[•○■]\s/, "");
                    // Remove number formatting
                    line = line.replace(/^[a-zA-Z0-9]+\.\s/, "");
                    return line.trim();
                  })
                  .join("\n");
              };

              // Helper function to apply list formatting
              const applyListFormatting = (
                text: string,
                listType: string,
                listStyle?: string
              ): string => {
                const lines = text.split("\n");

                if (listType === "bullet") {
                  const bulletChar =
                    listStyle === "circle"
                      ? "○"
                      : listStyle === "square"
                      ? "■"
                      : "•";
                  return lines
                    .map((line) =>
                      line.trim() ? `${bulletChar} ${line.trim()}` : line
                    )
                    .join("\n");
                } else if (listType === "number") {
                  let counter = 1;
                  return lines
                    .map((line) => {
                      if (line.trim()) {
                        let prefix = "";
                        if (listStyle === "lower-alpha") {
                          prefix = `${String.fromCharCode(96 + counter)}. `;
                        } else if (listStyle === "upper-alpha") {
                          prefix = `${String.fromCharCode(64 + counter)}. `;
                        } else if (listStyle === "lower-roman") {
                          prefix = `${toRoman(counter).toLowerCase()}. `;
                        } else if (listStyle === "upper-roman") {
                          prefix = `${toRoman(counter)}. `;
                        } else {
                          prefix = `${counter}. `;
                        }
                        counter++;
                        return `${prefix}${line.trim()}`;
                      }
                      return line;
                    })
                    .join("\n");
                }
                return text;
              };

              // Always strip existing formatting first, then apply new formatting
              formattedText = stripListFormatting(formattedText);
              formattedText = applyListFormatting(
                formattedText,
                obj.listType,
                obj.listStyle
              );

              displayText = formattedText;
            } else {
              // Handle case where list formatting should be removed (listType is empty, "none", or undefined)
              let formattedText = displayText;

              // Helper function to strip existing list formatting
              const stripListFormatting = (text: string): string => {
                return text
                  .split("\n")
                  .map((line) => {
                    // Remove bullet formatting
                    line = line.replace(/^[•○■]\s/, "");
                    // Remove number formatting
                    line = line.replace(/^[a-zA-Z0-9]+\.\s/, "");
                    return line.trim();
                  })
                  .join("\n");
              };

              // Strip existing formatting when list formatting is being removed
              formattedText = stripListFormatting(formattedText);
              displayText = formattedText;
            }

            fabricObject = new fabric.IText(displayText, {
              left: obj.left,
              top: obj.top,
              fontSize: obj.fontSize || 24,
              fontFamily: obj.fontFamily || "Arial",
              fontWeight: obj.fontWeight || "normal",
              fontStyle: obj.fontStyle || "normal",
              fill: obj.fill || "#000000",
              backgroundColor: obj.textBackgroundColor,
              charSpacing: obj.letterSpacing || 0, // Use charSpacing for letter spacing
              lineHeight: obj.lineHeight || 1.2,
              textAlign: obj.textAlign || "left",
              opacity: obj.opacity !== undefined ? obj.opacity : 1,
              scaleX: obj.scaleX || 1,
              scaleY: obj.scaleY || 1,
              angle: obj.angle || 0,
              selectable: true,
              evented: true,
              hasControls: true,
              hasBorders: true,
              lockMovementX: false,
              lockMovementY: false,
              lockRotation: false,
              lockScalingX: false,
              lockScalingY: false,
              transparentCorners: false,
              cornerColor: "#00a0f5",
              cornerStrokeColor: "#0066cc",
              cornerSize: 10,
              cornerStyle: "circle",
              borderColor: "#00a0f5",
              borderScaleFactor: 2,
              editable: true,
              cursorColor: "#00a0f5",
              cursorWidth: 2,
              shadow: obj.textShadow
                ? new fabric.Shadow({
                    color: obj.textShadow.color,
                    blur: obj.textShadow.blur,
                    offsetX: obj.textShadow.offsetX,
                    offsetY: obj.textShadow.offsetY,
                  })
                : undefined,
              underline: obj.textDecoration === "underline",
            });
            fabricObject.data = { objectId: obj.id };
            break;

          case "shape":
            fabricObject = createShapeObject(obj);
            fabricObject.data = { objectId: obj.id };
            break;

          case "image":
            // Skip images for now to avoid TypeScript issues
            console.log("Skipping image object:", obj.id);
            return;

          default:
            return;
        }

        canvas.add(fabricObject);

        // Explicitly add the delete control to this object
        if (!fabricObject.controls) {
          fabricObject.controls = {};
        }
        fabricObject.controls.deleteControl = deleteControl;

        // No need to handle underline separately - it's now built-in
        // The underline property is already set in the IText creation above

        console.log(
          "Added object to canvas:",
          fabricObject,
          "Selectable:",
          fabricObject.selectable,
          "HasControls:",
          fabricObject.hasControls,
          "Controls:",
          fabricObject.controls
        );
      });

      canvas.renderAll();
      console.log(
        "Canvas rendered with",
        canvas.getObjects().length,
        "objects"
      );

      // Restore selection if there was one
      if (selectedObjectId) {
        const objectToSelect = canvas
          .getObjects()
          .find(
            (obj) =>
              (obj as FabricObjectWithData).data?.objectId === selectedObjectId
          ) as FabricObjectWithData;
        if (objectToSelect) {
          canvas.setActiveObject(objectToSelect);
          canvas.renderAll();
          console.log("Restored selection to:", selectedObjectId);
        }
      }
    } else if (objectsWithPropertyChanges.length > 0) {
      // Just update existing objects with new properties (optimized updates)
      objectsWithPropertyChanges.forEach((obj) => {
        const fabricObject = existingObjects.find(
          (fabricObj) => fabricObj.data?.objectId === obj.id
        );
        if (fabricObject) {
          // Use the unified update function for all objects
          updateShapeProperties(fabricObject, obj);
        }
      });

      canvas.renderAll();
    }
  }, [page.objects]);

  // Handle onObjectSelect callback changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Update event handlers with new callback
    canvas.off("selection:created");
    canvas.off("selection:updated");
    canvas.off("selection:cleared");

    canvas.on("selection:created", (e) => {
      console.log("Selection created:", e);

      // Check if this is a group selection (multiple objects)
      if (e.selected && e.selected.length > 1) {
        // For group selections, we don't set a specific object as selected
        console.log(
          "Group selection created with",
          e.selected.length,
          "objects"
        );
        onObjectSelect(null); // Clear individual selection
      } else {
        // Single object selection
        const activeObject = e.selected?.[0] as FabricObjectWithData;
        if (activeObject?.data?.objectId) {
          onObjectSelect(activeObject.data.objectId);
        }
      }
    });

    canvas.on("selection:updated", (e) => {
      console.log("Selection updated:", e);

      // Check if this is a group selection (multiple objects)
      if (e.selected && e.selected.length > 1) {
        // For group selections, we don't set a specific object as selected
        console.log(
          "Group selection updated with",
          e.selected.length,
          "objects"
        );
        onObjectSelect(null); // Clear individual selection
      } else {
        // Single object selection
        const activeObject = e.selected?.[0] as FabricObjectWithData;
        if (activeObject?.data?.objectId) {
          onObjectSelect(activeObject.data.objectId);
        }
      }
    });

    canvas.on("selection:cleared", () => {
      console.log("Selection cleared");
      onObjectSelect(null);
    });
  }, [onObjectSelect]);

  // Handle grid and ruler visibility changes
  useEffect(() => {
    updateGridAndRuler();
  }, [showGrid, showRuler]);

  return (
    <div className="flex items-center h-full">
      <div
        className="bg-white shadow-lg relative"
        style={{
          position: "relative",
          zIndex: 1,
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          transition: "transform 0.2s ease-in-out",
        }}
      >
        <canvas
          ref={canvasRef}
          className="border border-gray-300"
          style={{
            display: "block",
            position: "relative",
          }}
        />
      </div>
    </div>
  );
}
