import { Article } from "@/types/article";
import Link from "next/link";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 hover:border-[#0066CC]">
      <div className="flex items-start justify-between mb-3">
        <span className="px-3 py-1 text-xs font-semibold text-[#0066CC] bg-[#E6F2FF] rounded-full">
          {article.article_type}
        </span>
        <span className="text-sm text-gray-600">{article.date}</span>
      </div>
      
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-3 line-clamp-2 hover:text-[#0066CC] transition-colors">
        {article.title}
      </h2>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {article.summary}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs font-medium text-[#0066CC] bg-[#E6F2FF] rounded border border-[#0066CC]/20"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <Link
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-[#0066CC] hover:text-[#004C99] font-medium text-sm transition-colors"
      >
        Read more →
      </Link>
    </div>
  );
}
