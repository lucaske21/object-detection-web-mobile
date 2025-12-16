import { DetectionResponse } from "../types";

// Configuration: Get from runtime config or build-time environment
const getRuntimeConfig = () => {
  if (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__) {
    return (window as any).__RUNTIME_CONFIG__;
  }
  return {};
};

const runtimeConfig = getRuntimeConfig();
const API_ENDPOINT = runtimeConfig.VITE_API_ENDPOINT 
  || import.meta.env.VITE_API_ENDPOINT 
  || '';

if (!API_ENDPOINT) {
  throw new Error("API endpoint is not configured. Please set VITE_API_ENDPOINT environment variable when starting the container.");
}
export const detectWithCustomApi = async (file: File, modelName?: string): Promise<DetectionResponse> => {
  try {
    // 1. Prepare the FormData with the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Add model name if provided
    if (modelName) {
      formData.append('model', modelName);
    }

    console.log(`[CustomAPI] Sending request to ${API_ENDPOINT}${modelName ? ` with model: ${modelName}` : ''}`);

    // 2. Make the Request
    // Note: Ensure your API supports CORS if calling from a browser
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      // Don't set Content-Type header - browser will set it automatically with boundary for multipart/form-data
      // headers: {
      //   "Authorization": "Bearer YOUR_API_TOKEN" // Add token if required
      // },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API Request failed: ${response.status} ${response.statusText}`);
    }

    const apiResult = await response.json();

    // 3. MAP THE DATA (Crucial Step)
    // You must convert your API's response format to the app's `DetectionResponse` format.
    // The App expects bounding boxes as [ymin, xmin, ymax, xmax] normalized to 0-1000.
    
    if (!apiResult.predictions || !Array.isArray(apiResult.predictions)) {
        console.warn("Unexpected API response format", apiResult);
        return { detections: [] };
    }

    const predictions = apiResult.predictions;

    // Get image dimensions to normalize coordinates
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => { img.onload = resolve; });
    const imgWidth = img.width;
    const imgHeight = img.height;

    return {
      detections: predictions.map((item: any) => {
        // API returns: { class_id, class_name, confidence, x1, y1, x2, y2 }
        // x1, y1 are top-left corner; x2, y2 are bottom-right corner
        // Convert to [ymin, xmin, ymax, xmax] normalized to 0-1000
        return {
          class_id: item.class_id,
          label: item.class_name || "Object", 
          box_2d: [
             Math.round((item.y1 / imgHeight) * 1000), // ymin
             Math.round((item.x1 / imgWidth) * 1000),  // xmin
             Math.round((item.y2 / imgHeight) * 1000), // ymax
             Math.round((item.x2 / imgWidth) * 1000)   // xmax
          ], 
          score: item.confidence || 0.0
        };
      })
    };

  } catch (error) {
    console.error("Custom API Error:", error);
    
    // Friendly error for the demo if URL hasn't been changed
    if (API_ENDPOINT.includes("your-api-domain.com")) {
       throw new Error("请配置 services/customApiService.ts 中的 API Endpoint");
    }
    
    throw error;
  }
};
