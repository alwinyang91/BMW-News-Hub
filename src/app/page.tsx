"use client";

import { useState, useEffect } from "react";
import { ArticlesData } from "@/types/article";
import ArticleList from "@/components/ArticleList";
import { fetchArticlesFromLocal } from "@/lib/huggingface";

export default function Home() {
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
        const errorMessage = err instanceof Error ? err.message : "Failed to load articles";
        setError(`Failed to load articles: ${errorMessage}`);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Latest News</h1>
        {data && (
          <>
            <p className="text-gray-600">
              {data.count} articles from {data.source}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(data.scraped_at).toLocaleString()}
            </p>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading articles...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg font-semibold mb-2">{error}</p>
          <p className="text-gray-600 text-sm">
            Please check the browser console for more details.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchArticlesFromLocal("/api/articles")
                .then((fetchedData) => {
                  setData(fetchedData);
                  setLoading(false);
                })
                .catch((err) => {
                  console.error("Error fetching data:", err);
                  const errorMessage = err instanceof Error ? err.message : "Failed to load articles";
                  setError(`Failed to load articles: ${errorMessage}`);
                  setLoading(false);
                });
            }}
            className="mt-4 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <ArticleList articles={data.articles} />
      ) : null}
    </main>
  );
}
