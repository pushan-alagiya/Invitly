"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  Search,
  Replace,
  Save,
  Loader2,
  Check,
  X,
  User,
  Calendar,
  MapPin,
  Heart,
  Users,
  Clock,
  Mail,
  Phone,
} from "lucide-react";

interface DynamicField {
  id: string;
  key: string;
  label: string;
  value: string;
  type: "text" | "date" | "email" | "phone" | "address";
  icon: any;
  description: string;
}

interface DynamicFieldsManagerProps {
  onFieldUpdate: (fields: DynamicField[]) => void;
  onGlobalReplace: (searchText: string, replaceText: string) => void;
  fields: DynamicField[];
}

const DEFAULT_FIELDS: Omit<DynamicField, "id">[] = [
  {
    key: "BrideName",
    label: "Bride's Name",
    value: "",
    type: "text",
    icon: User,
    description: "Bride's full name",
  },
  {
    key: "GroomName",
    label: "Groom's Name",
    value: "",
    type: "text",
    icon: User,
    description: "Groom's full name",
  },
  {
    key: "WeddingDate",
    label: "Wedding Date",
    value: "",
    type: "date",
    icon: Calendar,
    description: "Date of the wedding ceremony",
  },
  {
    key: "WeddingTime",
    label: "Wedding Time",
    value: "",
    type: "text",
    icon: Clock,
    description: "Time of the wedding ceremony",
  },
  {
    key: "Venue",
    label: "Venue",
    value: "",
    type: "text",
    icon: MapPin,
    description: "Wedding venue name",
  },
  {
    key: "VenueAddress",
    label: "Venue Address",
    value: "",
    type: "address",
    icon: MapPin,
    description: "Full venue address",
  },
  {
    key: "ReceptionVenue",
    label: "Reception Venue",
    value: "",
    type: "text",
    icon: MapPin,
    description: "Reception venue name",
  },
  {
    key: "ReceptionTime",
    label: "Reception Time",
    value: "",
    type: "text",
    icon: Clock,
    description: "Reception start time",
  },
  {
    key: "RSVPDate",
    label: "RSVP Deadline",
    value: "",
    type: "date",
    icon: Calendar,
    description: "RSVP response deadline",
  },
  {
    key: "ContactEmail",
    label: "Contact Email",
    value: "",
    type: "email",
    icon: Mail,
    description: "Contact email for RSVP",
  },
  {
    key: "ContactPhone",
    label: "Contact Phone",
    value: "",
    type: "phone",
    icon: Phone,
    description: "Contact phone number",
  },
  {
    key: "CoupleNames",
    label: "Couple Names",
    value: "",
    type: "text",
    icon: Heart,
    description: "Combined couple names",
  },
  {
    key: "GuestCount",
    label: "Guest Count",
    value: "",
    type: "text",
    icon: Users,
    description: "Expected number of guests",
  },
];

