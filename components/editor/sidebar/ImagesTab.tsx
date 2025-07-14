"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
  Upload,
  Plus,
  Search,
  Loader2,
  X,
  Image as ImageIcon,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { unsplashAPI, UnsplashImage } from "@/lib/unsplash-api";
import { imagekitService } from "@/lib/imagekit-service";
import Image from "next/image";

interface ImagesTabProps {
  onImageUpload: (file: File) => void;
  onStockImageSelect: (imageUrl: string) => void;
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

const ImagesTab = memo(function ImagesTab({
  onImageUpload,
  onStockImageSelect,
}: ImagesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Uploaded images state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadedImagesLoading, setUploadedImagesLoading] = useState(false);
  const [uploadedImagesError, setUploadedImagesError] = useState<string | null>(
    null
  );
  const [uploadedImagesPage, setUploadedImagesPage] = useState(1);
  const [uploadedImagesHasMore, setUploadedImagesHasMore] = useState(false);

  // Accordion state
  const [activeSection, setActiveSection] = useState<
    "uploaded" | "search" | null
  >("uploaded");

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Load uploaded images on component mount
  useEffect(() => {
    loadUploadedImages(1);
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search effect
  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery, 1);
    } else {
      setSearchResults([]);
      setCurrentPage(1);
      setHasMore(false);
    }
  }, [debouncedQuery]);

  const loadUploadedImages = useCallback(
    async (page: number = 1, append: boolean = false) => {
      setUploadedImagesLoading(true);
      setUploadedImagesError(null);
      try {
        const images = await imagekitService.listUploadedImages({
          limit: 50, // Increased limit to get more images
          page,
        });

        if (append) {
          setUploadedImages((prev) => [...prev, ...images]);
        } else {
          setUploadedImages(images);
        }

        // Assume there are more if we got the full limit
        setUploadedImagesHasMore(images.length === 50);
        setUploadedImagesPage(page);
      } catch (error) {
        console.error("Error loading uploaded images:", error);
        setUploadedImagesError("Failed to load uploaded images");
      } finally {
        setUploadedImagesLoading(false);
      }
    },
    []
  );

  const handleLoadMoreUploadedImages = useCallback(() => {
    if (!uploadedImagesLoading && uploadedImagesHasMore) {
      loadUploadedImages(uploadedImagesPage + 1, true);
    }
  }, [
    uploadedImagesLoading,
    uploadedImagesHasMore,
    uploadedImagesPage,
    loadUploadedImages,
  ]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Optimistically add a placeholder image
        const optimisticId = `optimistic-${Date.now()}`;
        setUploadedImages((prev) => [
          {
            id: optimisticId,
            name: file.name,
            url: URL.createObjectURL(file),
            thumbnailUrl: URL.createObjectURL(file),
            size: file.size,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: "image",
            path: "/wedding-editor/",
          },
          ...prev,
        ]);
        onImageUpload(file);
        // Wait for backend to index, then refetch from first page
        setTimeout(() => {
          loadUploadedImages(1, false);
        }, 1500);
      }
    },
    [onImageUpload, loadUploadedImages]
  );

  const handleUploadedImageSelect = useCallback(
    (image: UploadedImage) => {
      console.log("Selected uploaded image:", image.url);
      onStockImageSelect(image.url);
    },
    [onStockImageSelect]
  );

  const handleSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await unsplashAPI.searchImages(query, page, 20);

      if (page === 1) {
        setSearchResults(response.results);
      } else {
        setSearchResults((prev) => [...prev, ...response.results]);
      }
      setHasMore(page < response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error searching images:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      handleSearch(debouncedQuery, currentPage + 1);
    }
  }, [isLoading, hasMore, debouncedQuery, currentPage, handleSearch]);

  const handleImageSelect = useCallback(
    (image: UnsplashImage) => {
      // Use the small size URL for better canvas display
      const selectedUrl = image.urls.small;
      console.log("Selected image URL for canvas:", selectedUrl);
      onStockImageSelect(selectedUrl);
    },
    [onStockImageSelect]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setCurrentPage(1);
    setHasMore(false);
  }, []);

  const toggleSection = useCallback((section: "uploaded" | "search") => {
    setActiveSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <div className="p-2 lg:p-4 space-y-3 lg:space-y-4 h-full flex flex-col min-h-0">
      {/* Upload Section */}
      <div className="space-y-2 lg:space-y-3 flex-shrink-0">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Upload Image
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 lg:p-4 hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
            <span className="text-xs lg:text-sm text-gray-600 text-center">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </span>
          </label>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 flex flex-col min-h-0 space-y-2">
        {/* Uploaded Images Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("uploaded")}
            className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-medium text-gray-700 transition-colors"
          >
            <span>Uploaded Images</span>
            {activeSection === "uploaded" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {activeSection === "uploaded" && (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {uploadedImages.length} images
                </span>
                <button
                  onClick={() => loadUploadedImages(1, false)}
                  disabled={uploadedImagesLoading}
                  className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                  title="Refresh uploaded images"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-gray-500 ${
                      uploadedImagesLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              {uploadedImagesLoading && uploadedImages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">
                    Loading uploaded images...
                  </span>
                </div>
              ) : uploadedImagesError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-500 mb-2">
                    {uploadedImagesError}
                  </p>
                  <button
                    onClick={() => loadUploadedImages(1, false)}
                    className="text-xs text-blue-500 hover:text-blue-600 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : uploadedImages.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {uploadedImages.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => handleUploadedImageSelect(image)}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-200 bg-gray-100"
                      >
                        <Image
                          src={image.thumbnailUrl || image.url}
                          alt={image.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            console.error(
                              "Failed to load uploaded image:",
                              image.url
                            );
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const button = target.closest("button");
                            if (button) {
                              button.style.backgroundColor = "#f3f4f6";
                              button.style.borderColor = "#d1d5db";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <p className="text-xs text-white truncate">
                            {image.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {uploadedImagesHasMore && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleLoadMoreUploadedImages}
                        disabled={uploadedImagesLoading}
                        className="text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        {uploadedImagesLoading
                          ? "Loading..."
                          : "Load More Images"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No uploaded images yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Upload an image to see it here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Images Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("search")}
            className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-medium text-gray-700 transition-colors"
          >
            <span>Search Images</span>
            {activeSection === "search" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {activeSection === "search" && (
            <div className="p-3 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {searchResults.length} results
                    </span>
                    {hasMore && (
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50"
                      >
                        {isLoading ? "Loading..." : "Load More"}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {searchResults.map((image, index) => (
                      <button
                        key={`${image.id}-${index}-${image.urls.regular}`}
                        onClick={() => handleImageSelect(image)}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-200 bg-gray-100"
                      >
                        <Image
                          src={image.urls.regular}
                          alt={image.alt_description || image.description}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            console.error(
                              "Failed to load image in sidebar:",
                              image.urls.regular
                            );
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            // Add a fallback background
                            const button = target.closest("button");
                            if (button) {
                              button.style.backgroundColor = "#f3f4f6";
                              button.style.borderColor = "#d1d5db";
                            }
                          }}
                          onLoad={(e) => {
                            console.log(
                              "Image loaded successfully in sidebar:",
                              image.urls.regular
                            );
                            // Remove loading background
                            const button = (
                              e.target as HTMLImageElement
                            ).closest("button");
                            if (button) {
                              button.style.backgroundColor = "";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <p className="text-xs text-white truncate">
                            by {image.user.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isLoading && searchResults.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">
                    Searching...
                  </span>
                </div>
              )}

              {/* No results */}
              {!isLoading && debouncedQuery && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No images found for &quot;{debouncedQuery}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ImagesTab;
