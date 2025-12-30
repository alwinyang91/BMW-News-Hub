"use client";

import { useState, useMemo, useEffect } from "react";
import { ArticlesData } from "@/types/article";
import ArticleList from "@/components/ArticleList";
import { fetchArticlesFromLocal } from "@/lib/huggingface";

export default function TagsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [data, setData] = useState<ArticlesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticlesFromLocal("/api/articles")
      .then((fetchedData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to load articles");
        setLoading(false);
      });
  }, []);

  // Extract all unique tags from all articles
  const allTags = useMemo(() => {
    if (!data) return [];
    const tagSet = new Set<string>();
    data.articles.forEach((article) => {
      article.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [data]);

  // Filter articles based on selected tag
  const filteredArticles = useMemo(() => {
    if (!data) return [];
    if (!selectedTag) {
      return data.articles;
    }
    return data.articles.filter((article) =>
      article.tags.includes(selectedTag)
    );
  }, [data, selectedTag]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-6">Tags</h1>
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTag === null
                ? "bg-[#0066CC] text-white hover:bg-[#0052A3]"
                : "bg-[#E6F2FF] text-[#0066CC] hover:bg-[#0066CC] hover:text-white border border-[#0066CC]/30"
            }`}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-[#0066CC] text-white hover:bg-[#0052A3]"
                  : "bg-[#E6F2FF] text-[#0066CC] hover:bg-[#0066CC] hover:text-white border border-[#0066CC]/30"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {selectedTag && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">
            Articles tagged: <span className="text-[#0066CC]">{selectedTag}</span>
          </h2>
          <p className="text-gray-600 mt-2">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
          </p>
        </div>
      )}

      <ArticleList articles={filteredArticles} />
    </div>
  );
}
