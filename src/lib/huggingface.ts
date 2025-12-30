import { ArticlesData } from "@/types/article";

/**
 * 从 Hugging Face 获取文章数据
 * @param datasetName - Hugging Face 数据集名称，默认为 Alwin-Yang/bmw-news-all
 * @param fileName - 数据集中的文件名，默认为 bmw_articles.json
 * @returns 文章数据
 */
export async function fetchArticlesFromHuggingFace(
  datasetName: string = "Alwin-Yang/bmw-news-all",
  fileName: string = "bmw_training_20251219_163541_110articles.json"
): Promise<ArticlesData> {
  // 尝试多个可能的 URL 格式
  const urls = [
    // 使用 resolve/main/ 获取原始文件 (正确格式)
    `https://huggingface.co/datasets/${datasetName}/resolve/main/${fileName}`,
    // 备用：使用 raw/main/ (某些情况下也有效)
    `https://huggingface.co/datasets/${datasetName}/raw/main/${fileName}`,
  ];

  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      console.log(`[HuggingFace] Trying to fetch from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Next.js Article Fetcher)',
        },
        // 允许重定向
        redirect: 'follow',
      });
      
      console.log(`[HuggingFace] Response status: ${response.status}, statusText: ${response.statusText}`);
      console.log(`[HuggingFace] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[HuggingFace] Error response body: ${errorText.substring(0, 500)}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText.substring(0, 200)}`);
      }

      const contentType = response.headers.get('content-type');
      console.log(`[HuggingFace] Response content-type: ${contentType}, status: ${response.status}`);
      
      // 尝试解析 JSON，如果失败则说明不是 JSON 格式
      let data: ArticlesData;
      try {
        const responseText = await response.text();
        console.log(`[HuggingFace] Response text length: ${responseText.length}, first 200 chars: ${responseText.substring(0, 200)}`);
        
        // 检查是否是 HTML（通常以 < 开头）
        if (responseText.trim().startsWith('<')) {
          throw new Error(`Received HTML instead of JSON. Content preview: ${responseText.substring(0, 200)}`);
        }
        data = JSON.parse(responseText) as ArticlesData;
      } catch (parseError) {
        console.error(`[HuggingFace] JSON parse error:`, parseError);
        throw new Error(`Failed to parse response as JSON. Content-type: ${contentType}, Error: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
      
      // 验证数据格式
      if (!data || !data.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid data format: missing articles array');
      }
      
      console.log(`[HuggingFace] Successfully fetched ${data.articles.length} articles`);
      return data;
    } catch (error) {
      console.error(`[HuggingFace] Failed to fetch from ${url}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // 继续尝试下一个 URL
      continue;
    }
  }

  // 所有 URL 都失败了
  throw new Error(
    `Failed to fetch data from all URLs. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * 从本地 JSON 文件或 API 端点获取数据
 * 用于开发和测试
 * 在生产环境（静态导出）中，直接调用 Hugging Face API
 */
export async function fetchArticlesFromLocal(
  url: string = "/api/articles"
): Promise<ArticlesData> {
  // 在客户端（浏览器）中，直接调用 Hugging Face API
  // 因为静态导出不支持 API routes
  if (typeof window !== "undefined") {
    try {
      console.log("[Local] Using Hugging Face API directly (client-side)");
      const datasetName = process.env.NEXT_PUBLIC_HUGGINGFACE_DATASET_NAME || "Alwin-Yang/bmw-articles";
      const fileName = process.env.NEXT_PUBLIC_HUGGINGFACE_FILE_NAME || "bmw_articles_latest.json";
      return await fetchArticlesFromHuggingFace(datasetName, fileName);
    } catch (error) {
      console.error("[Local] Failed to fetch from Hugging Face:", error);
      throw error;
    }
  }

  // 服务端（开发环境）：尝试使用 API route
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // 尝试获取错误信息
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          // 如果不是 JSON，尝试读取文本
          const text = await response.text();
          if (text) {
            errorMessage = `${errorMessage}. Response: ${text.substring(0, 200)}`;
          }
        }
      } catch (parseError) {
        // 如果解析失败，使用默认错误信息
        console.warn("Failed to parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // 检查是否是错误响应（即使状态码是 200）
    if (data.error) {
      throw new Error(data.message || data.error);
    }
    
    return data as ArticlesData;
  } catch (error) {
    console.error("Error fetching local data:", error);
    // 如果是我们抛出的错误，直接重新抛出
    if (error instanceof Error) {
      throw error;
    }
    // 否则包装成 Error
    throw new Error(`Failed to fetch articles: ${String(error)}`);
  }
}
