"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers,
  Image as ImageIcon,
  Palette,
  FileText,
  Save,
  Download,
  Undo,
  Redo,
  Grid,
  Ruler,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Keyboard,
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Edit3,
  Star,
} from "lucide-react";
import { editorState, EditorObject, EditorProject } from "@/lib/editor-state";
import JsonCanvas from "@/components/editor/JsonCanvas";
import ElementsTab from "@/components/editor/sidebar/ElementsTab";
import ImagesTab from "@/components/editor/sidebar/ImagesTab";
import BackgroundsTab from "@/components/editor/sidebar/BackgroundsTab";
import IconsTab from "@/components/editor/sidebar/IconsTab";
import PropertiesPanel from "@/components/editor/sidebar/PropertiesPanel";
import LayersPanel from "@/components/editor/sidebar/LayersPanel";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { imagekitService } from "@/lib/imagekit-service";

export default function TemplateCreator() {
  const [project, setProject] = useState(editorState.getProject());
  const [selectedPageId, setSelectedPageId] = useState(project.selectedPageId);
  const [selectedObjectId, setSelectedObjectId] = useState(
    project.selectedObjectId
  );
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("elements");
  const [showLayers, setShowLayers] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageOffset, setPageOffset] = useState(0);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [dragOverPageId, setDragOverPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState<string | null>(null);
  const [editingPageNameValue, setEditingPageNameValue] = useState("");

  const currentPage =
    project.pages.find((p) => p.id === selectedPageId) || null;
  const selectedObject =
    currentPage?.objects.find((obj) => obj.id === selectedObjectId) || null;

  // Pagination logic
  const pagesPerView = 4;
  const totalPages = project.pages.length;
  const maxOffset = Math.max(0, totalPages - pagesPerView);
  const showNavigation = totalPages > pagesPerView;

  const goToPrevious = () => {
    setPageOffset(Math.max(0, pageOffset - 1));
  };

  const goToNext = () => {
    setPageOffset(Math.min(maxOffset, pageOffset + 1));
  };

  // Subscribe to state changes - optimized to prevent unnecessary re-renders
  useEffect(() => {
    const handleProjectUpdate = (updatedProject: EditorProject) => {
      setProject((prevProject) => {
        // Only update if the project actually changed
        if (JSON.stringify(prevProject) !== JSON.stringify(updatedProject)) {
          return updatedProject;
        }
        return prevProject;
      });

      // Only update selected page if it changed
      setSelectedPageId((prev) => {
        if (prev !== updatedProject.selectedPageId) {
          return updatedProject.selectedPageId;
        }
        return prev;
      });

      // Only update selected object if it changed
      setSelectedObjectId((prev) => {
        if (prev !== updatedProject.selectedObjectId) {
          return updatedProject.selectedObjectId;
        }
        return prev;
      });
    };

    const unsubscribe = editorState.subscribe(handleProjectUpdate);
    return unsubscribe;
  }, []);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPageId(pageId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", pageId);
  };

  const handleDragOver = (e: React.DragEvent, pageId: string) => {
    e.preventDefault();
    if (draggedPageId && draggedPageId !== pageId) {
      setDragOverPageId(pageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPageId(null);
  };

  const handleDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    if (draggedPageId && draggedPageId !== targetPageId) {
      // Get the current project from editorState to ensure we have the latest data
      const currentProject = editorState.getProject();

      // Reorder pages
      const draggedIndex = currentProject.pages.findIndex(
        (p) => p.id === draggedPageId
      );
      const targetIndex = currentProject.pages.findIndex(
        (p) => p.id === targetPageId
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newPages = [...currentProject.pages];
        const [draggedPage] = newPages.splice(draggedIndex, 1);
        newPages.splice(targetIndex, 0, draggedPage);

        // Update the project with reordered pages
        editorState.updateProject({
          ...currentProject,
          pages: newPages,
        });
      }
    }
    setDraggedPageId(null);
    setDragOverPageId(null);
  };

  const handleDragEnd = () => {
    setDraggedPageId(null);
    setDragOverPageId(null);
  };

  // Page name editing functions
  const startEditingPageName = (pageId: string) => {
    // Get the current project from editorState to ensure we have the latest data
    const currentProject = editorState.getProject();
    const page = currentProject.pages.find((p) => p.id === pageId);
    if (page) {
      setEditingPageName(pageId);
      setEditingPageNameValue(page.name);
    }
  };

  const savePageName = () => {
    if (editingPageName && editingPageNameValue.trim()) {
      // Get the current project from editorState to ensure we have the latest data
      const currentProject = editorState.getProject();

      const updatedPages = currentProject.pages.map((page) =>
        page.id === editingPageName
          ? { ...page, name: editingPageNameValue.trim() }
          : page
      );

      editorState.updateProject({
        ...currentProject,
        pages: updatedPages,
      });
    }
    setEditingPageName(null);
    setEditingPageNameValue("");
  };

  const cancelEditingPageName = () => {
    setEditingPageName(null);
    setEditingPageNameValue("");
  };

  const handlePageNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      savePageName();
    } else if (e.key === "Escape") {
      cancelEditingPageName();
    }
  };

  // Page preview component
  const PagePreview = ({ pageId }: { pageId: string }) => {
    // Get the current project from editorState to ensure we have the latest data
    const currentProject = editorState.getProject();
    const page = currentProject.pages.find((p) => p.id === pageId);
    if (!page) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 h-32 overflow-hidden">
        <div className="text-xs font-medium text-gray-600 mb-1 truncate">
          {page.name}
        </div>
        <div className="relative w-full h-24 bg-gray-50 border border-gray-200 rounded overflow-hidden">
          {/* Mini canvas preview */}
          <div className="w-full h-full relative">
            {page.objects.map((obj) => (
              <div
                key={obj.id}
                className="absolute"
                style={{
                  left: `${(obj.left / 800) * 100}%`,
                  top: `${(obj.top / 600) * 100}%`,
                  width: `${((obj.width || 100) / 800) * 100}%`,
                  height: `${((obj.height || 100) / 600) * 100}%`,
                  transform: `scale(${obj.scaleX || 1}, ${
                    obj.scaleY || 1
                  }) rotate(${obj.angle || 0}deg)`,
                  opacity: obj.opacity || 1,
                }}
              >
                {obj.type === "text" && (
                  <div
                    className="text-xs leading-tight"
                    style={{
                      fontFamily: obj.fontFamily || "Arial",
                      fontSize: `${Math.min(obj.fontSize || 12, 8)}px`,
                      fontWeight: obj.fontWeight || "normal",
                      fontStyle: obj.fontStyle || "normal",
                      color: obj.fill || "#000000",
                      backgroundColor: obj.textBackgroundColor || "transparent",
                      textAlign:
                        (obj.textAlign as
                          | "left"
                          | "center"
                          | "right"
                          | "justify") || "left",
                      letterSpacing: `${obj.letterSpacing || 0}px`,
                      lineHeight: obj.lineHeight || 1.2,
                      wordSpacing: `${obj.wordSpacing || 0}px`,
                      textDecoration:
                        obj.textDecoration === "underline"
                          ? "underline"
                          : "none",
                    }}
                  >
                    {obj.text}
                  </div>
                )}
                {obj.type === "shape" && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: obj.fill || "#3B82F6",
                      border: obj.strokeWidth
                        ? `${obj.strokeWidth}px solid ${
                            obj.stroke || "#000000"
                          }`
                        : "none",
                      borderRadius: obj.cornerRadius
                        ? `${obj.cornerRadius}px`
                        : "0",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // Text formatting shortcuts (only when a text object is selected)
      if (selectedObject && selectedObject.type === "text") {
        switch (e.key.toLowerCase()) {
          case "b":
            if (isCtrlOrCmd) {
              e.preventDefault();
              const newWeight =
                selectedObject.fontWeight === "bold" ? "normal" : "bold";
              updateObjectField("fontWeight", newWeight);
              handleFieldBlur();
            }
            break;
          case "i":
            if (isCtrlOrCmd) {
              e.preventDefault();
              const newStyle =
                selectedObject.fontStyle === "italic" ? "normal" : "italic";
              updateObjectField("fontStyle", newStyle);
              handleFieldBlur();
            }
            break;
          case "u":
            if (isCtrlOrCmd) {
              e.preventDefault();
              const newDecoration =
                selectedObject.textDecoration === "underline"
                  ? "none"
                  : "underline";
              updateObjectField("textDecoration", newDecoration);
              handleFieldBlur();
            }
            break;
          case "l":
            if (isCtrlOrCmd) {
              e.preventDefault();
              updateObjectField("textAlign", "left");
              handleFieldBlur();
            }
            break;
          case "e":
            if (isCtrlOrCmd) {
              e.preventDefault();
              updateObjectField("textAlign", "center");
              handleFieldBlur();
            }
            break;
          case "r":
            if (isCtrlOrCmd) {
              e.preventDefault();
              updateObjectField("textAlign", "right");
              handleFieldBlur();
            }
            break;
          case "j":
            if (isCtrlOrCmd) {
              e.preventDefault();
              updateObjectField("textAlign", "justify");
              handleFieldBlur();
            }
            break;
        }
      }

      // General shortcuts
      switch (e.key.toLowerCase()) {
        case "delete":
          if (selectedObjectIds.length > 0) {
            // Delete multiple objects
            selectedObjectIds.forEach((id) => {
              editorState.deleteObject(id);
            });
            setSelectedObjectIds([]);
          } else if (selectedObjectId) {
            // Delete single object
            editorState.deleteObject(selectedObjectId);
          }
          break;
        case "d":
          if (isCtrlOrCmd) {
            e.preventDefault();
            duplicateObject();
          }
          break;
        case "c":
          if (isCtrlOrCmd) {
            e.preventDefault();
            copyObject();
          }
          break;
        case "v":
          if (isCtrlOrCmd) {
            e.preventDefault();
            handlePaste();
          }
          break;
        case "z":
          if (isCtrlOrCmd && !isShift) {
            e.preventDefault();
            handleUndo();
          } else if (isCtrlOrCmd && isShift) {
            e.preventDefault();
            handleRedo();
          }
          break;
        case "y":
          if (isCtrlOrCmd) {
            e.preventDefault();
            handleRedo();
          }
          break;
        case "s":
          if (isCtrlOrCmd) {
            e.preventDefault();
            saveProject();
          }
          break;
        case "equal":
        case "+":
          if (isCtrlOrCmd) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case "minus":
        case "_":
          if (isCtrlOrCmd) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case "0":
          if (isCtrlOrCmd) {
            e.preventDefault();
            setZoomLevel(1);
          }
          break;
        case "g":
          if (isCtrlOrCmd) {
            e.preventDefault();
            toggleGrid();
          }
          break;
        case "h":
          if (isCtrlOrCmd) {
            e.preventDefault();
            setShowLayers(!showLayers);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedObject,
    selectedObjectId,
    showGrid,
    showLayers,
    selectedObjectIds,
  ]);

  // Keyboard shortcuts data for help popover
  const keyboardShortcuts = [
    {
      category: "Text Formatting",
      shortcuts: [
        { key: "Ctrl/Cmd + B", description: "Bold" },
        { key: "Ctrl/Cmd + I", description: "Italic" },
        { key: "Ctrl/Cmd + U", description: "Underline" },
        { key: "Ctrl/Cmd + L", description: "Align Left" },
        { key: "Ctrl/Cmd + E", description: "Align Center" },
        { key: "Ctrl/Cmd + R", description: "Align Right" },
        { key: "Ctrl/Cmd + J", description: "Justify" },
      ],
    },
    {
      category: "General",
      shortcuts: [
        { key: "Delete", description: "Delete selected object" },
        { key: "Ctrl/Cmd + D", description: "Duplicate object" },
        { key: "Ctrl/Cmd + C", description: "Copy object" },
        { key: "Ctrl/Cmd + V", description: "Paste object/text" },
        { key: "Ctrl/Cmd + Z", description: "Undo" },
        { key: "Ctrl/Cmd + Shift + Z", description: "Redo" },
        { key: "Ctrl/Cmd + Y", description: "Redo" },
        { key: "Ctrl/Cmd + S", description: "Save project" },
      ],
    },
    {
      category: "View",
      shortcuts: [
        { key: "Ctrl/Cmd + +", description: "Zoom In" },
        { key: "Ctrl/Cmd + -", description: "Zoom Out" },
        { key: "Ctrl/Cmd + 0", description: "Reset Zoom" },
        { key: "Ctrl/Cmd + G", description: "Toggle Grid" },
        { key: "Ctrl/Cmd + H", description: "Toggle Layers" },
      ],
    },
  ];

  // Page actions
  const selectPage = (pageId: string) => {
    editorState.selectPage(pageId);
  };

  const addPage = () => {
    editorState.addPage();
  };

  const duplicatePage = (pageId: string) => {
    editorState.duplicatePage(pageId);
  };

  const deletePage = (pageId: string) => {
    editorState.deletePage(pageId);
  };

  // Object actions
  const handleObjectSelect = (objectId: string | null) => {
    setSelectedObjectId(objectId);
    setSelectedObjectIds([]); // Clear multi-selection when single object is selected
    editorState.selectObject(objectId);
  };

  const handleMultiSelect = (objectIds: string[]) => {
    setSelectedObjectIds(objectIds);
    // For single selection, set the selectedObjectId for PropertiesPanel
    // For multi-selection, clear selectedObjectId so PropertiesPanel doesn't show
    const singleObjectId = objectIds.length === 1 ? objectIds[0] : null;
    setSelectedObjectId(singleObjectId);

    // Also update the editor state for single object selection
    if (singleObjectId) {
      editorState.selectObject(singleObjectId);
    } else {
      editorState.selectObject(null);
    }
  };

  const addText = useCallback(() => {
    const newText: EditorObject = {
      id: `text-${Date.now()}`,
      type: "text",
      left: 100,
      top: 100,
      text: "Double click to edit",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      width: 200,
      height: 30,
    };
    editorState.addObject(newText);
  }, []);

  const addShape = useCallback((shapeType: string) => {
    editorState.addShape(shapeType);
  }, []);

  const duplicateObject = () => {
    if (selectedObjectIds.length > 0) {
      // Duplicate multiple objects
      selectedObjectIds.forEach((id) => {
        editorState.duplicateObject(id);
      });
    } else if (selectedObjectId) {
      editorState.duplicateObject(selectedObjectId);
    }
  };

  const copyObject = () => {
    console.log(
      "Copy triggered. Selected objects:",
      selectedObjectIds.length,
      "Selected object:",
      selectedObjectId
    );

    // Prioritize single object selection over multi-selection
    if (selectedObject) {
      // Copy single object
      const copiedObject: EditorObject = {
        ...selectedObject,
        id: `copied-${Date.now()}`,
        left: selectedObject.left + 20,
        top: selectedObject.top + 20,
      };
      editorState.setClipboard([copiedObject]);
      console.log("Copied single object:", copiedObject.type);
    } else if (selectedObjectIds.length > 0) {
      // Copy multiple objects
      const copiedObjects = selectedObjectIds
        .map((id, index) => {
          const obj = currentPage?.objects.find((o) => o.id === id);
          if (obj) {
            return {
              ...obj,
              id: `copied-${Date.now()}-${index}`,
              left: obj.left + 20,
              top: obj.top + 20,
            };
          }
          return null;
        })
        .filter(Boolean) as EditorObject[];

      if (copiedObjects.length > 0) {
        editorState.setClipboard(copiedObjects);
        console.log(
          `Copied ${copiedObjects.length} objects:`,
          copiedObjects.map((obj) => obj.type)
        );
      }
    } else {
      // Clear clipboard if nothing is selected
      editorState.clearClipboard();
      console.log("No objects selected, cleared clipboard");
    }
  };

  const pasteObject = () => {
    const clipboard = editorState.getClipboard();
    if (clipboard && clipboard.length > 0 && currentPage) {
      const timestamp = Date.now();
      const pastedObjects: EditorObject[] = [];

      // Paste multiple objects
      clipboard.forEach((obj, index) => {
        const pastedObject: EditorObject = {
          ...obj,
          id: `pasted-${timestamp}-${index}`,
          left: obj.left + index * 10,
          top: obj.top + index * 10,
        };
        pastedObjects.push(pastedObject);
        editorState.addObject(pastedObject);
      });

      console.log(`Pasted ${pastedObjects.length} objects`);

      // Select the pasted objects
      if (pastedObjects.length === 1) {
        setSelectedObjectId(pastedObjects[0].id);
        editorState.selectObject(pastedObjects[0].id);
        setSelectedObjectIds([]);
      } else {
        setSelectedObjectIds(pastedObjects.map((obj) => obj.id));
        setSelectedObjectId(null);
        editorState.selectObject(null);
      }
    } else {
      console.log("No clipboard content to paste");
    }
  };

  const pasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && currentPage) {
        // Check if the text looks like code (contains common code patterns)
        const isCode =
          /^(function|const|let|var|import|export|class|if|for|while|switch|case|return|console\.|document\.|window\.|<script|<html|<body|<div|<span|<p>)/i.test(
            text.trim()
          ) ||
          /[{}();=><]/.test(text) ||
          text.includes("function") ||
          text.includes("const ") ||
          text.includes("let ") ||
          text.includes("var ") ||
          text.includes("import ") ||
          text.includes("export ") ||
          text.includes("class ") ||
          text.includes("if (") ||
          text.includes("for (") ||
          text.includes("while (") ||
          text.includes("switch (") ||
          text.includes("case ") ||
          text.includes("return ") ||
          text.includes("console.") ||
          text.includes("document.") ||
          text.includes("window.") ||
          text.includes("<script") ||
          text.includes("<html") ||
          text.includes("<body") ||
          text.includes("<div") ||
          text.includes("<span") ||
          text.includes("<p>");

        // If it looks like code, don't paste it
        if (isCode) {
          console.log("Detected code in clipboard, skipping paste");
          return;
        }

        // Create a new text object with the pasted content
        const newText: EditorObject = {
          id: `text-${Date.now()}`,
          type: "text",
          left: 100,
          top: 100,
          text: text,
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
          width: 200,
          height: 30,
        };
        editorState.addObject(newText);
        console.log("Pasted text object");
      }
    } catch (error) {
      console.log("Could not read clipboard text:", error);
    }
  };

  const handlePaste = () => {
    const clipboard = editorState.getClipboard();
    console.log(
      "Paste triggered. Clipboard:",
      clipboard ? `${clipboard.length} objects` : "empty"
    );

    if (clipboard && clipboard.length > 0) {
      // If we have copied objects, paste them
      pasteObject();
    } else {
      // Only try to paste text if no objects are selected (to avoid accidental text pasting)
      if (!selectedObjectId && !selectedObjectIds.length) {
        pasteText();
      } else {
        console.log("Objects selected, skipping text paste");
      }
    }
  };

  // Undo/Redo actions
  const handleUndo = () => {
    editorState.undo();
  };

  const handleRedo = () => {
    editorState.redo();
  };

  // Grid and Ruler actions
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const toggleRuler = () => {
    setShowRuler(!showRuler);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2)); // Max zoom 300%
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5)); // Min zoom 10%
  };

  const handleZoomPreset = (preset: string) => {
    setZoomLevel(parseInt(preset) / 100); // Convert string to number then to decimal
  };

  // Project actions
  const saveProject = useCallback(() => {
    editorState.saveToLocalStorage();
  }, []);

  const loadProject = useCallback(() => {
    editorState.loadFromLocalStorage();
  }, []);

  const exportProject = useCallback(() => {
    const json = editorState.exportProject();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-invitation.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importProject = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      editorState.importProject(content);
    };
    reader.readAsText(file);
  }, []);

  // Background actions
  const changeBackgroundColor = useCallback((color: string) => {
    editorState.updateBackgroundColor(color);
  }, []);

  // Image actions
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      console.log("Uploading image to ImageKit:", file.name);
      const imageKitUrl = await imagekitService.uploadImage(file);
      console.log("Image uploaded to ImageKit:", imageKitUrl);

      // Add the uploaded image to the canvas
      editorState.addImage(imageKitUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Fallback: add image directly without ImageKit upload
      const dataUrl = URL.createObjectURL(file);
      editorState.addImage(dataUrl);
    }
  }, []);

  const selectStockImage = useCallback((imageUrl: string) => {
    // Add the selected image to the canvas
    editorState.addImage(imageUrl);
  }, []);

  const handleIconSelect = useCallback(
    (iconData: { name: string; svg: string; prefix: string }) => {
      // Use the new addIcon method from editor state
      editorState.addIcon(iconData);
    },
    []
  );

  // Form handling
  const updateObjectField = (field: string, value: string | number) => {
    if (!selectedObjectId) return;

    // Get the current object to ensure we have all properties
    const currentObject = editorState.getObject(selectedObjectId);
    if (!currentObject) return;

    // Update the object with the new field value
    const updatedObject = { ...currentObject, [field]: value };

    // Use updateObject instead of updateObjectSilent to ensure changes are saved
    editorState.updateObject(selectedObjectId, updatedObject);

    // Force a re-render by updating the project state
    setProject(editorState.getProject());
  };

  const handleFieldBlur = () => {
    // This function is no longer needed since we're using updateObject directly
    // But keeping it for backward compatibility
  };

  // Layer actions for specific objects
  const moveSpecificObjectUp = (objectId: string) => {
    editorState.moveObjectUp(objectId);
  };

  const moveSpecificObjectDown = (objectId: string) => {
    editorState.moveObjectDown(objectId);
  };

  const reorderObjects = (fromIndex: number, toIndex: number) => {
    if (!currentPage) return;

    // Get the current project from editorState to ensure we have the latest data
    const currentProject = editorState.getProject();
    const currentPageFromState = currentProject.pages.find(
      (p) => p.id === currentPage.id
    );

    if (!currentPageFromState) return;

    const newObjects = [...currentPageFromState.objects];
    const [movedObject] = newObjects.splice(fromIndex, 1);
    newObjects.splice(toIndex, 0, movedObject);

    // Update the page with reordered objects
    const updatedPages = currentProject.pages.map((page) =>
      page.id === currentPage.id ? { ...page, objects: newObjects } : page
    );

    editorState.updateProject({
      ...currentProject,
      pages: updatedPages,
    });
  };

  // Memoize sidebar components to prevent unnecessary re-renders
  const memoizedElementsTab = useMemo(
    () => (
      <ElementsTab
        selectedObject={selectedObject}
        onAddText={addText}
        onAddShape={addShape}
        onSave={saveProject}
        onLoad={loadProject}
        onExport={exportProject}
        onImport={importProject}
      />
    ),
    [
      selectedObject,
      addText,
      addShape,
      saveProject,
      loadProject,
      exportProject,
      importProject,
    ]
  );

  const memoizedImagesTab = useMemo(
    () => (
      <ImagesTab
        onImageUpload={handleImageUpload}
        onStockImageSelect={selectStockImage}
      />
    ),
    [handleImageUpload, selectStockImage]
  );

  const memoizedBackgroundsTab = useMemo(
    () => (
      <BackgroundsTab
        backgroundColor={currentPage?.backgroundColor || "#ffffff"}
        onBackgroundColorChange={changeBackgroundColor}
      />
    ),
    [currentPage?.backgroundColor, changeBackgroundColor]
  );

  const memoizedIconsTab = useMemo(
    () => <IconsTab onIconSelect={handleIconSelect} />,
    [handleIconSelect]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Tools */}
      <div className="w-64 lg:w-80 bg-white border-r border-gray-200 flex flex-col max-h-screen">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 flex-shrink-0 text-center">
          <h1 className="text-lg lg:text-xl font-bold text-gray-800 truncate">
            Invitation Editor
          </h1>
          <p className="text-xs lg:text-sm text-gray-600 hidden sm:block mt-1">
            Create beautiful invitations
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-4 w-full h-fit gap-1 p-2 bg-gray-50 border-b border-gray-200">
            <TabsTrigger
              value="elements"
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-lg transition-all hover:bg-gray-100 data-[state=active]:hover:bg-white h-16"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center data-[state=active]:bg-blue-500 transition-colors">
                <Layers className="w-3 h-3 text-blue-600 data-[state=active]:text-white" />
              </div>
              <span className="font-medium text-xs">Elements</span>
            </TabsTrigger>

            <TabsTrigger
              value="images"
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-lg transition-all hover:bg-gray-100 data-[state=active]:hover:bg-white h-16"
            >
              <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center data-[state=active]:bg-green-500 transition-colors">
                <ImageIcon className="w-3 h-3 text-green-600 data-[state=active]:text-white" />
              </div>
              <span className="font-medium text-xs">Images</span>
            </TabsTrigger>

            <TabsTrigger
              value="backgrounds"
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-lg transition-all hover:bg-gray-100 data-[state=active]:hover:bg-white h-16"
            >
              <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center data-[state=active]:bg-purple-500 transition-colors">
                <Palette className="w-3 h-3 text-purple-600 data-[state=active]:text-white" />
              </div>
              <span className="font-medium text-xs">Scene</span>
            </TabsTrigger>

            <TabsTrigger
              value="icons"
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-lg transition-all hover:bg-gray-100 data-[state=active]:hover:bg-white h-16"
            >
              <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center data-[state=active]:bg-orange-500 transition-colors">
                <Star className="w-3 h-3 text-orange-600 data-[state=active]:text-white" />
              </div>
              <span className="font-medium text-xs">Icons</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="elements" className="mt-0 h-full">
              {memoizedElementsTab}
            </TabsContent>

            <TabsContent value="images" className="mt-0 h-full">
              {memoizedImagesTab}
            </TabsContent>

            <TabsContent value="backgrounds" className="mt-0 h-full">
              {memoizedBackgroundsTab}
            </TabsContent>

            <TabsContent value="icons" className="mt-0 h-full">
              {memoizedIconsTab}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-2 lg:p-4 z-10 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
              {editingPageName ? (
                <input
                  type="text"
                  value={editingPageNameValue}
                  onChange={(e) => setEditingPageNameValue(e.target.value)}
                  onBlur={savePageName}
                  onKeyDown={handlePageNameKeyDown}
                  className="text-base lg:text-xl font-semibold text-gray-800 focus:outline-none bg-transparent border-b border-gray-300 focus:border-primary px-1"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-base lg:text-xl font-semibold text-gray-800 truncate">
                    {currentPage?.name || "Wedding Invitation"}
                  </h1>
                  {currentPage && (
                    <button
                      onClick={() => startEditingPageName(currentPage.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
                      title="Edit page name"
                    >
                      <Edit3 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
              )}
              {selectedObject && (
                <span className="text-xs lg:text-sm text-gray-500 hidden sm:inline">
                  Selected: {selectedObject.type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
              {/* Duplicate/Delete - only show when object is selected */}
              {(selectedObject || selectedObjectIds.length > 0) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={duplicateObject}
                    className="h-8 px-2 lg:px-3"
                  >
                    <Copy className="w-3 h-3 lg:w-4 lg:h-4 " />
                    {/* <span className="hidden sm:inline">Duplicate</span> */}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedObjectIds.length > 0) {
                        // Delete multiple objects
                        selectedObjectIds.forEach((id) => {
                          editorState.deleteObject(id);
                        });
                        setSelectedObjectIds([]);
                      } else if (selectedObjectId) {
                        // Delete single object
                        editorState.deleteObject(selectedObjectId);
                      }
                    }}
                    className="h-8 px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 " />
                    {/* <span className="hidden sm:inline">Delete</span> */}
                  </Button>
                </>
              )}

              <Separator orientation="vertical" className="h-8" />

              {/* Undo/Redo */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!editorState.canUndo()}
                className="h-8 px-2 lg:px-3"
              >
                <Undo className="w-3 h-3 lg:w-4 lg:h-4 " />
                {/* <span className="hidden sm:inline">Undo</span> */}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!editorState.canRedo()}
                className="h-8 px-2 lg:px-3"
              >
                <Redo className="w-3 h-3 lg:w-4 lg:h-4 " />
                {/* <span className="hidden sm:inline">Redo</span> */}
              </Button>

              <Separator orientation="vertical" className="h-8" />

              {/* Help Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 lg:px-3"
                  >
                    <Keyboard className="w-3 h-3 lg:w-4 lg:h-4" />
                    {/* <span className="hidden sm:inline ml-1">Help</span> */}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 " align="end">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Keyboard className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-base">
                        Keyboard Shortcuts
                      </h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {keyboardShortcuts.map((category) => (
                        <div key={category.category}>
                          <h4 className="font-medium text-xs text-gray-700 mb-1.5 uppercase tracking-wide">
                            {category.category}
                          </h4>
                          <div className="grid grid-cols-1 gap-1">
                            {category.shortcuts.map((shortcut) => (
                              <div
                                key={shortcut.key}
                                className="flex items-center justify-between text-xs py-0.5"
                              >
                                <span className="text-gray-600 truncate">
                                  {shortcut.description}
                                </span>
                                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono ml-2 flex-shrink-0">
                                  {shortcut.key}
                                </kbd>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        💡 Text formatting shortcuts work when text is selected
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Separator orientation="vertical" className="h-8" />

              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.1}
                className="h-8 px-2 lg:px-3"
              >
                <ZoomOut className="w-3 h-3 lg:w-4 lg:h-4 " />
                {/* <span className="hidden sm:inline">Zoom Out</span> */}
              </Button>
              {/* Zoom Presets */}
              <Select
                onValueChange={handleZoomPreset}
                value={`${Math.round(zoomLevel * 100)}`}
              >
                <SelectTrigger className="w-fit h-6">
                  <SelectValue placeholder="Zoom" />
                </SelectTrigger>
                <SelectContent>
                  {[50, 75, 100, 125, 150, 175, 200].map((preset) => (
                    <SelectItem key={preset} value={`${preset}`}>
                      {preset}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="h-8 px-2 lg:px-3"
              >
                <ZoomIn className="w-3 h-3 lg:w-4 lg:h-4 " />
                {/* <span className="hidden sm:inline">Zoom In</span> */}
              </Button>

              <Separator orientation="vertical" className="h-8" />

              {/* Grid and Ruler */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleGrid}
                className={`h-8 px-2 lg:px-3 ${
                  showGrid ? "bg-blue-100 border-blue-300" : ""
                }`}
              >
                <Grid className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRuler}
                className={`h-8 px-2 lg:px-3 ${
                  showRuler ? "bg-blue-100 border-blue-300" : ""
                }`}
              >
                <Ruler className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Ruler</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLayers(!showLayers)}
                className="h-8 px-2 lg:px-3"
              >
                <Layers className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Layers</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveProject}
                className="h-8 px-2 lg:px-3"
              >
                <Save className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportProject}
                className="h-8 px-2 lg:px-3"
              >
                <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto relative min-h-0">
          <div className="p-2 lg:p-6 min-h-full">
            {currentPage ? (
              <JsonCanvas
                page={currentPage}
                onObjectSelect={handleObjectSelect}
                onMultiSelect={handleMultiSelect}
                showGrid={showGrid}
                showRuler={showRuler}
                zoomLevel={zoomLevel}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                    No page selected
                  </h3>
                  <p className="text-sm lg:text-base text-gray-500 mb-4">
                    Create a new page to start designing your invitation
                  </p>
                  <Button onClick={addPage} size="sm" className="lg:text-base">
                    <FileText className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                    Add Page
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pages Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 p-2 lg:p-3 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex-shrink-0 w-12">
              Pages
            </span>

            {/* Navigation buttons - always rendered but conditionally visible */}
            <div className="flex-shrink-0 w-6 h-6">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={pageOffset === 0 || !showNavigation}
                className="h-6 w-6 p-0 bg-white hover:bg-primary/10 border-gray-300 hover:border-primary transition-all duration-150 disabled:opacity-0 disabled:pointer-events-none"
                title="Previous pages"
              >
                <ChevronLeft className="w-3 h-3 text-gray-600" />
              </Button>
            </div>

            {/* Visible pages - left aligned */}
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex items-center gap-2 transition-all duration-300 ease-in-out">
                {project.pages
                  .slice(pageOffset, pageOffset + pagesPerView)
                  .map((page, index) => (
                    <TooltipProvider key={page.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center gap-1 flex-shrink-0 transition-all duration-300 ease-in-out ${
                              index === 0
                                ? "animate-fade-in"
                                : index === 1
                                ? "animate-fade-in [animation-delay:0.1s]"
                                : index === 2
                                ? "animate-fade-in [animation-delay:0.2s]"
                                : "animate-fade-in [animation-delay:0.3s]"
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, page.id)}
                            onDragOver={(e) => handleDragOver(e, page.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, page.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <div
                              className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition-all duration-200 cursor-pointer relative ${
                                selectedPageId === page.id
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "bg-white hover:bg-primary/10 border border-gray-300 hover:border-primary"
                              } ${
                                draggedPageId === page.id ? "opacity-50" : ""
                              }`}
                              onClick={() => selectPage(page.id)}
                            >
                              {/* Drag overlay for visual feedback */}
                              {dragOverPageId === page.id && (
                                <div className="absolute inset-0 border-2 border-dashed border-primary rounded-full pointer-events-none" />
                              )}

                              {/* Drag handle */}
                              <GripVertical className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing" />

                              <div className="flex items-center gap-1">
                                <FileText
                                  className={`w-3 h-3 lg:w-4 lg:h-4 ${
                                    selectedPageId === page.id
                                      ? "text-primary-foreground"
                                      : "text-gray-600"
                                  }`}
                                />
                                <span
                                  className={`text-xs lg:text-sm font-medium ${
                                    selectedPageId === page.id
                                      ? "text-primary-foreground"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {page.name}
                                </span>
                              </div>

                              {/* Action buttons within the same container */}
                              <div className="flex items-center gap-0.5 ml-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicatePage(page.id);
                                  }}
                                  className={`h-5 w-5 p-0 rounded-full transition-all duration-150 hover:scale-110 ${
                                    selectedPageId === page.id
                                      ? "text-primary-foreground hover:bg-primary-foreground/20"
                                      : "text-gray-500 hover:bg-primary/20"
                                  }`}
                                  title="Duplicate page"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </Button>
                                {project.pages.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deletePage(page.id);
                                    }}
                                    className={`h-5 w-5 p-0 rounded-full transition-all duration-150 hover:scale-110 ${
                                      selectedPageId === page.id
                                        ? "text-primary-foreground hover:bg-red-500/20"
                                        : "text-gray-500 hover:bg-red-500/20"
                                    }`}
                                    title="Delete page"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="p-0 border-0 bg-transparent"
                        >
                          <PagePreview pageId={page.id} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
              </div>
            </div>

            {/* Navigation buttons - always rendered but conditionally visible */}
            <div className="flex-shrink-0 w-6 h-6">
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={pageOffset === maxOffset || !showNavigation}
                className="h-6 w-6 p-0 bg-white hover:bg-primary/10 border-gray-300 hover:border-primary transition-all duration-150 disabled:opacity-0 disabled:pointer-events-none"
                title="Next pages"
              >
                <ChevronRight className="w-3 h-3 text-gray-600" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addPage}
              className="flex-shrink-0 bg-white hover:bg-green-50 border-gray-300 hover:border-green-300 transition-all duration-200 w-16"
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-green-600" />
              <span className="text-xs lg:text-sm font-medium text-green-700">
                Add
              </span>
            </Button>
          </div>
        </div>

        {/* Right Side Panels - Sticky positioning */}
        <div className="absolute top-[69px] right-0 h-full flex z-20 pointer-events-none max-h-[calc(100vh-69px)]">
          {/* Layers Panel */}
          {showLayers && (
            <div className="pointer-events-auto">
              <LayersPanel
                currentPage={currentPage}
                selectedObjectIds={selectedObjectIds}
                onObjectSelect={handleObjectSelect}
                onMoveObjectUp={moveSpecificObjectUp}
                onMoveObjectDown={moveSpecificObjectDown}
                onDuplicateObject={(objectId) =>
                  editorState.duplicateObject(objectId)
                }
                onDeleteObject={(objectId) =>
                  editorState.deleteObject(objectId)
                }
                onReorderObjects={reorderObjects}
              />
            </div>
          )}

          {/* Properties Panel */}
          {selectedObject && (
            <div className="pointer-events-auto">
              <PropertiesPanel
                selectedObject={selectedObject}
                selectedObjectId={selectedObjectId}
                onUpdateObjectField={updateObjectField}
                onFieldBlur={handleFieldBlur}
                onUpdateObject={(objectId, updates) =>
                  editorState.updateObject(objectId, updates)
                }
                onForceRender={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
