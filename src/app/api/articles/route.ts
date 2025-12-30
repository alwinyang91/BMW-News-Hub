import { NextResponse } from "next/server";
import { fetchArticlesFromHuggingFace } from "@/lib/huggingface";

// Fetch data from Hugging Face dataset
// Note: This API route will be temporarily excluded during static export (see scripts/build-static.sh)
export async function GET() {
  try {
    console.log("[API] Starting articles fetch...");
    
    // Fetch data from Hugging Face dataset
    // Note: Use NEXT_PUBLIC_ prefix to access during static export
    const datasetName = process.env.NEXT_PUBLIC_HUGGINGFACE_DATASET_NAME || process.env.HUGGINGFACE_DATASET_NAME || "Alwin-Yang/bmw-articles";
    const fileName = process.env.NEXT_PUBLIC_HUGGINGFACE_FILE_NAME || process.env.HUGGINGFACE_FILE_NAME || "bmw_articles_latest.json";

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
    
    // Ensure always return JSON format error response
    try {
      return NextResponse.json(
        { 
          error: "Failed to fetch articles from Hugging Face",
          message: errorMessage,
          stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
          datasetName: process.env.NEXT_PUBLIC_HUGGINGFACE_DATASET_NAME || process.env.HUGGINGFACE_DATASET_NAME || "Alwin-Yang/bmw-articles",
          fileName: process.env.NEXT_PUBLIC_HUGGINGFACE_FILE_NAME || process.env.HUGGINGFACE_FILE_NAME || "bmw_articles_latest.json"
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (jsonError) {
      // If even JSON response fails, log error
      console.error("[API] Failed to create JSON error response:", jsonError);
      // Return a simple text response (should not happen)
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
