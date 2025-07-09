"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { editorState, EditorObject } from "@/lib/editor-state";
import JsonCanvas from "@/components/editor/JsonCanvas";
import ElementsTab from "@/components/editor/sidebar/ElementsTab";
import ImagesTab from "@/components/editor/sidebar/ImagesTab";
import BackgroundsTab from "@/components/editor/sidebar/BackgroundsTab";
import PagesTab from "@/components/editor/sidebar/PagesTab";
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

export default function TemplateCreator() {
  const [project, setProject] = useState(editorState.getProject());
  const [selectedPageId, setSelectedPageId] = useState(project.selectedPageId);
  const [selectedObjectId, setSelectedObjectId] = useState(
    project.selectedObjectId
  );
  const [activeTab, setActiveTab] = useState("elements");
  const [showLayers, setShowLayers] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentPage =
    project.pages.find((p) => p.id === selectedPageId) || null;
  const selectedObject =
    currentPage?.objects.find((obj) => obj.id === selectedObjectId) || null;

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = editorState.subscribe((updatedProject) => {
      setProject(updatedProject);
      setSelectedPageId(updatedProject.selectedPageId);
      setSelectedObjectId(updatedProject.selectedObjectId);
    });

    return unsubscribe;
  }, []);

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
    editorState.selectObject(objectId);
  };

  const addText = () => {
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
  };

  const addShape = (shapeType: string) => {
    editorState.addShape(shapeType);
  };

  const duplicateObject = () => {
    if (selectedObjectId) {
      editorState.duplicateObject(selectedObjectId);
    }
  };

  const deleteObject = () => {
    if (selectedObjectId) {
      editorState.deleteObject(selectedObjectId);
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
  const saveProject = () => {
    editorState.saveToLocalStorage();
  };

  const loadProject = () => {
    editorState.loadFromLocalStorage();
  };

  const exportProject = () => {
    const json = editorState.exportProject();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-invitation.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      editorState.importProject(content);
    };
    reader.readAsText(file);
  };

  // Background actions
  const changeBackgroundColor = (color: string) => {
    editorState.updateBackgroundColor(color);
  };

  const selectBackgroundPattern = (patternId: string) => {
    // Handle background pattern selection
    console.log("Background pattern selected:", patternId);
  };

  // Image actions
  const handleImageUpload = (file: File) => {
    // Handle image upload
    console.log("Image uploaded:", file);
  };

  const selectStockImage = (imageUrl: string) => {
    // Handle stock image selection
    console.log("Stock image selected:", imageUrl);
  };

  // Form handling
  const updateObjectField = (field: string, value: string | number) => {
    if (!selectedObjectId) return;
    editorState.updateObjectSilent(selectedObjectId, { [field]: value });
  };

  const handleFieldBlur = () => {
    if (!selectedObjectId) return;
    const object = editorState.getObject(selectedObjectId);
    if (object) {
      editorState.updateObject(selectedObjectId, object);
    }
  };

  // Layer actions for specific objects
  const moveSpecificObjectUp = (objectId: string) => {
    editorState.moveObjectUp(objectId);
  };

  const moveSpecificObjectDown = (objectId: string) => {
    editorState.moveObjectDown(objectId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Tools */}
      <div className="w-64 lg:w-80 bg-white border-r border-gray-200 flex flex-col max-h-screen">
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-gray-200 flex-shrink-0 text-center">
          <h1 className="text-lg lg:text-xl font-bold text-gray-800 truncate ">
            Invitation Editor
          </h1>
          <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">
            Create beautiful invitations
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 grid-rows-2 h-fit gap-2 p-2 flex-shrink-0">
            <TabsTrigger
              value="elements"
              className="flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Elements</span>
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger
              value="backgrounds"
              className="flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Palette className="w-4 h-4" />
              <span>Backgrounds</span>
            </TabsTrigger>
            <TabsTrigger
              value="pages"
              className="flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Pages</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="elements" className="mt-0 h-full">
              <ElementsTab
                selectedObject={selectedObject}
                onAddText={addText}
                onAddShape={addShape}
                onSave={saveProject}
                onLoad={loadProject}
                onExport={exportProject}
                onImport={importProject}
              />
            </TabsContent>

            <TabsContent value="images" className="mt-0 h-full">
              <ImagesTab
                onImageUpload={handleImageUpload}
                onStockImageSelect={selectStockImage}
              />
            </TabsContent>

            <TabsContent value="backgrounds" className="mt-0 h-full">
              <BackgroundsTab
                backgroundColor={currentPage?.backgroundColor || "#ffffff"}
                onBackgroundColorChange={changeBackgroundColor}
                onBackgroundPatternSelect={selectBackgroundPattern}
              />
            </TabsContent>

            <TabsContent value="pages" className="mt-0 h-full">
              <PagesTab
                pages={project.pages}
                selectedPageId={selectedPageId}
                onPageSelect={selectPage}
                onPageDuplicate={duplicatePage}
                onPageDelete={deletePage}
                onPageAdd={addPage}
              />
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
              <h1 className="text-base lg:text-xl font-semibold text-gray-800 truncate">
                {currentPage?.name || "Wedding Invitation"}
              </h1>
              {selectedObject && (
                <span className="text-xs lg:text-sm text-gray-500 hidden sm:inline">
                  Selected: {selectedObject.type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
              {/* Duplicate/Delete - only show when object is selected */}
              {selectedObject && (
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
                    onClick={deleteObject}
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

        {/* Right Side Panels - Sticky positioning */}
        <div className="absolute top-[65px] right-0 h-full flex z-20 pointer-events-none max-h-[calc(100vh-65px)]">
          {/* Layers Panel */}
          {showLayers && (
            <div className="pointer-events-auto">
              <LayersPanel
                currentPage={currentPage}
                selectedObjectId={selectedObjectId}
                onObjectSelect={handleObjectSelect}
                onMoveObjectUp={moveSpecificObjectUp}
                onMoveObjectDown={moveSpecificObjectDown}
                onDuplicateObject={(objectId) =>
                  editorState.duplicateObject(objectId)
                }
                onDeleteObject={(objectId) =>
                  editorState.deleteObject(objectId)
                }
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
