"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Loader2,
  Heart,
  Star,
  User,
  MapPin,
  Camera,
  Music,
  Gift,
  Car,
  Coffee,
  School,
  Hospital,
  Church,
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface IconsTabProps {
  onIconSelect: (iconData: {
    name: string;
    svg: string;
    prefix: string;
  }) => void;
}

interface IconData {
  name: string;
  svg: string;
  prefix: string;
}

interface SearchResponse {
  icons: string[];
  total: number;
  limit: number;
  start: number;
  collections: Record<
    string,
    {
      name: string;
      total: number;
      author?: {
        name: string;
        url: string;
      };
      license?: {
        title: string;
        spdx: string;
        url?: string;
      };
      samples?: string[];
      height?: number | number[];
      category?: string;
      palette?: boolean;
    }
  >;
  request: Record<string, string>;
}

interface KeywordsResponse {
  prefix?: string;
  keyword?: string;
  invalid?: boolean;
  exists: boolean;
  matches: string[];
}

export default function IconsTab({ onIconSelect }: IconsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IconData[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [popularIcons, setPopularIcons] = useState<IconData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular icon sets to search from
  const popularIconSets = [
    "mdi", // Material Design Icons
    "tabler", // Tabler Icons
    "lucide", // Lucide Icons
    "heroicons", // Heroicons
    "feather", // Feather Icons
    "bootstrap", // Bootstrap Icons
    "fontawesome", // Font Awesome
    "ant-design", // Ant Design Icons
    "eva", // Eva Icons
    "remix", // Remix Icons
  ];

  // Categories for quick filtering
  const categories = [
    { id: "all", name: "All Icons", icon: Star },
    { id: "emotions", name: "Emotions", icon: Heart },
    { id: "objects", name: "Objects", icon: Gift },
    { id: "nature", name: "Nature", icon: Star },
    { id: "people", icon: User },
    { id: "activities", name: "Activities", icon: Music },
    { id: "places", name: "Places", icon: MapPin },
    { id: "transport", name: "Transport", icon: Car },
    { id: "food", name: "Food & Drink", icon: Coffee },
    { id: "business", name: "Business", icon: Star },
    { id: "education", name: "Education", icon: School },
    { id: "health", name: "Health", icon: Hospital },
    { id: "religion", name: "Religion", icon: Church },
    { id: "sports", name: "Sports", icon: Trophy },
    { id: "entertainment", name: "Entertainment", icon: Camera },
  ];

  // Get search suggestions using the keywords API
  const getSearchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const keywordsUrl = new URL("https://api.iconify.design/keywords");
      keywordsUrl.searchParams.set("keyword", query);

      const response = await fetch(keywordsUrl.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: KeywordsResponse = await response.json();

      if (data.invalid) {
        setSearchSuggestions([]);
      } else {
        setSearchSuggestions(data.matches.slice(0, 8)); // Limit to 8 suggestions
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Search icons from Iconify API using the proper search endpoint
  const searchIcons = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setHasMoreResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use the proper search API endpoint
      const limit = 64; // Default limit as per API docs
      const start = (page - 1) * limit;

      const searchUrl = new URL("https://api.iconify.design/search");
      searchUrl.searchParams.set("query", query);
      searchUrl.searchParams.set("limit", limit.toString());
      searchUrl.searchParams.set("start", start.toString());
      searchUrl.searchParams.set("prefixes", popularIconSets.join(","));

      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      // Parse icon names to extract prefix and name
      const iconDataPromises = data.icons.map(async (iconName) => {
        const [prefix, name] = iconName.split(":");
        if (!prefix || !name) return null;

        try {
          // Fetch SVG data for the icon
          const svgResponse = await fetch(
            `https://api.iconify.design/${prefix}/${name}.svg`
          );

          if (!svgResponse.ok) {
            throw new Error(`HTTP error! status: ${svgResponse.status}`);
          }

          const svg = await svgResponse.text();
          return {
            name,
            svg,
            prefix,
          };
        } catch (error) {
          console.warn(`Failed to fetch SVG for ${iconName}:`, error);
          return null;
        }
      });

      const iconData = (await Promise.all(iconDataPromises)).filter(
        Boolean
      ) as IconData[];

      setSearchResults(iconData);
      setTotalResults(data.total);
      setHasMoreResults(data.total > data.limit);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error searching icons:", error);
      setSearchResults([]);
      setTotalResults(0);
      setHasMoreResults(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load popular icons on component mount
  useEffect(() => {
    const loadPopularIcons = async () => {
      setIsLoading(true);
      try {
        const popularIconNames = [
          "heart",
          "star",
          "home",
          "user",
          "calendar",
          "map-pin",
          "phone",
          "mail",
          "camera",
          "music",
          "gift",
          "car",
          "plane",
          "train",
          "bus",
          "bike",
          "coffee",
          "food",
          "shopping",
          "work",
          "school",
          "hospital",
          "church",
          "trophy",
          "award",
          "book",
          "library",
          "museum",
          "theater",
          "party",
        ];

        const iconPromises = popularIconNames.map(async (name) => {
          try {
            const response = await fetch(
              `https://api.iconify.design/lucide/${name}.svg`
            );
            if (response.ok) {
              const svg = await response.text();
              return {
                name,
                svg,
                prefix: "lucide",
              };
            }
          } catch (error) {
            console.warn(`Failed to fetch popular icon ${name}:`, error);
          }
          return null;
        });

        const icons = (await Promise.all(iconPromises)).filter(
          Boolean
        ) as IconData[];
        setPopularIcons(icons);
      } catch (error) {
        console.error("Error loading popular icons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularIcons();
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        getSearchSuggestions(searchQuery);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, getSearchSuggestions]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchIcons(searchQuery, 1);
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setHasMoreResults(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchIcons]);

  const handleIconClick = (icon: IconData) => {
    onIconSelect(icon);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setTotalResults(0);
    setHasMoreResults(false);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (hasMoreResults && searchQuery.trim()) {
      searchIcons(searchQuery, currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      searchIcons(searchQuery, currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMoreResults) {
      searchIcons(searchQuery, currentPage + 1);
    }
  };

  const renderIcon = (icon: IconData) => {
    return (
      <div
        key={`${icon.prefix}-${icon.name}`}
        className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
        onClick={() => handleIconClick(icon)}
      >
        <div
          className="w-8 h-8 mb-2 flex items-center justify-center text-gray-600 group-hover:text-blue-600"
          dangerouslySetInnerHTML={{ __html: icon.svg }}
        />
        <span className="text-xs text-gray-500 text-center truncate w-full">
          {icon.name}
        </span>
        <span className="text-xs text-gray-400 text-center truncate w-full">
          {icon.prefix}
        </span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">Icons</h3>
        <p className="text-xs text-gray-500 mb-3">
          Search and add icons to your design
        </p>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          )}

          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
              {isLoadingSuggestions ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Loading suggestions...
                </div>
              ) : (
                <div className="py-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">Loading icons...</span>
          </div>
        )}

        {!isLoading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              No icons found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different search term
            </p>
          </div>
        )}

        {!isLoading && !searchQuery && (
          <>
            {/* Popular Icons */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Popular Icons
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {popularIcons.map(renderIcon)}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Categories
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="justify-start h-auto p-3"
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      <span className="text-xs">{category.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-700">
                Search Results ({totalResults} total)
              </Label>
              {hasMoreResults && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  className="text-xs"
                >
                  Load More
                </Button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {searchResults.map(renderIcon)}
            </div>

            {/* Pagination */}
            {totalResults > 64 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Page {currentPage} of {Math.ceil(totalResults / 64)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasMoreResults}
                    className="h-8 px-2"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
