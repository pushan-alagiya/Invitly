"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  RotateCw,
  RotateCcw,
  Crop,
  Filter,
  Palette,
  Download,
} from "lucide-react";

interface ImageEditorProps {
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedObject: fabric.FabricImage | null;
  onStyleChange: (property: string, value: unknown) => void;
}

export default function ImageEditor({
  onUploadImage,
  selectedObject,
  onStyleChange,
}: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const stockImages = [
    {
      name: "Wedding Flowers",
      url: "/images/stock/flowers.jpg",
      category: "nature",
    },
    {
      name: "Wedding Rings",
      url: "/images/stock/rings.jpg",
      category: "jewelry",
    },
    { name: "Wedding Cake", url: "/images/stock/cake.jpg", category: "food" },
    {
      name: "Wedding Venue",
      url: "/images/stock/venue.jpg",
      category: "venue",
    },
    {
      name: "Wedding Couple",
      url: "/images/stock/couple.jpg",
      category: "people",
    },
    {
      name: "Wedding Decoration",
      url: "/images/stock/decoration.jpg",
      category: "decoration",
    },
  ];

  const addImageFromUrl = () => {
    if (imageUrl) {
      // This would add image from URL
      console.log(`Adding image from URL: ${imageUrl}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Image */}
      <div>
        <h3 className="font-medium text-gray-700 mb-3">Upload Image</h3>
        <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-300 transition-colors">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <span className="text-sm text-gray-600">Click to upload image</span>
          <input
            type="file"
            accept="image/*"
            onChange={onUploadImage}
            className="hidden"
          />
        </label>
      </div>

      {/* Add from URL */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Add from URL</h3>
        <div className="flex space-x-2">
          <input
            type="url"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={addImageFromUrl}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Stock Images */}
      <div>
        <h3 className="font-medium text-gray-700 mb-3">Stock Images</h3>
        <div className="grid grid-cols-2 gap-2">
          {stockImages.map((image, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-xs text-center">{image.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Image Styling - Only show when image is selected */}
      {selectedObject && selectedObject.type === "image" && (
        <>
          {/* Image Actions */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Image Actions</h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() =>
                  onStyleChange(
                    "angle",
                    ((selectedObject as any).angle || 0) + 90
                  )
                }
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Rotate Right"
              >
                <RotateCw className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() =>
                  onStyleChange(
                    "angle",
                    ((selectedObject as any).angle || 0) - 90
                  )
                }
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Rotate Left"
              >
                <RotateCcw className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => {
                  // This would implement crop functionality
                  console.log("Crop image");
                }}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Crop"
              >
                <Crop className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => {
                  // This would implement filter functionality
                  console.log("Apply filter");
                }}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Filters"
              >
                <Filter className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Image Adjustments */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Adjustments</h3>
            <div className="space-y-3">
              {/* Brightness */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Brightness
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setBrightness(value);
                    onStyleChange("brightness", value / 100);
                  }}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {brightness}%
                </div>
              </div>

              {/* Contrast */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Contrast
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setContrast(value);
                    onStyleChange("contrast", value / 100);
                  }}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {contrast}%
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={
                    (selectedObject as any).opacity
                      ? (selectedObject as any).opacity * 100
                      : 100
                  }
                  onChange={(e) => {
                    const value = Number(e.target.value) / 100;
                    onStyleChange("opacity", value);
                  }}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {Math.round(((selectedObject as any).opacity || 1) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Image Filters */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Quick Filters</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "None", filter: "none" },
                { name: "Grayscale", filter: "grayscale" },
                { name: "Sepia", filter: "sepia" },
                { name: "Blur", filter: "blur" },
                { name: "Invert", filter: "invert" },
                { name: "Vintage", filter: "vintage" },
              ].map((filter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // This would apply the filter
                    console.log(`Applying filter: ${filter.name}`);
                  }}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>

          {/* Image Borders */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Border</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value="#000000"
                  onChange={(e) => onStyleChange("stroke", e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={(selectedObject as any).strokeWidth || 0}
                  onChange={(e) =>
                    onStyleChange("strokeWidth", Number(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 min-w-[2rem]">
                  {(selectedObject as any).strokeWidth || 0}px
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
