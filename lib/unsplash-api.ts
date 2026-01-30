const UNSPLASH_ACCESS_KEY = "gC03036rzRxxxxxxxxxxxxxxxxxxxxxxxkt4cjk";

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

export class UnsplashAPI {
  private accessKey: string;

  constructor(accessKey: string = UNSPLASH_ACCESS_KEY) {
    this.accessKey = accessKey;
  }

  async searchImages(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<UnsplashSearchResponse> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching images from Unsplash:", error);
      throw error;
    }
  }

  async getRandomImages(count: number = 10): Promise<UnsplashImage[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?count=${count}`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching random images from Unsplash:", error);
      throw error;
    }
  }
}

export const unsplashAPI = new UnsplashAPI();
