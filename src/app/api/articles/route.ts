import { NextResponse } from "next/server";
import { fetchArticlesFromHuggingFace } from "@/lib/huggingface";

// 从 Hugging Face 数据集获取数据
// 注意：此 API route 在静态导出时会被临时排除（见 scripts/build-static.sh）
export async function GET() {
  try {
    console.log("[API] Starting articles fetch...");
    
    // 从 Hugging Face 数据集获取数据
    const datasetName = process.env.HUGGINGFACE_DATASET_NAME || "Alwin-Yang/bmw-news-all";
    const fileName = process.env.HUGGINGFACE_FILE_NAME || "bmw_training_251224_1k_latest.json";

    console.log("[API] Dataset:", datasetName, "File:", fileName);
    
    const data = await fetchArticlesFromHuggingFace(datasetName, fileName);
    
    console.log("[API] Successfully fetched data, articles count:", data?.articles?.length || 0);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("[API] Error in articles API route:", error);
    console.error("[API] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("[API] Detailed error message:", errorMessage);
    
    // 确保始终返回 JSON 格式的错误响应
    try {
      return NextResponse.json(
        { 
          error: "Failed to fetch articles from Hugging Face",
          message: errorMessage,
          stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
          datasetName: process.env.HUGGINGFACE_DATASET_NAME || "Alwin-Yang/bmw-news-all",
          fileName: process.env.HUGGINGFACE_FILE_NAME || "bmw_training_20251219_163541_110articles.json"
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (jsonError) {
      // 如果连 JSON 响应都失败了，记录错误
      console.error("[API] Failed to create JSON error response:", jsonError);
      // 返回一个简单的文本响应（虽然不应该发生）
      return new Response(
        JSON.stringify({ 
          error: "Internal Server Error",
          message: "Failed to process error response"
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
}
