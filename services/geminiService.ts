import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DetectionResponse } from "../types";

const detectObjects = async (base64Data: string, mimeType: string): Promise<DetectionResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      detections: {
        type: Type.ARRAY,
        description: "List of detected objects with their bounding boxes and labels.",
        items: {
          type: Type.OBJECT,
          properties: {
            label: {
              type: Type.STRING,
              description: "The name of the detected object (e.g., 'Cat', 'Bicycle'). Please use Chinese labels.",
            },
            box_2d: {
              type: Type.ARRAY,
              description: "Bounding box coordinates normalized to [0, 1000] in the format [ymin, xmin, ymax, xmax].",
              items: { type: Type.INTEGER },
            },
          },
          required: ["label", "box_2d"],
        },
      },
    },
    required: ["detections"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Detect all objects in this image. Return the result as a JSON object containing a list of detections with labels in Chinese and 2D bounding boxes (ymin, xmin, ymax, xmax) normalized to 0-1000.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4, // Lower temperature for more deterministic detection
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI model.");
    }

    const data = JSON.parse(text) as DetectionResponse;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process image with Gemini API.");
  }
};

export { detectObjects };
