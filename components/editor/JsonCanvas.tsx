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
}: JsonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moveUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    offsetY: -10,
    offsetX: 10,
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
    actionHandler: fabric.controlsUtils.scalingEqually,
    actionName: "delete",
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

      default:
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

    fabricObject.data = { objectId: obj.id };
    return fabricObject;
  };

  const createIconObject = async (
    obj: EditorObject
  ): Promise<FabricObjectWithData> => {
    console.log("Creating icon object:", obj);
    if (!obj.iconSvg) {
      console.log("No iconSvg provided, creating fallback rectangle");
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
        console.log("Creating icon from SVG data");

        // Extract path data using regex (simpler approach)
        const pathMatch = obj.iconSvg.match(/d="([^"]+)"/);
        if (!pathMatch) {
          console.error("No path data found in SVG");
          createFallbackObject();
          return;
        }

        const pathData = pathMatch[1];
        console.log("Creating fabric path from SVG data");

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

        console.log("Icon object created successfully:", fabricObject);
        resolve(fabricObject);

        function createFallbackObject() {
          console.log("Creating fallback circle for failed SVG");
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

          fabricObject.data = { objectId: obj.id };
          fabricObject.iconSvg = obj.iconSvg;
          fabricObject.iconName = obj.iconName;
          fabricObject.iconPrefix = obj.iconPrefix;
          resolve(fabricObject);
        }
      } catch (error) {
        console.error("Error creating icon object:", error);
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

      console.log("Creating image object with URL:", obj.imageUrl);

      // Load the image first
      const img = new Image();

      // Try different CORS settings
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log("Image loaded successfully:", obj.imageUrl);
        try {
          const fabricObject = new fabric.Image(img, {
            left: obj.left || 0,
            top: obj.top || 0,
            opacity: obj.opacity || 1,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          }) as FabricObjectWithData;

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
          console.log("Image loaded successfully without CORS:", obj.imageUrl);
          try {
            const fabricObject = new fabric.Image(imgWithoutCors, {
              left: obj.left || 0,
              top: obj.top || 0,
              opacity: obj.opacity || 1,
              angle: obj.angle || 0,
              scaleX: obj.scaleX || 1,
              scaleY: obj.scaleY || 1,
            }) as FabricObjectWithData;

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
        console.log("Creating fallback object for failed image:", obj.imageUrl);
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
        break;

      case "image":
        // Check if the image URL has changed
        const currentImageUrl = (fabricObject as fabric.Image).getSrc();
        if (obj.imageUrl && currentImageUrl !== obj.imageUrl) {
          // Image URL changed, reload the image
          console.log("Image URL changed, reloading image:", obj.imageUrl);

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

      const updates: Partial<EditorObject> = {
        scaleX: target.scaleX || 1,
        scaleY: target.scaleY || 1,
      };

      // Only update width/height for non-image objects
      if (target.type !== "image") {
        updates.width = target.width || 100;
        updates.height = target.height || 100;
      }

      editorState.updateObjectSilent(target.data.objectId, updates);
    };

    const handleObjectRotating = (e: { target?: fabric.Object }) => {
      const target = e.target as FabricObjectWithData;
      if (!target?.data?.objectId) return;

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
            updates.angle = (fabricObj.angle || 0) - 15;
          } else {
            updates.left = (fabricObj.left || 0) - 1;
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey) {
            updates.angle = (fabricObj.angle || 0) + 15;
          } else {
            updates.left = (fabricObj.left || 0) + 1;
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          updates.top = (fabricObj.top || 0) - 1;
          break;

        case "ArrowDown":
          e.preventDefault();
          updates.top = (fabricObj.top || 0) + 1;
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
        editorState.updateObjectSilent(fabricObj.data.objectId, updates);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.dispose();
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
  }, [page.backgroundColor, page.width, page.height]);

  // Efficiently sync canvas objects with state
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const currentObjects = new Set(page.objects.map((obj) => obj.id));
    const fabricObjects = fabricObjectsRef.current;

    // Remove objects that no longer exist in state
    for (const [objectId, fabricObject] of fabricObjects) {
      if (!currentObjects.has(objectId)) {
        canvas.remove(fabricObject);
        fabricObjects.delete(objectId);
      }
    }

    // Add or update objects
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
        // Update existing object
        if (obj.type === "shape" && fabricObject.type !== obj.shapeType) {
          // If shape type changed, recreate the object
          canvas.remove(fabricObject);
          fabricObjects.delete(obj.id);

          const newFabricObject = createShapeObject(obj);
          canvas.add(newFabricObject);
          fabricObjects.set(obj.id, newFabricObject);
          canvas.renderAll();
        } else {
          // Update existing object
          updateObject(obj);
        }
      }
    }

    // Force a final re-render to ensure all changes are visible
    setTimeout(() => {
      if (canvas) {
        canvas.requestRenderAll();
      }
    }, 0);

    // Update grid and ruler
    updateGridAndRuler();
  }, [page.objects, updateObject]);

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
