"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";

interface TextObject extends fabric.IText {
  id: string;
}

interface ShapeObject extends fabric.Object {
  id: string;
}

interface PageCanvasProps {
  pageId: string;
  pageName: string;
  canvasData: fabric.CanvasOptions | null;
  onPageUpdate: (pageId: string, canvasData: fabric.CanvasOptions) => void;
  onObjectSelect: (object: fabric.Object | null, pageId: string) => void;
  selectedPageId: string;
  backgroundColor: string;
  setCanvasRef?: (canvas: fabric.Canvas | null) => void;
}

export default function PageCanvas({
  pageId,
  pageName,
  canvasData,
  onPageUpdate,
  onObjectSelect,
  selectedPageId,
  backgroundColor,
  setCanvasRef,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1000,
      backgroundColor: backgroundColor,
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    });

    // Pass canvas reference to parent
    if (setCanvasRef) {
      setCanvasRef(fabricRef.current);
    }

    // Event listeners
    fabricRef.current.on("selection:created", handleSelection);
    fabricRef.current.on("selection:updated", handleSelection);
    fabricRef.current.on("selection:cleared", () =>
      onObjectSelect(null, pageId)
    );
    fabricRef.current.on("object:modified", savePageData);
    fabricRef.current.on("object:added", savePageData);
    fabricRef.current.on("object:removed", savePageData);
    fabricRef.current.on("object:moving", savePageData);
    fabricRef.current.on("object:scaling", savePageData);
    fabricRef.current.on("object:rotating", savePageData);

    // Load page data or default template
    if (canvasData) {
      fabricRef.current.loadFromJSON(canvasData, () => {
        fabricRef.current?.renderAll();
      });
    } else {
      loadDefaultTemplate();
    }

    return () => {
      if (setCanvasRef) {
        setCanvasRef(null);
      }
      fabricRef.current?.dispose();
    };
  }, [pageId]);

  // Update background when prop changes
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.backgroundColor = backgroundColor;
      fabricRef.current.renderAll();
    }
  }, [backgroundColor]);

  // Highlight selected page
  useEffect(() => {
    if (fabricRef.current) {
      if (selectedPageId === pageId) {
        canvasRef.current?.parentElement?.classList.add(
          "ring-2",
          "ring-blue-500"
        );
      } else {
        canvasRef.current?.parentElement?.classList.remove(
          "ring-2",
          "ring-blue-500"
        );
      }
    }
  }, [selectedPageId, pageId]);

  const handleSelection = (e: {
    selected?: fabric.Object[];
    target?: fabric.Object;
  }) => {
    const activeObject = (e.selected?.[0] || e.target) as fabric.Object | null;
    onObjectSelect(activeObject, pageId);
  };

  const savePageData = () => {
    if (!fabricRef.current) return;
    const canvasData = fabricRef.current.toJSON();
    onPageUpdate(pageId, canvasData);
  };

  const loadDefaultTemplate = () => {
    if (!fabricRef.current) return;

    // Add default wedding invitation elements
    const title = new fabric.IText("Wedding Invitation", {
      left: 400,
      top: 100,
      fontSize: 48,
      fontFamily: "Playfair Display",
      fill: "#2C3E50",
      originX: "center",
      originY: "center",
    }) as unknown as TextObject;
    (title as unknown as TextObject).id = `text-${Date.now()}`;

    const subtitle = new fabric.IText("Join us for our special day", {
      left: 400,
      top: 180,
      fontSize: 24,
      fontFamily: "Dancing Script",
      fill: "#7F8C8D",
      originX: "center",
      originY: "center",
    }) as unknown as TextObject;
    (subtitle as unknown as TextObject).id = `text-${Date.now() + 1}`;

    fabricRef.current.add(title, subtitle);
    savePageData();
  };

  // Public methods for external control
  const addText = (text: string, options: Record<string, unknown> = {}) => {
    if (!fabricRef.current) return;

    const textObject = new fabric.IText(text, {
      left: 200,
      top: 200,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      ...options,
    }) as unknown as TextObject;
    (textObject as unknown as TextObject).id = `text-${Date.now()}`;

    fabricRef.current.add(textObject);
    fabricRef.current.setActiveObject(textObject);
    onObjectSelect(textObject, pageId);
    savePageData();
  };

  const addShape = (type: string, options: Record<string, unknown> = {}) => {
    if (!fabricRef.current) return;

    let shape: fabric.Object;

    switch (type) {
      case "rect":
        shape = new fabric.Rect({
          left: 200,
          top: 200,
          width: 100,
          height: 100,
          fill: "#3B82F6",
          stroke: "#000",
          strokeWidth: 1,
          ...options,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          left: 200,
          top: 200,
          radius: 50,
          fill: "#3B82F6",
          stroke: "#000",
          strokeWidth: 1,
          ...options,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          left: 200,
          top: 200,
          width: 100,
          height: 100,
          fill: "#3B82F6",
          stroke: "#000",
          strokeWidth: 1,
          ...options,
        });
        break;
      case "ellipse":
        shape = new fabric.Ellipse({
          left: 200,
          top: 200,
          rx: 60,
          ry: 40,
          fill: "#3B82F6",
          stroke: "#000",
          strokeWidth: 1,
          ...options,
        });
        break;
      case "line":
        shape = new fabric.Line([50, 50, 200, 50], {
          stroke: "#3B82F6",
          strokeWidth: 3,
          ...options,
        });
        break;
      default:
        return;
    }

    (shape as ShapeObject).id = `shape-${Date.now()}`;
    fabricRef.current.add(shape);
    fabricRef.current.setActiveObject(shape);
    onObjectSelect(shape, pageId);
    savePageData();
  };

  const deleteSelected = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      fabricRef.current.remove(activeObject);
      onObjectSelect(null, pageId);
      savePageData();
    }
  };

  const duplicateSelected = async () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      try {
        const cloned = await activeObject.clone();
        if (cloned) {
          cloned.set({
            left: (activeObject.left || 0) + 20,
            top: (activeObject.top || 0) + 20,
          });
          fabricRef.current.add(cloned);
          fabricRef.current.setActiveObject(cloned);
          onObjectSelect(cloned, pageId);
          savePageData();
        }
      } catch (error) {
        console.error("Error cloning object:", error);
      }
    }
  };

  // Expose methods to parent
  useEffect(() => {
    if (fabricRef.current) {
      (fabricRef.current as unknown as Record<string, unknown>).addText =
        addText;
      (fabricRef.current as unknown as Record<string, unknown>).addShape =
        addShape;
      (fabricRef.current as unknown as Record<string, unknown>).deleteSelected =
        deleteSelected;
      (
        fabricRef.current as unknown as Record<string, unknown>
      ).duplicateSelected = duplicateSelected;
    }
  }, [fabricRef.current]);

  return (
    <div className="mb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800">{pageName}</h3>
        <div className="text-sm text-gray-500">
          {selectedPageId === pageId ? "Active Page" : "Click to select"}
        </div>
      </div>

      {/* Canvas Container */}
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-200 cursor-pointer"
        onClick={() => onObjectSelect(null, pageId)}
      >
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
}
