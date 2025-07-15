"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { EditorObject } from "@/lib/editor-state";
import { editorState } from "@/lib/editor-state";
import {
  Upload,
  Sparkles,
  Eraser,
  Sun,
  ArrowUp,
  Smile,
  Crop,
  Image as ImageIcon,
  Wand2,
  Text as TextIcon,
  Eye,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { imagekitService } from "@/lib/imagekit-service";

// Custom animations for the loading state
const loadingStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200px 100%;
    animation: shimmer 2s infinite;
  }
  
  .animate-delay-1000 {
    animation-delay: 1s;
  }
  
  .animate-delay-1500 {
    animation-delay: 1.5s;
  }
  
  .animate-delay-2000 {
    animation-delay: 2s;
  }
`;

interface ImagePropertiesProps {
  selectedObject: EditorObject;
  selectedObjectId: string;
  onUpdateObject: (objectId: string, updates: Partial<EditorObject>) => void;
}

// Move AI state outside the component to preserve across re-renders
let globalAiTab = "edit";
let globalAiBgPrompt = "";
let globalAiEditPrompt = "";
let globalAiGenTextPrompt = "";
let globalAiPreviewUrl: string | null = null;

export default function ImageProperties({
  selectedObject,
  selectedObjectId,
  onUpdateObject,
}: ImagePropertiesProps) {
  const [aiBgPrompt, setAiBgPrompt] = useState(globalAiBgPrompt);
  const [aiEditPrompt, setAiEditPrompt] = useState(globalAiEditPrompt);
  const [aiGenTextPrompt, setAiGenTextPrompt] = useState(globalAiGenTextPrompt);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(
    globalAiPreviewUrl
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTab, setAiTab] = useState(globalAiTab);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [demoNotice, setDemoNotice] = useState(true);
  const [generationFailed, setGenerationFailed] = useState(false);

  // Local editing state
  const [editTabImage, setEditTabImage] = useState<string | null>(null);
  const [editTabPreviewUrl, setEditTabPreviewUrl] = useState<string | null>(
    null
  );
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [noise, setNoise] = useState(0);
  const [whiteBalance, setWhiteBalance] = useState(0);
  const [filter, setFilter] = useState<string>("none");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Sync global state on change
  useEffect(() => {
    globalAiTab = aiTab;
  }, [aiTab]);
  useEffect(() => {
    globalAiBgPrompt = aiBgPrompt;
  }, [aiBgPrompt]);
  useEffect(() => {
    globalAiEditPrompt = aiEditPrompt;
  }, [aiEditPrompt]);
  useEffect(() => {
    globalAiGenTextPrompt = aiGenTextPrompt;
  }, [aiGenTextPrompt]);
  useEffect(() => {
    globalAiPreviewUrl = aiPreviewUrl;
  }, [aiPreviewUrl]);

  // Load selected image into preview when selectedObject changes
  useEffect(() => {
    if (
      selectedObject &&
      selectedObject.type === "image" &&
      selectedObject.imageUrl
    ) {
      setEditTabImage(selectedObject.imageUrl);
      setEditError(null);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setExposure(0);
      setSharpness(0);
      setNoise(0);
      setWhiteBalance(0);
      setFilter("none");
    } else {
      setEditTabImage(null);
      setEditTabPreviewUrl(null);
    }
  }, [selectedObject?.imageUrl]);

  // Apply filters to preview image
  useEffect(() => {
    if (!editTabImage) return;
    setEditLoading(true);

    // Use a more direct approach to avoid TypeScript issues
    const loadImage = async () => {
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Apply filters using canvas operations
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply brightness and contrast
          for (let i = 0; i < data.length; i += 4) {
            // Brightness
            if (brightness !== 0) {
              data[i] = Math.max(0, Math.min(255, data[i] + brightness * 255));
              data[i + 1] = Math.max(
                0,
                Math.min(255, data[i + 1] + brightness * 255)
              );
              data[i + 2] = Math.max(
                0,
                Math.min(255, data[i + 2] + brightness * 255)
              );
            }

            // Contrast
            if (contrast !== 0) {
              const factor =
                (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
              data[i] = Math.max(
                0,
                Math.min(255, factor * (data[i] - 128) + 128)
              );
              data[i + 1] = Math.max(
                0,
                Math.min(255, factor * (data[i + 1] - 128) + 128)
              );
              data[i + 2] = Math.max(
                0,
                Math.min(255, factor * (data[i + 2] - 128) + 128)
              );
            }

            // Saturation
            if (saturation !== 0) {
              const gray =
                0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              data[i] = gray + saturation * (data[i] - gray);
              data[i + 1] = gray + saturation * (data[i + 1] - gray);
              data[i + 2] = gray + saturation * (data[i + 2] - gray);
            }

            // Grayscale filter
            if (filter === "grayscale") {
              const gray =
                0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              data[i] = gray;
              data[i + 1] = gray;
              data[i + 2] = gray;
            }

            // Sepia filter
            if (filter === "sepia") {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
              data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
              data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }

            // Invert filter
            if (filter === "invert") {
              data[i] = 255 - data[i];
              data[i + 1] = 255 - data[i + 1];
              data[i + 2] = 255 - data[i + 2];
            }
          }

          ctx.putImageData(imageData, 0, 0);

          // Set the preview URL directly from canvas
          setEditTabPreviewUrl(canvas.toDataURL());
          setEditLoading(false);
        };
        img.src = editTabImage;
      } catch (error) {
        console.error("Error processing image:", error);
        setEditLoading(false);
      }
    };

    loadImage();
  }, [
    editTabImage,
    brightness,
    contrast,
    saturation,
    exposure,
    sharpness,
    noise,
    whiteBalance,
    filter,
  ]);

  // Save handler: update the selected image on the canvas
  const handleSaveEdit = async () => {
    if (!editTabPreviewUrl || !selectedObjectId) return;
    setEditLoading(true);
    onUpdateObject(selectedObjectId, { imageUrl: editTabPreviewUrl });
    setEditLoading(false);
  };

  // Handler for AI preview
  const handleAIPreview = async (operation: string, prompt?: string) => {
    setAiLoading(true);
    setGenerationFailed(false); // Reset failed state when starting new transformation
    try {
      let url = getImageUrl();

      // If we have a selected image, use it for AI transformation
      if (url) {
        console.log("Using selected image for AI transformation:", url);
      } else if (uploadedFile) {
        // If no selected image but we have an uploaded file, use that
        url = await imagekitService.uploadImage(uploadedFile);
        console.log("Using uploaded file for AI transformation:", url);
      } else {
        console.error(
          "No image URL or uploaded file available for AI transformation"
        );
        setAiLoading(false);
        return;
      }

      // Process AI transformation using backend
      const transformedUrl = await imagekitService.processAITransformation(
        url,
        operation,
        prompt
      );
      setAiPreviewUrl(transformedUrl);
    } catch (error) {
      console.error("Error applying AI transformation:", error);
      setGenerationFailed(true); // Set failed state on error
    } finally {
      setAiLoading(false);
    }
  };

  // Handler for AI apply - either replace current image or add new image
  const handleAIApply = () => {
    if (aiPreviewUrl) {
      if (
        selectedObject &&
        selectedObject.type === "image" &&
        selectedObjectId
      ) {
        // Replace the current image
        onUpdateObject(selectedObjectId, { imageUrl: aiPreviewUrl });
        console.log(
          "Replaced current image with AI transformed image:",
          aiPreviewUrl
        );
      } else {
        // Add new image to canvas
        editorState.addImage(aiPreviewUrl);
        console.log("Added new AI transformed image to canvas:", aiPreviewUrl);
      }
      setAiPreviewUrl(null);
      setGenerationFailed(false);
    }
  };

  // Check if we have an image selected
  const hasSelectedImage = selectedObject && selectedObject.type === "image";

  // UI for the Edit tab
  const renderEditTab = () => (
    <div className="space-y-6">
      {editTabImage && (
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-64 h-64 border rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            {editLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : editTabPreviewUrl ? (
              <img
                src={editTabPreviewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={editTabImage}
                alt="Original"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
      {/* Sliders for adjustments */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Brightness
          </label>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Contrast
          </label>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Saturation
          </label>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Exposure
          </label>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={exposure}
            onChange={(e) => setExposure(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sharpness
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sharpness}
            onChange={(e) => setSharpness(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Noise
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={noise}
            onChange={(e) => setNoise(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            White Balance
          </label>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={whiteBalance}
            onChange={(e) => setWhiteBalance(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Filter
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border rounded px-2 py-1 text-xs"
          >
            <option value="none">None</option>
            <option value="grayscale">Grayscale</option>
            <option value="sepia">Sepia</option>
            <option value="invert">Invert</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleSaveEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium"
        >
          Save
        </button>
        <button
          onClick={() => setEditTabImage(selectedObject?.imageUrl || null)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium"
        >
          Cancel
        </button>
      </div>
      {editError && (
        <div className="text-xs text-red-500 mt-2">{editError}</div>
      )}
    </div>
  );

  // Helper to get the current image URL
  const getImageUrl = () => {
    if (selectedObject && selectedObject.type === "image") {
      const url = selectedObject.imageUrl || "";
      // console.log("Current selected image URL:", url); // Commented out to reduce console spam
      return url;
    }
    return "";
  };

  // Force re-render when selectedObject changes (especially when image URL changes)
  useEffect(() => {
    // This will trigger a re-render when the selectedObject changes
    // This is important when an image is replaced and we need to use the new URL
    console.log("Selected object image URL changed:", selectedObject?.imageUrl);
  }, [selectedObject?.imageUrl]);

  return (
    <div className="w-full bg-white flex flex-col h-full">
      <style dangerouslySetInnerHTML={{ __html: loadingStyles }} />
      <Tabs
        value={aiTab}
        onValueChange={setAiTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="flex gap-2 p-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="ai">AI Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="flex-1 overflow-y-auto p-4">
          {renderEditTab()}
        </TabsContent>
        <TabsContent value="ai" className="flex-1 overflow-y-auto  space-y-4">
          {/* Demo Mode Notice */}
          {demoNotice && imagekitService.isDemoMode() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-600 text-xs font-bold">!</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-yellow-800 mb-1">
                    Demo Mode Active
                  </h4>
                  <p className="text-xs text-yellow-700 mb-2">
                    AI transformations are in demo mode. For production use,
                    implement server-side ImageKit signature generation.
                  </p>
                  <button
                    onClick={() => setDemoNotice(false)}
                    className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Tools UI */}
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                {hasSelectedImage
                  ? "Selected Image for AI Processing"
                  : "Upload Image for AI Processing"}
              </h4>
              <p className="text-xs text-blue-600 mb-3">
                {hasSelectedImage
                  ? "The selected image will be used for AI transformations. Upload a different image below if needed."
                  : "Upload an image to apply AI transformations. Supported formats: JPG, PNG, GIF"}
              </p>

              {/* Show selected image info */}
              {hasSelectedImage && (
                <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-800">
                        Using selected image
                      </p>
                      <p
                        className="text-xs text-green-600 truncate max-w-[200px]"
                        key={getImageUrl()}
                      >
                        {getImageUrl()}
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        Click any AI transformation to process this image
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 hover:border-blue-400 transition-colors bg-white">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log(
                        "File selected for AI processing:",
                        file.name
                      );
                      setUploadedFile(file);
                    }
                  }}
                  className="hidden"
                  id="ai-image-upload"
                />
                <label
                  htmlFor="ai-image-upload"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {uploadedFile ? (
                    <>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-xs text-green-700 font-medium text-center">
                        {uploadedFile.name}
                      </span>
                      <span className="text-xs text-green-500">
                        Ready for AI processing
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-xs text-blue-700 font-medium text-center">
                        {hasSelectedImage
                          ? "Upload different image"
                          : "Click to upload or drag and drop"}
                      </span>
                      <span className="text-xs text-blue-500">
                        Max file size: 10MB
                      </span>
                    </>
                  )}
                </label>
                {uploadedFile && (
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove file
                  </button>
                )}
              </div>
            </div>

            {/* AI Transformations Grid */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Transformations
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {/* Background Removal */}
                <button
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  onClick={() => handleAIPreview("remove-bg-dotbg", "")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      <Eraser className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Remove Background
                    </span>
                  </div>
                  <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-300"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Clean background removal
                  </p>
                </button>

                {/* Drop Shadow */}
                <button
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  onClick={() => handleAIPreview("drop-shadow", "")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sun className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Drop Shadow
                    </span>
                  </div>
                  <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center relative">
                    <div className="w-8 h-8 bg-white rounded shadow-lg"></div>
                    <div className="absolute bottom-1 left-1 w-8 h-8 bg-gray-400 rounded opacity-50"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Add realistic shadows
                  </p>
                </button>

                {/* Upscale */}
                <button
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  onClick={() => handleAIPreview("upscale", "")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                      <ArrowUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Upscale
                    </span>
                  </div>
                  <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <ArrowUp className="w-3 h-3 text-gray-500 mx-1" />
                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enhance image quality
                  </p>
                </button>

                {/* Smart Crop */}
                <button
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  onClick={() => handleAIPreview("smart-crop", "")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                      <Crop className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Smart Crop
                    </span>
                  </div>
                  <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                    <div className="w-10 h-8 bg-blue-500 rounded border-2 border-white"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Intelligent cropping
                  </p>
                </button>

                {/* Face Crop */}
                <button
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  onClick={() => handleAIPreview("face-crop", "")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Smile className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Face Crop
                    </span>
                  </div>
                  <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full relative">
                      <div className="absolute top-2 left-2 w-1 h-1 bg-black rounded-full"></div>
                      <div className="absolute top-2 right-2 w-1 h-1 bg-black rounded-full"></div>
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Focus on faces</p>
                </button>
              </div>
            </div>

            {/* Advanced AI Tools */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Advanced AI Tools
              </h4>

              {/* Change Background */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
                    <ImageIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Change Background
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={aiBgPrompt}
                    onChange={(e) => setAiBgPrompt(e.target.value)}
                    placeholder="Describe new background..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    onClick={() => handleAIPreview("change-bg", aiBgPrompt)}
                  >
                    <ImageIcon className="w-3 h-3" />
                    Apply
                  </button>
                </div>
              </div>

              {/* Edit Image */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center">
                    <Wand2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Edit Image
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={aiEditPrompt}
                    onChange={(e) => setAiEditPrompt(e.target.value)}
                    placeholder="Describe your edit..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    className="w-full px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-1"
                    onClick={() => handleAIPreview("edit-image", aiEditPrompt)}
                  >
                    <Wand2 className="w-3 h-3" />
                    Apply
                  </button>
                </div>
              </div>

              {/* Generate from Text */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex items-center justify-center">
                    <TextIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Generate from Text
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={aiGenTextPrompt}
                    onChange={(e) => setAiGenTextPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    className="w-full px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                    onClick={async () => {
                      setAiLoading(true);
                      try {
                        const url =
                          imagekitService.generateImageFromText(
                            aiGenTextPrompt
                          );
                        setAiPreviewUrl(url);
                      } catch (error) {
                        console.error(
                          "Error generating image from text:",
                          error
                        );
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                  >
                    <TextIcon className="w-3 h-3" />
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {aiPreviewUrl && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </h4>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => {
                      setAiPreviewUrl(null);
                      setGenerationFailed(false);
                    }}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="relative w-full aspect-square bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden">
                  {aiLoading ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                      {/* Animated background particles */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
                        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-40 animate-delay-1000"></div>
                        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50 animate-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/2 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse opacity-30 animate-delay-1500"></div>
                      </div>

                      {/* Main loading content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        {/* Central animated circle */}
                        <div className="relative mb-6">
                          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
                          <div
                            className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"
                            style={{ animationDuration: "1.5s" }}
                          ></div>
                          <div
                            className="w-20 h-20 border-4 border-purple-500 border-r-transparent rounded-full animate-spin absolute inset-0"
                            style={{ animationDuration: "2s" }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white animate-pulse" />
                            </div>
                          </div>
                        </div>

                        {/* Text content with typing animation */}
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            AI Magic in Progress
                          </h3>
                          <p className="text-sm text-gray-600 animate-pulse">
                            Creating something amazing...
                          </p>
                        </div>

                        {/* Progress dots */}
                        <div className="flex space-x-2 mt-6">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>

                      {/* Blur overlay for depth */}
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                    </div>
                  ) : (
                    <>
                      <Image
                        src={aiPreviewUrl}
                        alt="AI Preview"
                        fill
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                          // Set state to indicate generation failed
                          setGenerationFailed(true);
                        }}
                      />
                      <div className="hidden flex flex-col items-center gap-2 text-center p-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                          <X className="w-6 h-6 text-red-500" />
                        </div>
                        <span className="text-red-500 font-medium">
                          Generation Failed
                        </span>
                        <span className="text-sm text-gray-500">
                          AI could not process this request. Please try again
                          with different parameters.
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {hasSelectedImage ? (
                    <>
                      <button
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAIApply}
                        disabled={generationFailed}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Replace Current Image
                      </button>
                      <button
                        className="w-full px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          editorState.addImage(aiPreviewUrl!);
                          setAiPreviewUrl(null);
                          setGenerationFailed(false);
                        }}
                        disabled={generationFailed}
                      >
                        <Plus className="w-4 h-4" />
                        Add as New Image
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleAIApply}
                      disabled={generationFailed}
                    >
                      <Plus className="w-4 h-4" />
                      Add to Canvas
                    </button>
                  )}
                  <button
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setAiPreviewUrl(null);
                      setGenerationFailed(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
