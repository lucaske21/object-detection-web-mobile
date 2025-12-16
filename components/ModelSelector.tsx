import React, { useEffect, useState } from 'react';
import { fetchModels, Model } from '../services/modelService';
import { Loader2 } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelSelect: (modelName: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedModels = await fetchModels();
        setModels(fetchedModels);
        
        // Auto-select first model if none selected and models exist
        if (fetchedModels.length > 0 && !selectedModel) {
          onModelSelect(fetchedModels[0].model_name);
        }
      } catch (err: any) {
        console.error('Failed to load models:', err);
        setError('加载模型失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [selectedModel, onModelSelect]);

  if (isLoading) {
    return (
      <div className="w-full p-6 bg-white rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm">加载模型中...</p>
        </div>
      </div>
    );
  }

  if (error || models.length === 0) {
    return (
      <div className="w-full p-4 bg-yellow-50 rounded-2xl border border-yellow-200 animate-fade-in">
        <p className="text-yellow-700 text-sm text-center">
          {error || '暂无可用模型'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-4 landscape:p-5 animate-fade-in">
      <h3 className="text-base landscape:text-lg font-bold text-slate-700 mb-3 landscape:mb-4">选择模型</h3>
      <div className="space-y-2 landscape:space-y-3">
        {models.map((model) => (
          <label
            key={model.model_name}
            className={`flex items-start gap-3 p-3 landscape:p-4 rounded-xl cursor-pointer transition-all border-2 ${
              selectedModel === model.model_name
                ? 'bg-blue-50 border-blue-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="model"
              value={model.model_name}
              checked={selectedModel === model.model_name}
              onChange={(e) => onModelSelect(e.target.value)}
              className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 text-sm landscape:text-base mb-1">
                {model.model_name}
              </div>
              <div className="text-xs landscape:text-sm text-slate-500 mb-1">
                版本: {model.version} | 任务: {model.task}
              </div>
              <div className="text-xs landscape:text-sm text-slate-600 leading-relaxed">
                {model.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
