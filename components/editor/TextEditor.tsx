"use client";

import { useState } from "react";
import { Type } from "lucide-react";
import * as fabric from "fabric";

interface TextEditorProps {
  onAddText: (text: string, options: Record<string, unknown>) => void;
  selectedObject: fabric.Object | null;
  onUpdateText: (options: Record<string, unknown>) => void;
}

const fonts = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Playfair Display",
  "Dancing Script",
  "Great Vibes",
  "Pacifico",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
];

export default function TextEditor({
  onAddText,
  selectedObject,
  onUpdateText,
}: TextEditorProps) {
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textInput, setTextInput] = useState("New Text");

  const handleAddText = () => {
    onAddText(textInput, {
      fontSize,
      fontFamily,
      fill: textColor,
    });
    setTextInput("New Text");
  };

  const handleUpdateText = () => {
    if (selectedObject && selectedObject.type === "i-text") {
      onUpdateText({
        fontSize,
        fontFamily,
        fill: textColor,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Add Text</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter text..."
          />
          <button
            onClick={handleAddText}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Type className="w-4 h-4 inline mr-2" />
            Add Text
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-700 mb-2">Font</h3>
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            if (selectedObject) handleUpdateText();
          }}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-medium text-gray-700 mb-2">Size</h3>
        <input
          type="range"
          min="8"
          max="72"
          value={fontSize}
          onChange={(e) => {
            setFontSize(Number(e.target.value));
            if (selectedObject) handleUpdateText();
          }}
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">{fontSize}px</div>
      </div>

      <div>
        <h3 className="font-medium text-gray-700 mb-2">Color</h3>
        <input
          type="color"
          value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value);
            if (selectedObject) handleUpdateText();
          }}
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>

      {selectedObject && selectedObject.type === "i-text" && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            ✓ Text object selected - changes will apply to selected text
          </p>
        </div>
      )}
    </div>
  );
}
