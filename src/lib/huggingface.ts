import { ArticlesData } from "@/types/article";

/**
 * Fetch article data from Hugging Face
 * @param datasetName - Hugging Face dataset name, defaults to Alwin-Yang/bmw-news-all
 * @param fileName - File name in the dataset, defaults to bmw_articles.json
 * @returns Article data
 */
export async function fetchArticlesFromHuggingFace(
  datasetName: string = "Alwin-Yang/bmw-news-all",
  fileName: string = "bmw_training_20251219_163541_110articles.json"
): Promise<ArticlesData> {
  // Try multiple possible URL formats
  const urls = [
    // Use resolve/main/ to get raw file (correct format)
    `https://huggingface.co/datasets/${datasetName}/resolve/main/${fileName}`,
    // Fallback: Use raw/main/ (also works in some cases)
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
        // Allow redirects
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
      
      // Try to parse JSON, if it fails then it's not JSON format
      let data: ArticlesData;
      try {
        const responseText = await response.text();
        console.log(`[HuggingFace] Response text length: ${responseText.length}, first 200 chars: ${responseText.substring(0, 200)}`);
        
        // Check if it's HTML (usually starts with <)
        if (responseText.trim().startsWith('<')) {
          throw new Error(`Received HTML instead of JSON. Content preview: ${responseText.substring(0, 200)}`);
        }
        data = JSON.parse(responseText) as ArticlesData;
      } catch (parseError) {
        console.error(`[HuggingFace] JSON parse error:`, parseError);
        throw new Error(`Failed to parse response as JSON. Content-type: ${contentType}, Error: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
      
      // Validate data format
      if (!data || !data.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid data format: missing articles array');
      }
      
      console.log(`[HuggingFace] Successfully fetched ${data.articles.length} articles`);
      return data;
    } catch (error) {
      console.error(`[HuggingFace] Failed to fetch from ${url}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue trying next URL
      continue;
    }
  }

  // All URLs failed
  throw new Error(
    `Failed to fetch data from all URLs. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Fetch data from local JSON file or API endpoint
 * Used for development and testing
 * In production (static export), directly call Hugging Face API
 */
export async function fetchArticlesFromLocal(
  url: string = "/api/articles"
): Promise<ArticlesData> {
  // In client (browser), directly call Hugging Face API
  // Because static export doesn't support API routes
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

  // Server-side (development): Try using API route
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // Try to get error message
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          // If not JSON, try reading text
          const text = await response.text();
          if (text) {
            errorMessage = `${errorMessage}. Response: ${text.substring(0, 200)}`;
          }
        }
      } catch (parseError) {
        // If parsing fails, use default error message
        console.warn("Failed to parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Check if it's an error response (even if status code is 200)
    if (data.error) {
      throw new Error(data.message || data.error);
    }
    
    return data as ArticlesData;
  } catch (error) {
    console.error("Error fetching local data:", error);
    // If it's an error we threw, directly rethrow
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise wrap as Error
    throw new Error(`Failed to fetch articles: ${String(error)}`);
  }
}
