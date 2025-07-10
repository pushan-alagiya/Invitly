import { getShapeConfig } from "./shapes-config";

export interface EditorObject {
  id: string;
  type: "text" | "shape" | "image" | "icon";
  left: number;
  top: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string; // "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"
  fontStyle?: string; // "normal" | "italic"
  textDecoration?: string; // "none" | "underline"
  textAlign?: string; // "left" | "center" | "right" | "justify"
  textTransform?: string; // "none" | "uppercase" | "lowercase" | "capitalize"
  listType?: string; // "none" | "bullet" | "number"
  listStyle?: string; // "disc" | "circle" | "square" | "decimal" | "lower-alpha" | "upper-alpha" | "lower-roman" | "upper-roman"
  textShadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  textBackgroundColor?: string;
  letterSpacing?: number;
  lineHeight?: number;
  wordSpacing?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  shapeType?: string;
  cornerRadius?: number; // For rounded corners
  imageUrl?: string;
  iconSvg?: string; // For storing icon SVG data
  iconName?: string; // For storing icon name
  iconPrefix?: string; // For storing icon prefix
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  gradient?: {
    type: "linear" | "radial";
    colorStops: Array<{ offset: number; color: string }>;
  };
  opacity?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface EditorPage {
  id: string;
  name: string;
  backgroundColor: string;
  width: number;
  height: number;
  objects: EditorObject[];
}

export interface EditorProject {
  id: string;
  name: string;
  pages: EditorPage[];
  selectedPageId: string;
  selectedObjectId: string | null;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export class EditorState {
  private project: EditorProject;
  private listeners: Array<(project: EditorProject) => void> = [];
  private history: EditorProject[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;
  private clipboard: EditorObject[] | null = null;

  constructor() {
    this.project = this.createDefaultProject();
    this.saveToHistory();
  }

  // Clipboard methods
  setClipboard(objects: EditorObject[] | null) {
    this.clipboard = objects;
  }

  getClipboard(): EditorObject[] | null {
    return this.clipboard;
  }

  clearClipboard() {
    this.clipboard = null;
  }

  private createDefaultProject(): EditorProject {
    return {
      id: `project-${Date.now()}`,
      name: "Wedding Invitation",
      pages: [
        {
          id: "page-1",
          name: "Page 1",
          backgroundColor: "#FFFFFF",
          width: 800,
          height: 1000,
          objects: [],
        },
      ],
      selectedPageId: "page-1",
      selectedObjectId: null,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  // Subscribe to state changes
  subscribe(listener: (project: EditorProject) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners
  private notify() {
    this.listeners.forEach((listener) => listener(this.project));
  }

  // Get current project
  getProject(): EditorProject {
    return { ...this.project };
  }

  // Get current page
  getCurrentPage(): EditorPage | null {
    return (
      this.project.pages.find((p) => p.id === this.project.selectedPageId) ||
      null
    );
  }

  // Get page by ID
  getPage(pageId: string): EditorPage | null {
    return this.project.pages.find((p) => p.id === pageId) || null;
  }

  // Get object by ID
  getObject(objectId: string): EditorObject | null {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return null;
    return currentPage.objects.find((obj) => obj.id === objectId) || null;
  }

  // Get selected object
  getSelectedObject(): EditorObject | null {
    const currentPage = this.getCurrentPage();
    if (!currentPage || !this.project.selectedObjectId) return null;
    return (
      currentPage.objects.find(
        (obj) => obj.id === this.project.selectedObjectId
      ) || null
    );
  }

  // Update object
  updateObject(objectId: string, updates: Partial<EditorObject>) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const updatedObjects = currentPage.objects.map((obj) =>
      obj.id === objectId ? { ...obj, ...updates } : obj
    );

    const updatedPage = {
      ...currentPage,
      objects: updatedObjects,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.updateProject({ pages: newPages });
  }

  // Update object without saving to history (for real-time updates)
  updateObjectSilent(objectId: string, updates: Partial<EditorObject>) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const updatedObjects = currentPage.objects.map((obj) =>
      obj.id === objectId ? { ...obj, ...updates } : obj
    );

    const updatedPage = {
      ...currentPage,
      objects: updatedObjects,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.project = {
      ...this.project,
      pages: newPages,
      metadata: {
        ...this.project.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
    this.notify();
  }

  // Save current state to history
  private saveToHistory() {
    // Remove any future history if we're not at the end
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add current state
    this.history.push(JSON.parse(JSON.stringify(this.project)));

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  // Undo functionality
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.project = JSON.parse(
        JSON.stringify(this.history[this.historyIndex])
      );
      this.notify();
    }
  }

  // Redo functionality
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.project = JSON.parse(
        JSON.stringify(this.history[this.historyIndex])
      );
      this.notify();
    }
  }

  // Check if undo is available
  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  // Check if redo is available
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  // Move object up in layer order
  moveObjectUp(objectId: string) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const objectIndex = currentPage.objects.findIndex(
      (obj) => obj.id === objectId
    );
    if (objectIndex <= 0) return; // Already at top or not found

    const newObjects = [...currentPage.objects];
    const temp = newObjects[objectIndex];
    newObjects[objectIndex] = newObjects[objectIndex - 1];
    newObjects[objectIndex - 1] = temp;

    const updatedPage = {
      ...currentPage,
      objects: newObjects,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.updateProject({ pages: newPages });
  }

  // Move object down in layer order
  moveObjectDown(objectId: string) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const objectIndex = currentPage.objects.findIndex(
      (obj) => obj.id === objectId
    );
    if (objectIndex === -1 || objectIndex >= currentPage.objects.length - 1)
      return;

    const newObjects = [...currentPage.objects];
    const temp = newObjects[objectIndex];
    newObjects[objectIndex] = newObjects[objectIndex + 1];
    newObjects[objectIndex + 1] = temp;

    const updatedPage = {
      ...currentPage,
      objects: newObjects,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.updateProject({ pages: newPages });
  }

  // Update project with history tracking
  updateProject(updates: Partial<EditorProject>) {
    this.project = {
      ...this.project,
      ...updates,
      metadata: {
        ...this.project.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
    this.saveToHistory();
    this.notify();
  }

  // Add new page
  addPage() {
    const newPageId = `page-${Date.now()}`;
    const newPage: EditorPage = {
      id: newPageId,
      name: `Page ${this.project.pages.length + 1}`,
      backgroundColor: "#FFFFFF",
      width: 800,
      height: 1000,
      objects: [],
    };

    const newPages = [...this.project.pages, newPage];

    this.updateProject({
      pages: newPages,
      selectedPageId: newPageId,
      selectedObjectId: null,
    });
  }

  // Delete page
  deletePage(pageId: string) {
    if (this.project.pages.length === 1) return;

    const newPages = this.project.pages.filter((p) => p.id !== pageId);
    let newSelectedPageId = this.project.selectedPageId;

    if (this.project.selectedPageId === pageId) {
      newSelectedPageId = newPages[0].id;
    }

    this.updateProject({
      pages: newPages,
      selectedPageId: newSelectedPageId,
      selectedObjectId: null,
    });
  }

  // Duplicate page
  duplicatePage(pageId: string) {
    const page = this.project.pages.find((p) => p.id === pageId);
    if (!page) return;

    const newPageId = `page-${Date.now()}`;
    const newPage: EditorPage = {
      ...page,
      id: newPageId,
      name: `${page.name} Copy`,
      objects: page.objects.map((obj) => ({
        ...obj,
        id: `${obj.id}-copy-${Date.now()}`,
      })),
    };

    const pageIndex = this.project.pages.findIndex((p) => p.id === pageId);
    const newPages = [...this.project.pages];
    newPages.splice(pageIndex + 1, 0, newPage);

    this.updateProject({
      pages: newPages,
      selectedPageId: newPageId,
      selectedObjectId: null,
    });
  }

  // Select page
  selectPage(pageId: string) {
    this.updateProject({
      selectedPageId: pageId,
      selectedObjectId: null,
    });
  }

  // Add object to current page
  addObject(object: EditorObject) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const updatedObjects = [...currentPage.objects, object];
    const updatedPage = {
      ...currentPage,
      objects: updatedObjects,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.updateProject({
      pages: newPages,
      selectedObjectId: object.id,
    });
  }

  // Delete object
  deleteObject(objectId: string) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const updatedObjects = currentPage.objects.filter(
      (obj) => obj.id !== objectId
    );
    const updatedPage = {
      ...currentPage,
      objects: updatedObjects,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.updateProject({
      pages: newPages,
      selectedObjectId: null,
    });
  }

  // Duplicate object
  duplicateObject(objectId: string) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const object = currentPage.objects.find((obj) => obj.id === objectId);
    if (!object) return;

    const newObject: EditorObject = {
      ...object,
      id: `${object.type}-${Date.now()}`,
      left: object.left + 20,
      top: object.top + 20,
    };

    const updatedObjects = [...currentPage.objects, newObject];
    const updatedPage = {
      ...currentPage,
      objects: updatedObjects,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.updateProject({
      pages: newPages,
      selectedObjectId: newObject.id,
    });
  }

  // Select object
  selectObject(objectId: string | null) {
    this.updateProject({ selectedObjectId: objectId });
  }

  // Update background color
  updateBackgroundColor(color: string) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    const updatedPage = {
      ...currentPage,
      backgroundColor: color,
    };

    const newPages = this.project.pages.map((p) =>
      p.id === currentPage.id ? updatedPage : p
    );

    this.updateProject({ pages: newPages });
  }

  // Export project as JSON
  exportProject(): string {
    return JSON.stringify(this.project, null, 2);
  }

  // Import project from JSON
  importProject(jsonString: string) {
    try {
      const project = JSON.parse(jsonString) as EditorProject;
      this.project = {
        ...project,
        metadata: {
          ...project.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
      this.notify();
    } catch (error) {
      console.error("Error importing project:", error);
      throw new Error("Invalid project file");
    }
  }

  // Save to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem(
        `editor-project-${this.project.id}`,
        this.exportProject()
      );
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(`editor-project-${this.project.id}`);
      if (saved) {
        this.importProject(saved);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return false;
    }
  }

  // Add shape object
  addShape(shapeType: string) {
    const shapeConfig = getShapeConfig(shapeType);
    const newShape: EditorObject = {
      id: `shape-${Date.now()}`,
      type: "shape",
      left: 100,
      top: 100,
      shapeType: shapeType,
      fill: shapeConfig?.color || "#3B82F6",
      stroke: "#000000",
      strokeWidth: 0,
      width: 100,
      height: 100,
      cornerRadius: shapeConfig?.defaultCornerRadius || 0,
    };
    this.addObject(newShape);
  }

  // Add icon object
  addIcon(iconData: { name: string; svg: string; prefix: string }) {
    const newIcon: EditorObject = {
      id: `icon-${Date.now()}`,
      type: "icon",
      left: 100,
      top: 100,
      width: 48, // Larger default size for better visibility
      height: 48, // Larger default size for better visibility
      fill: "#000000",
      iconSvg: iconData.svg,
      iconName: iconData.name,
      iconPrefix: iconData.prefix,
    };
    this.addObject(newIcon);
  }
}

// Create singleton instance
export const editorState = new EditorState();
