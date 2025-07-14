"use client";

import { memo, useState, useCallback, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Upload,
  Search,
  Palette,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { imagekitService } from "@/lib/imagekit-service";
import { unsplashAPI, UnsplashImage } from "@/lib/unsplash-api";

interface BackgroundsTabProps {
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
}

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  path: string;
}

const BackgroundsTab = memo(function BackgroundsTab({
  backgroundColor,
  onBackgroundColorChange,
}: BackgroundsTabProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["colors"])
  );
  const [gradientType, setGradientType] = useState<"linear" | "radial">(
    "linear"
  );
  const [gradientDirection, setGradientDirection] = useState<
    "135deg" | "45deg" | "90deg" | "180deg"
  >("135deg");
  const [color1, setColor1] = useState("#EC4899");
  const [color2, setColor2] = useState("#8B5CF6");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [searchResults, setSearchResults] = useState<UnsplashImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");

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

  // Load uploaded images on mount
  useEffect(() => {
    loadUploadedImages();
  }, []);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search effect
  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearchImages(debouncedQuery, 1);
    } else {
      setSearchResults([]);
      setCurrentPage(1);
      setHasMoreImages(false);
    }
  }, [debouncedQuery]);

  // Load uploaded images
  const loadUploadedImages = useCallback(async () => {
    try {
      setIsLoadingImages(true);
      const images = await imagekitService.listUploadedImages({
        limit: 20,
        page: 1,
      });
      setUploadedImages(images);
    } catch (error) {
      console.error("Error loading uploaded images:", error);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  // Refresh uploaded images
  const refreshUploadedImages = useCallback(async () => {
    await loadUploadedImages();
  }, [loadUploadedImages]);

  // Toggle accordion sections
  const toggleSection = useCallback((section: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  // Generate gradient from selected colors
  const generateGradient = useCallback(() => {
    if (gradientType === "linear") {
      return `linear-gradient(${gradientDirection}, ${color1}, ${color2})`;
    } else {
      return `radial-gradient(circle at center, ${color1}, ${color2})`;
    }
  }, [gradientType, gradientDirection, color1, color2]);

  // Apply gradient
  const applyGradient = useCallback(() => {
    const gradient = generateGradient();
    onBackgroundColorChange(gradient);
  }, [generateGradient, onBackgroundColorChange]);

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        setIsLoadingImages(true);
        const imageKitUrl = await imagekitService.uploadImage(file);

        // Add to uploaded images
        const newImage: UploadedImage = {
          id: `uploaded-${Date.now()}`,
          name: file.name,
          url: imageKitUrl,
          thumbnailUrl: imageKitUrl,
          size: file.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: "image",
          path: "/wedding-editor/",
        };

        setUploadedImages((prev) => [newImage, ...prev]);

        // Apply as background using CSS background-image
        onBackgroundColorChange(`url(${imageKitUrl})`);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsLoadingImages(false);
      }
    },
    [onBackgroundColorChange]
  );

  // Search images using Unsplash API
  const handleSearchImages = useCallback(
    async (query: string, page: number = 1) => {
      if (!query.trim()) return;

      try {
        setIsLoadingImages(true);
        const response = await unsplashAPI.searchImages(query, page, 20);

        if (page === 1) {
          setSearchResults(response.results);
        } else {
          setSearchResults((prev) => [...prev, ...response.results]);
        }
        setHasMoreImages(page < response.total_pages);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error searching images:", error);
        setSearchResults([]);
      } finally {
        setIsLoadingImages(false);
      }
    },
    []
  );

  // Load more images
  const loadMoreImages = useCallback(async () => {
    if (!isLoadingImages && hasMoreImages && debouncedQuery.trim()) {
      handleSearchImages(debouncedQuery, currentPage + 1);
    }
  }, [
    isLoadingImages,
    hasMoreImages,
    debouncedQuery,
    currentPage,
    handleSearchImages,
  ]);

  // Apply image as background
  const applyImageBackground = useCallback(
    (imageUrl: string) => {
      // Use CSS background-image format for image backgrounds
      onBackgroundColorChange(`url(${imageUrl})`);
    },
    [onBackgroundColorChange]
  );

  return (
    <div className="p-2 lg:p-4 space-y-3">
      {/* Colors Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection("colors")}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Solid Colors</span>
          </div>
          {openSections.has("colors") ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {openSections.has("colors") && (
          <div className="p-3 border-t border-gray-200 space-y-3">
            {/* Color Picker */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">
                Background Color
              </h4>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={
                    backgroundColor.startsWith("#")
                      ? backgroundColor
                      : "#ffffff"
                  }
                  onChange={(e) => onBackgroundColorChange(e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={
                    backgroundColor.startsWith("#")
                      ? backgroundColor
                      : "#ffffff"
                  }
                  onChange={(e) => onBackgroundColorChange(e.target.value)}
                  className="flex-1 p-1 border border-gray-300 rounded text-xs"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Preset Colors */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">
                Preset Colors
              </h4>
              <div className="grid grid-cols-6 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onBackgroundColorChange(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:border-blue-400 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gradients Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection("gradients")}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded" />
            <span className="font-medium text-sm">Custom Gradients</span>
          </div>
          {openSections.has("gradients") ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {openSections.has("gradients") && (
          <div className="p-3 border-t border-gray-200 space-y-3">
            {/* Gradient Type */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">
                Gradient Type
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setGradientType("linear")}
                  className={`px-3 py-1 text-xs rounded border ${
                    gradientType === "linear"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Linear
                </button>
                <button
                  onClick={() => setGradientType("radial")}
                  className={`px-3 py-1 text-xs rounded border ${
                    gradientType === "radial"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Gradient Direction (for linear) */}
            {gradientType === "linear" && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700">Direction</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "135deg", label: "Diagonal" },
                    { value: "45deg", label: "Diagonal 2" },
                    { value: "90deg", label: "Vertical" },
                    { value: "180deg", label: "Horizontal" },
                  ].map((dir) => (
                    <button
                      key={dir.value}
                      onClick={() =>
                        setGradientDirection(
                          dir.value as "135deg" | "45deg" | "90deg" | "180deg"
                        )
                      }
                      className={`px-2 py-1 text-xs rounded border ${
                        gradientDirection === dir.value
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">Colors</h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Color 1
                  </label>
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Color 2
                  </label>
                  <input
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">Preview</h4>
              <div
                className="h-12 rounded border border-gray-300"
                style={{ background: generateGradient() }}
              />
            </div>

            {/* Apply Button */}
            <Button
              onClick={applyGradient}
              className="w-full text-xs"
              size="sm"
            >
              Apply Gradient
            </Button>
          </div>
        )}
      </div>

      {/* Image Backgrounds Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection("images")}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm">Image Backgrounds</span>
          </div>
          {openSections.has("images") ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {openSections.has("images") && (
          <div className="p-3 border-t border-gray-200 space-y-3">
            {/* Uploaded Images Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("uploaded-images")}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-xs">Uploaded Images</span>
                </div>
                {openSections.has("uploaded-images") ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
              </button>

              {openSections.has("uploaded-images") && (
                <div className="p-2 border-t border-gray-200 space-y-2">
                  {/* Upload Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-700">
                      Upload New Image
                    </h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="uploaded-images-upload"
                      />
                      <label
                        htmlFor="uploaded-images-upload"
                        className="flex flex-col items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          Click to upload image
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Uploaded Images List */}
                  {isLoadingImages ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-700">
                          Your Images
                        </h4>
                        <Button
                          onClick={refreshUploadedImages}
                          disabled={isLoadingImages}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                        >
                          Refresh
                        </Button>
                      </div>
                      <div className="text-center py-4">
                        <div className="text-xs text-gray-500">
                          Loading images...
                        </div>
                      </div>
                    </div>
                  ) : uploadedImages.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-700">
                          Your Images
                        </h4>
                        <Button
                          onClick={refreshUploadedImages}
                          disabled={isLoadingImages}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                        >
                          Refresh
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                        {uploadedImages.map((image) => (
                          <button
                            key={image.id}
                            onClick={() => applyImageBackground(image.url)}
                            className="aspect-square rounded border border-gray-200 hover:border-blue-400 transition-colors overflow-hidden"
                          >
                            <img
                              src={image.thumbnailUrl || image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to main URL if thumbnail fails
                                const target = e.target as HTMLImageElement;
                                if (target.src !== image.url) {
                                  target.src = image.url;
                                }
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-700">
                          Your Images
                        </h4>
                        <Button
                          onClick={refreshUploadedImages}
                          disabled={isLoadingImages}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                        >
                          Refresh
                        </Button>
                      </div>
                      <div className="text-center py-4">
                        <div className="text-xs text-gray-500">
                          No images uploaded yet
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Images Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("search-images")}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-xs">Search Images</span>
                </div>
                {openSections.has("search-images") ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
              </button>

              {openSections.has("search-images") && (
                <div className="p-2 border-t border-gray-200 space-y-2">
                  {/* Search Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-700">
                      Search Images
                    </h4>
                    <div className="flex gap-1">
                      <Input
                        type="text"
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearchImages(searchQuery, 1);
                          }
                        }}
                        className="flex-1 text-xs"
                      />
                      <Button
                        onClick={() => handleSearchImages(searchQuery, 1)}
                        disabled={!searchQuery.trim() || isLoadingImages}
                        size="sm"
                        className="text-xs"
                        type="button"
                      >
                        {isLoadingImages ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Search className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700">
                        Search Results ({searchResults.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto">
                        {searchResults.map((image) => (
                          <button
                            key={image.id}
                            onClick={() =>
                              applyImageBackground(image.urls.regular)
                            }
                            className="aspect-square rounded border border-gray-200 hover:border-blue-400 transition-colors overflow-hidden"
                          >
                            <img
                              src={image.urls.small}
                              alt={image.alt_description || image.user.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      {hasMoreImages && (
                        <Button
                          onClick={loadMoreImages}
                          disabled={isLoadingImages}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                        >
                          Load More
                        </Button>
                      )}
                    </div>
                  ) : searchQuery.trim() && !isLoadingImages ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700">
                        Search Results
                      </h4>
                      <div className="text-center py-4">
                        <div className="text-xs text-gray-500">
                          No images found for &quot;{searchQuery}&quot;
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default BackgroundsTab;
