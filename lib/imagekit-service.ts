// ImageKit AI Transformations Service
// This service handles image uploads to ImageKit and AI transformations
// Uses backend for secure signature generation

import { BaseClient } from "@/api/ApiClient";

// Define types for auth parameters
interface AuthParams {
  publicKey: string;
  signature: string;
  token: string;
  expire: number;
  fileName: string;
  useUniqueFileName: boolean;
  folder: string;
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

export class ImageKitService {
  private baseUrl = "https://ik.imagekit.io/i7cf5gey1";
  private publicKey = "public_SLfmJqmlIVmSrk9rG54Zh8w+qt0=";
  private uploadEndpoint = "https://upload.imagekit.io/api/v1/files/upload";
  private demoMode = false; // Set to false to use backend signature generation

  // Get authentication parameters from backend
  private async getAuthParams(fileName: string): Promise<AuthParams> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await BaseClient.post<any>("/imagekit/auth-params", {
        fileName,
      });

      return response.data.data;
    } catch (error) {
      console.error("Error getting auth params from backend:", error);
      throw error;
    }
  }

  // Upload image to ImageKit with backend authentication
  async uploadImage(file: File): Promise<string> {
    try {
      console.log("Uploading image to ImageKit via backend API:", file.name);

      if (this.demoMode) {
        console.warn(
          "DEMO MODE: Using fallback URL instead of real ImageKit upload"
        );
        const demoUrl = `https://ik.imagekit.io/demo/${Date.now()}_${
          file.name
        }`;
        console.log("Demo URL generated:", demoUrl);
        return demoUrl;
      }

      // Use backend API for upload
      const formData = new FormData();
      formData.append("file", file);

      const response = await BaseClient.post("/imagekit/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseData = response.data as { data?: { url?: string } };
      if (responseData && responseData.data && responseData.data.url) {
        return responseData.data.url;
      } else {
        throw new Error("No URL in upload response");
      }
    } catch (error) {
      console.error("Error uploading to ImageKit:", error);

      if (this.demoMode) {
        console.log("DEMO MODE: Using fallback URL due to upload error");
        return `https://ik.imagekit.io/demo/${Date.now()}_${file.name}`;
      }

      throw error;
    }
  }

  // Upload image from URL to ImageKit
  async uploadImageFromUrl(imageUrl: string): Promise<string> {
    try {
      console.log("Uploading image from URL to ImageKit:", imageUrl);

      // Check if it's already an ImageKit URL
      if (this.isImageKitUrl(imageUrl)) {
        console.log("Image is already on ImageKit");
        return imageUrl;
      }

      if (this.demoMode) {
        console.warn(
          "DEMO MODE: Using fallback URL instead of real ImageKit upload"
        );
        return `https://ik.imagekit.io/demo/${Date.now()}_uploaded.jpg`;
      }

      // Fetch the image first
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });

      // Upload to ImageKit
      return await this.uploadImage(file);
    } catch (error) {
      console.error("Error uploading image from URL:", error);

      if (this.demoMode) {
        console.log("DEMO MODE: Using fallback URL for demo purposes");
        return `https://ik.imagekit.io/demo/${Date.now()}_uploaded.jpg`;
      }

      throw error;
    }
  }

  // Process AI transformation using backend
  async processAITransformation(
    imageUrl: string,
    operation: string,
    prompt?: string
  ): Promise<string> {
    try {
      console.log("Processing AI transformation:", operation);
      console.log("Original image URL:", imageUrl);

      if (this.demoMode) {
        console.log("DEMO MODE: Using fallback URL for AI transformation");
        return `https://via.placeholder.com/400x300/ff6600/ffffff?text=AI+Transformation+Demo`;
      }

      // Use backend for AI transformation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await BaseClient.post<any>("/imagekit/ai-transform", {
        imageUrl,
        operation,
        prompt,
      });

      console.log(
        "AI transformation successful:",
        response.data.data.transformedUrl
      );
      return response.data.data.transformedUrl;
    } catch (error) {
      console.error("Error processing AI transformation:", error);

      if (this.demoMode) {
        console.log("DEMO MODE: Using fallback URL for AI transformation");
        return `https://via.placeholder.com/400x300/ff6600/ffffff?text=AI+Transformation+Demo`;
      }

      // Return a placeholder for demo purposes
      return `https://via.placeholder.com/400x300/ff6600/ffffff?text=AI+Transformation+Failed`;
    }
  }

  // Generate AI transformation URL for an ImageKit image
  generateAITransformationUrl(
    imageKitUrl: string,
    transformation: string
  ): string {
    // Check if the URL is already from ImageKit
    if (!this.isImageKitUrl(imageKitUrl)) {
      console.warn(
        "Image is not from ImageKit. AI transformations may not work properly."
      );
      return imageKitUrl;
    }

    // Apply transformation to ImageKit URL
    const separator = imageKitUrl.includes("?") ? "&" : "?";
    return `${imageKitUrl}${separator}tr=${encodeURIComponent(transformation)}`;
  }

  // Generate text-to-image URL
  generateImageFromText(prompt: string): string {
    // For demo purposes, return a placeholder image
    // In production, you'd use ImageKit's text-to-image API
    return `https://via.placeholder.com/400x300/ff6600/ffffff?text=${encodeURIComponent(
      prompt
    )}`;
  }

  // Helper to check if URL is from ImageKit
  isImageKitUrl(url: string): boolean {
    return url.includes("ik.imagekit.io");
  }

  // Get transformation parameters for different AI operations
  getTransformationParams(operation: string, prompt?: string): string {
    switch (operation) {
      case "remove-bg-dotbg":
        return "e-removedotbg";
      case "remove-bg-bgremove":
        return "e-bgremove";
      case "drop-shadow":
        return "e-dropshadow";
      case "retouch":
        return "e-retouch";
      case "upscale":
        return "e-upscale";
      case "variation":
        return "e-genvar";
      case "face-crop":
        return "fo-face";
      case "smart-crop":
        return "fo-auto";
      case "change-bg":
        return prompt
          ? `e-changebg-prompt-${encodeURIComponent(prompt)}`
          : "e-changebg";
      case "edit-image":
        return prompt
          ? `e-edit-prompt-${encodeURIComponent(prompt)}`
          : "e-edit";
      case "generative-fill":
        return prompt
          ? `bg-genfill-prompt-${encodeURIComponent(prompt)}`
          : "bg-genfill";
      default:
        return "";
    }
  }

  // Helper to get a demo image for testing
  getDemoImage(): string {
    return "https://via.placeholder.com/400x300/3b82f6/ffffff?text=Demo+Image";
  }

  // Get demo mode status
  isDemoMode(): boolean {
    return this.demoMode;
  }

  // Set demo mode (for testing)
  setDemoMode(enabled: boolean): void {
    this.demoMode = enabled;
  }

  // List uploaded images from ImageKit
  async listUploadedImages(
    options: {
      limit?: number;
      path?: string;
      searchQuery?: string;
      page?: number;
    } = {}
  ): Promise<UploadedImage[]> {
    try {
      console.log("Fetching uploaded images from ImageKit");

      if (this.demoMode) {
        console.log("DEMO MODE: Returning mock uploaded images");
        return [
          {
            id: "demo-1",
            name: "demo-image-1.jpg",
            url: "https://via.placeholder.com/400x300/3b82f6/ffffff?text=Demo+Image+1",
            thumbnailUrl:
              "https://via.placeholder.com/150x150/3b82f6/ffffff?text=Thumb+1",
            size: 1024000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: "image",
            path: "/wedding-editor/",
          },
          {
            id: "demo-2",
            name: "demo-image-2.jpg",
            url: "https://via.placeholder.com/400x300/10b981/ffffff?text=Demo+Image+2",
            thumbnailUrl:
              "https://via.placeholder.com/150x150/10b981/ffffff?text=Thumb+2",
            size: 2048000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: "image",
            path: "/wedding-editor/",
          },
        ];
      }

      const response = await BaseClient.get("/imagekit/uploaded-images", {
        params: options,
      });

      const responseData = response.data as { data: UploadedImage[] };
      console.log(
        "Uploaded images fetched successfully:",
        responseData.data.length
      );
      return responseData.data;
    } catch (error) {
      console.error("Error fetching uploaded images:", error);

      if (this.demoMode) {
        console.log("DEMO MODE: Using fallback images due to error");
        return [
          {
            id: "fallback-1",
            name: "fallback-image.jpg",
            url: "https://via.placeholder.com/400x300/f59e0b/ffffff?text=Fallback+Image",
            thumbnailUrl:
              "https://via.placeholder.com/150x150/f59e0b/ffffff?text=Fallback",
            size: 512000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: "image",
            path: "/wedding-editor/",
          },
        ];
      }

      throw error;
    }
  }
}

export const imagekitService = new ImageKitService();
