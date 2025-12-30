"use client";

import { useState, useEffect, useMemo } from "react";
import { ArticlesData } from "@/types/article";
import ArticleList from "@/components/ArticleList";
import { fetchArticlesFromLocal } from "@/lib/huggingface";
import { parseDate } from "@/lib/utils";

export default function TodayPage() {
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

  // Filter out today's articles
  const todayArticles = useMemo(() => {
    if (!data) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return data.articles.filter((article) => {
      const articleDate = parseDate(article.date);
      if (!articleDate) {
        console.warn(`Failed to parse date: ${article.date}`);
        return false;
      }
      articleDate.setHours(0, 0, 0, 0);
      return articleDate.getTime() === today.getTime();
    });
  }, [data]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Today&apos;s News</h1>
        {data && (
          <>
            <p className="text-gray-600">
              {todayArticles.length} articles published today
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total articles: {data.count} from {data.source}
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
      ) : todayArticles.length > 0 ? (
        <ArticleList articles={todayArticles} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles published today.</p>
        </div>
      )}
    </main>
  );
}
