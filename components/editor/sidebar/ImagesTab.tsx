"use client";

import { Upload, Plus } from "lucide-react";

interface ImagesTabProps {
  onImageUpload: (file: File) => void;
  onStockImageSelect: (imageUrl: string) => void;
}

export default function ImagesTab({
  onImageUpload,
  onStockImageSelect,
}: ImagesTabProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const stockImages = [
    {
      id: "floral-1",
      name: "Floral Pattern 1",
      url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop&crop=center",
      category: "floral",
    },
    {
      id: "floral-2",
      name: "Floral Pattern 2",
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop&crop=center",
      category: "floral",
    },
    {
      id: "geometric-1",
      name: "Geometric 1",
      url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop&crop=center",
      category: "geometric",
    },
    {
      id: "geometric-2",
      name: "Geometric 2",
      url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=200&fit=crop&crop=center",
      category: "geometric",
    },
  ];

  const weddingImages = [
    {
      id: "wedding-1",
      name: "Wedding Rings",
      url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: "wedding-2",
      name: "Wedding Flowers",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: "wedding-3",
      name: "Wedding Cake",
      url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: "wedding-4",
      name: "Wedding Couple",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop&crop=center",
    },
  ];

  return (
    <div className="p-2 lg:p-4 space-y-3 lg:space-y-4">
      {/* Upload Section */}
      <div className="space-y-2 lg:space-y-3">
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

      {/* Stock Images */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Stock Images
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
          {stockImages.map((image) => (
            <button
              key={image.id}
              onClick={() => onStockImageSelect(image.url)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-200"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Wedding Images */}
      <div className="space-y-2 lg:space-y-3">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Wedding Images
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
          {weddingImages.map((image) => (
            <button
              key={image.id}
              onClick={() => onStockImageSelect(image.url)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-200"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add */}
      <div className="space-y-2 lg:space-y-3 pt-2 lg:pt-4 border-t border-gray-200">
        <h3 className="text-sm lg:text-base font-semibold text-gray-700">
          Quick Add
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <button
            onClick={() =>
              onStockImageSelect(
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=400"
              )
            }
            className="p-2 lg:p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg border border-pink-200 hover:border-pink-300 transition-colors text-xs lg:text-sm font-medium text-pink-700"
          >
            Floral Pattern
          </button>
          <button
            onClick={() =>
              onStockImageSelect(
                "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400"
              )
            }
            className="p-2 lg:p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors text-xs lg:text-sm font-medium text-blue-700"
          >
            Geometric
          </button>
        </div>
      </div>
    </div>
  );
}
