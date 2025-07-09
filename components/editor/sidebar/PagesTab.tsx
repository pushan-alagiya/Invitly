"use client";

import { Copy, Trash2, Plus, FileText, Eye, Settings } from "lucide-react";
import { EditorPage } from "@/lib/editor-state";

interface PagesTabProps {
  pages: EditorPage[];
  selectedPageId: string | null;
  onPageSelect: (pageId: string) => void;
  onPageDuplicate: (pageId: string) => void;
  onPageDelete: (pageId: string) => void;
  onPageAdd: () => void;
}

export default function PagesTab({
  pages,
  selectedPageId,
  onPageSelect,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
}: PagesTabProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Page List */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Pages ({pages.length})
        </h3>

        <div className="space-y-3">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer group ${
                selectedPageId === page.id
                  ? "border-blue-400 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => onPageSelect(page.id)}
            >
              {/* Page Number Badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-800">
                      {page.name}
                    </span>
                    {selectedPageId === page.id && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Size: {page.width} × {page.height}
                    </div>
                    <div>Objects: {page.objects.length}</div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded border border-gray-300"
                        style={{ backgroundColor: page.backgroundColor }}
                      />
                      Background: {page.backgroundColor}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageSelect(page.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View Page"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageDuplicate(page.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageDelete(page.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Page"
                    disabled={pages.length === 1}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Page Preview */}
              <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Preview:</div>
                <div
                  className="w-full h-12 rounded border border-gray-300 relative overflow-hidden"
                  style={{ backgroundColor: page.backgroundColor }}
                >
                  {page.objects.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs text-gray-400">
                        {page.objects.length} object
                        {page.objects.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Page Button */}
      <div>
        <button
          onClick={onPageAdd}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
            Add New Page
          </span>
        </button>
      </div>

      {/* Page Management Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Page Management
        </h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Click on a page to select it for editing</p>
          <p>• Each page can have different content and background</p>
          <p>• Use duplicate to create variations of your design</p>
          <p>• At least one page must remain in the project</p>
        </div>
      </div>

      {/* Quick Actions */}
      {pages.length > 1 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const currentIndex = pages.findIndex(
                  (p) => p.id === selectedPageId
                );
                const nextIndex = (currentIndex + 1) % pages.length;
                onPageSelect(pages[nextIndex].id);
              }}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
            >
              Next Page
            </button>
            <button
              onClick={() => {
                const currentIndex = pages.findIndex(
                  (p) => p.id === selectedPageId
                );
                const prevIndex =
                  currentIndex === 0 ? pages.length - 1 : currentIndex - 1;
                onPageSelect(pages[prevIndex].id);
              }}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
            >
              Previous Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
