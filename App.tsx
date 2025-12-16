import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { DetectionResult } from './components/DetectionResult';
import { ModelSelector } from './components/ModelSelector';
import { detectObjects as detectWithGemini } from './services/geminiService';
import { detectWithCustomApi } from './services/customApiService';
import { DetectionResponse } from './types';
import { Loader2 } from 'lucide-react';

// SETTING: Use environment variable VITE_USE_CUSTOM_API to select API
const getRuntimeConfig = () => {
  if (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__) {
    return (window as any).__RUNTIME_CONFIG__;
  }
  return {};
};

const runtimeConfig = getRuntimeConfig();
const USE_CUSTOM_API = (runtimeConfig.VITE_USE_CUSTOM_API || import.meta.env.VITE_USE_CUSTOM_API || 'false').toLowerCase() === 'true';

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (file: File) => {
    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      if (USE_CUSTOM_API) {
        // Custom API: Upload file directly
        try {
          const detectionData = await detectWithCustomApi(file, selectedModel || undefined);
          setResult(detectionData);
        } catch (err: any) {
          console.error("Detection error:", err);
          setError(err.message || "识别失败，请稍后重试");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Gemini API: Convert file to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(',')[1];
          const mimeType = file.type;

          try {
            const detectionData = await detectWithGemini(base64Data, mimeType);
            setResult(detectionData);
          } catch (err: any) {
            console.error("Detection error:", err);
            setError(err.message || "识别失败，请稍后重试");
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      console.error("File processing error", e);
      setError("处理文件失败");
      setIsLoading(false);
    }
  }, [selectedModel]);

  const handleReset = useCallback(() => {
    setImageSrc(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen w-full mx-auto bg-slate-50 flex flex-col relative shadow-xl overflow-hidden transition-all duration-300 portrait:max-w-md landscape:max-w-5xl">
      <Header showDetectionTitle={!!imageSrc && !isLoading && !error} onBack={handleReset} />
      
      <main className="flex-1 overflow-y-auto p-4 landscape:p-6 landscape:flex landscape:items-center landscape:justify-center">
        {!imageSrc ? (
          // Upload / Home View
          <div className="w-full h-full flex flex-col landscape:flex-row landscape:items-start landscape:justify-center landscape:gap-8 animate-fade-in">
             {/* Left Column: Title & Model Selection */}
             <div className="flex flex-col gap-4 landscape:gap-6 landscape:flex-1 landscape:max-w-md">
               {/* Title Section */}
               <div className="text-center landscape:text-left space-y-2 mt-4 landscape:mt-0">
                  <h1 className="text-2xl landscape:text-3xl font-bold text-slate-900 tracking-tight">图像识别</h1>
                  <p className="text-slate-500 text-sm landscape:text-base leading-relaxed">
                    {USE_CUSTOM_API ? '基于 Custom API 的目标检测' : '基于 Gemini AI 的智能目标检测'}<br className="hidden landscape:block" />
                    上传图片，自动识别并标注物体。
                  </p>
               </div>

               {/* Model Selection */}
               {USE_CUSTOM_API && (
                 <ModelSelector 
                   selectedModel={selectedModel} 
                   onModelSelect={setSelectedModel} 
                 />
               )}
             </div>

             {/* Right Column: Upload Section */}
             <div className="landscape:flex-1 landscape:w-full landscape:max-w-sm mt-4 landscape:mt-0">
                <UploadArea onImageSelect={handleImageSelect} />
             </div>
          </div>
        ) : (
          // Result / Loading View
          <div className="w-full h-full animate-fade-in flex flex-col">
            {isLoading && (
               <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                 <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white rounded-2xl border border-dashed border-blue-200 shadow-sm">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-slate-500 font-medium">AI 正在识别中...</p>
                 </div>
               </div>
            )}
            
            {error && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center max-w-sm w-full">
                  <p className="font-medium mb-2">{error}</p>
                  <button 
                    onClick={handleReset}
                    className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold shadow-sm hover:bg-red-50 transition-colors"
                  >
                    重试
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && (
              <DetectionResult 
                imageSrc={imageSrc} 
                detections={result?.detections || []}
                onReset={handleReset}
              />
            )}
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar - Portrait Only */}
      {(imageSrc && !isLoading) && (
        <div className="p-4 bg-white border-t border-slate-100 z-10 sticky bottom-0 pb-8 landscape:hidden">
           <button
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><line x1="21" y1="5" x2="9" y2="17"></line><line x1="9" y1="5" x2="21" y2="17"></line></svg>
            新的检测
          </button>
        </div>
      )}
    </div>
  );
}