export default function DynamicFieldsManager({
  onFieldUpdate,
  onGlobalReplace,
  fields,
}: DynamicFieldsManagerProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] =
    useState<DynamicField["type"]>("text");
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalReplace, setGlobalReplace] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    // Initialize with default fields if none exist
    if (fields.length === 0) {
      const defaultFields = DEFAULT_FIELDS.map((field) => ({
        ...field,
        id: `field-${Date.now()}-${Math.random()}`,
      }));
      onFieldUpdate(defaultFields);
    }
  }, []);

  const startEditing = (field: DynamicField) => {
    setEditingFieldId(field.id);
    setEditingValue(field.value);
  };

  const saveFieldValue = () => {
    if (editingFieldId && editingValue.trim() !== undefined) {
      const updatedFields = fields.map((field) =>
        field.id === editingFieldId
          ? { ...field, value: editingValue.trim() }
          : field
      );
      onFieldUpdate(updatedFields);
    }
    setEditingFieldId(null);
    setEditingValue("");
  };

  const cancelEditing = () => {
    setEditingFieldId(null);
    setEditingValue("");
  };

  const addNewField = () => {
    if (newFieldKey.trim() && newFieldLabel.trim()) {
      const newField: DynamicField = {
        id: `field-${Date.now()}-${Math.random()}`,
        key: newFieldKey.trim(),
        label: newFieldLabel.trim(),
        value: "",
        type: newFieldType,
        icon: User, // Default icon
        description: `Custom field: ${newFieldLabel.trim()}`,
      };

      const updatedFields = [...fields, newField];
      onFieldUpdate(updatedFields);

      // Reset form
      setNewFieldKey("");
      setNewFieldLabel("");
      setNewFieldType("text");
      setShowAddField(false);
    }
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = fields.filter((field) => field.id !== fieldId);
    onFieldUpdate(updatedFields);
  };

  const duplicateField = (field: DynamicField) => {
    const duplicatedField: DynamicField = {
      ...field,
      id: `field-${Date.now()}-${Math.random()}`,
      key: `${field.key}_copy`,
      label: `${field.label} (Copy)`,
    };
    const updatedFields = [...fields, duplicatedField];
    onFieldUpdate(updatedFields);
  };

  const handleGlobalReplace = async () => {
    if (globalSearch.trim() && globalReplace.trim()) {
      setIsReplacing(true);
      try {
        await onGlobalReplace(globalSearch.trim(), globalReplace.trim());
        setGlobalSearch("");
        setGlobalReplace("");
      } catch (error) {
        console.error("Error during global replace:", error);
      } finally {
        setIsReplacing(false);
      }
    }
  };

  const copyFieldKey = (fieldKey: string) => {
    navigator.clipboard.writeText(`{${fieldKey}}`);
  };

  const filteredFields = fields.filter(
    (field) =>
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFieldIcon = (field: DynamicField) => {
    const IconComponent = field.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getFieldTypeColor = (type: DynamicField["type"]) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "date":
        return "bg-green-100 text-green-800";
      case "email":
        return "bg-purple-100 text-purple-800";
      case "phone":
        return "bg-orange-100 text-orange-800";
      case "address":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Dynamic Fields</h3>
        <button
          onClick={() => setShowAddField(!showAddField)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Add new field"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add New Field Form */}
      {showAddField && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-700">Add New Field</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Key
              </label>
              <input
                type="text"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                placeholder="e.g., CustomField"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                value={newFieldType}
                onChange={(e) =>
                  setNewFieldType(e.target.value as DynamicField["type"])
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="text">Text</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="address">Address</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Label
            </label>
            <input
              type="text"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="e.g., Custom Field Label"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={addNewField}
              disabled={!newFieldKey.trim() || !newFieldLabel.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Add Field
            </button>
            <button
              onClick={() => setShowAddField(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Fields */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search fields..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Global Replace */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
          <Replace className="w-4 h-4" />
          <span>Global Text Replace</span>
        </h4>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Find
            </label>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Text to find..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replace With
            </label>
            <input
              type="text"
              value={globalReplace}
              onChange={(e) => setGlobalReplace(e.target.value)}
              placeholder="Replacement text..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleGlobalReplace}
          disabled={
            !globalSearch.trim() || !globalReplace.trim() || isReplacing
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          {isReplacing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Replace className="w-4 h-4" />
          )}
          <span>{isReplacing ? "Replacing..." : "Replace All"}</span>
        </button>
      </div>

      {/* Fields List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredFields.map((field) => {
          const isEditing = editingFieldId === field.id;

          return (
            <div
              key={field.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFieldIcon(field)}
                  <span className="font-medium text-sm">{field.label}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getFieldTypeColor(
                      field.type
                    )}`}
                  >
                    {field.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => copyFieldKey(field.key)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                    title="Copy field key"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => duplicateField(field)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                    title="Duplicate field"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => startEditing(field)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                    title="Edit field"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Delete field"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-2">
                Key:{" "}
                <code className="bg-gray-100 px-1 rounded">{`{${field.key}}`}</code>
              </div>

              <div className="text-xs text-gray-600 mb-2">
                {field.description}
              </div>

              <div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter value..."
                    />
                    <button
                      onClick={saveFieldValue}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {field.value || (
                        <span className="text-gray-400 italic">
                          No value set
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">
          How to Use Dynamic Fields
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            • Use{" "}
            <code className="bg-blue-100 px-1 rounded">{`{FieldKey}`}</code> in
            your text to insert dynamic values
          </p>
          <p>• Click the copy icon next to any field to copy its key</p>
          <p>
            • Use "Global Text Replace" to update all instances of text across
            your design
          </p>
          <p>• Fields are automatically updated when you change their values</p>
        </div>
      </div>
    </div>
  );
}
