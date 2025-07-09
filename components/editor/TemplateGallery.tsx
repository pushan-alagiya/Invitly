"use client";

import { useState } from "react";
import { Grid, Download, Heart, Star, Clock, Palette } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  preview: string;
  tags: string[];
  isPremium: boolean;
  isNew: boolean;
}

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
  onLoadTemplate: (templateId: string) => void;
}

export default function TemplateGallery({
  onSelectTemplate,
  onLoadTemplate,
}: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Templates", count: 24 },
    { id: "classic", name: "Classic", count: 8 },
    { id: "modern", name: "Modern", count: 6 },
    { id: "vintage", name: "Vintage", count: 5 },
    { id: "minimal", name: "Minimal", count: 3 },
    { id: "elegant", name: "Elegant", count: 2 },
  ];

  const templates: Template[] = [
    {
      id: "classic-1",
      name: "Classic Wedding Invitation",
      category: "classic",
      width: 800,
      height: 1000,
      preview: "/templates/classic-1.png",
      tags: ["traditional", "elegant", "gold"],
      isPremium: false,
      isNew: false,
    },
    {
      id: "modern-1",
      name: "Modern Minimal Design",
      category: "modern",
      width: 1000,
      height: 1000,
      preview: "/templates/modern-1.png",
      tags: ["clean", "simple", "contemporary"],
      isPremium: true,
      isNew: true,
    },
    {
      id: "vintage-1",
      name: "Vintage Romance",
      category: "vintage",
      width: 800,
      height: 1000,
      preview: "/templates/vintage-1.png",
      tags: ["romantic", "antique", "floral"],
      isPremium: false,
      isNew: false,
    },
    {
      id: "elegant-1",
      name: "Elegant Gold Design",
      category: "elegant",
      width: 800,
      height: 1000,
      preview: "/templates/elegant-1.png",
      tags: ["luxury", "gold", "sophisticated"],
      isPremium: true,
      isNew: false,
    },
    {
      id: "minimal-1",
      name: "Clean Minimalist",
      category: "minimal",
      width: 600,
      height: 1200,
      preview: "/templates/minimal-1.png",
      tags: ["simple", "clean", "typography"],
      isPremium: false,
      isNew: true,
    },
    {
      id: "classic-2",
      name: "Traditional Elegance",
      category: "classic",
      width: 800,
      height: 1000,
      preview: "/templates/classic-2.png",
      tags: ["traditional", "formal", "serif"],
      isPremium: false,
      isNew: false,
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">
            Templates ({filteredTemplates.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors cursor-pointer group"
              onClick={() => onSelectTemplate(template)}
            >
              {/* Template Preview */}
              <div className="relative">
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-500">{template.name}</span>
                </div>

                {/* Template Badges */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  {template.isNew && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      New
                    </span>
                  )}
                  {template.isPremium && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      Premium
                    </span>
                  )}
                </div>

                {/* Template Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadTemplate(template.id);
                      }}
                      className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                      title="Use Template"
                    >
                      <Download className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites
                        console.log("Add to favorites:", template.id);
                      }}
                      className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                      title="Add to Favorites"
                    >
                      <Heart className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-800 mb-1">
                  {template.name}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {template.width} × {template.height}
                </p>

                {/* Template Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{template.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-medium text-gray-700 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              // Create custom template
              console.log("Create custom template");
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Palette className="w-4 h-4 mx-auto mb-1" />
            Create Custom
          </button>
          <button
            onClick={() => {
              // Import template
              console.log("Import template");
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mx-auto mb-1" />
            Import Template
          </button>
        </div>
      </div>
    </div>
  );
}
