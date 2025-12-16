import React, { useMemo, useState } from 'react';
import { DetectionObject } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface DetectionResultProps {
  imageSrc: string;
  detections: DetectionObject[];
  modelName?: string;
  onReset: () => void;
}

export const DetectionResult: React.FC<DetectionResultProps> = ({ imageSrc, detections, modelName, onReset }) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [visibleClasses, setVisibleClasses] = useState<Set<string>>(new Set());

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Color palette for different classes
  const getColorForClass = (classId?: number) => {
    const colors = [
      { border: 'rgb(59, 130, 246)', bg: 'rgb(37, 99, 235)' },   // blue
      { border: 'rgb(34, 197, 94)', bg: 'rgb(22, 163, 74)' },    // green
      { border: 'rgb(249, 115, 22)', bg: 'rgb(234, 88, 12)' },   // orange
      { border: 'rgb(168, 85, 247)', bg: 'rgb(147, 51, 234)' },  // purple
      { border: 'rgb(236, 72, 153)', bg: 'rgb(219, 39, 119)' },  // pink
      { border: 'rgb(234, 179, 8)', bg: 'rgb(202, 138, 4)' },    // yellow
      { border: 'rgb(14, 165, 233)', bg: 'rgb(2, 132, 199)' },   // sky
      { border: 'rgb(239, 68, 68)', bg: 'rgb(220, 38, 38)' },    // red
      { border: 'rgb(20, 184, 166)', bg: 'rgb(13, 148, 136)' },  // teal
      { border: 'rgb(168, 162, 158)', bg: 'rgb(120, 113, 108)' } // stone
    ];
    return colors[classId !== undefined ? classId % colors.length : 0];
  };

  // Aggregate stats
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    detections.forEach(d => {
      counts[d.label] = (counts[d.label] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [detections]);

  // Initialize all classes as visible
  React.useEffect(() => {
    setVisibleClasses(new Set(stats.map(s => s.label)));
  }, [stats]);

  // Toggle class visibility
  const toggleClassVisibility = (label: string) => {
    setVisibleClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Filter detections based on visibility
  const visibleDetections = detections.filter(det => visibleClasses.has(det.label));

  return (
    <div className="w-full h-full flex flex-col pb-20 landscape:pb-0">
      {/* Result Header - Portrait Only */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0 landscape:hidden">
        <div className="text-slate-800 font-bold text-lg flex items-center gap-2">
           <CheckCircle2 className="text-slate-700 fill-slate-200" size={24} strokeWidth={2} />
           检测结果
        </div>
      </div>

      <div className="flex-1 flex flex-col landscape:grid landscape:grid-cols-2 landscape:gap-8 landscape:items-center landscape:min-h-0">
        {/* Image Container */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-slate-200 mb-6 landscape:mb-0 landscape:h-full flex justify-center items-center bg-opacity-50 border border-slate-100">
          {/* Inner relative container to tightly wrap the image for correct bounding box positioning */}
          <div className="relative w-fit max-w-full max-h-full">
            <img 
              src={imageSrc} 
              alt="Uploaded" 
              onLoad={handleImageLoad}
              className="w-full h-auto block max-h-[60vh] portrait:max-h-[50vh] landscape:max-h-[75vh] object-contain"
            />
            
            {/* Bounding Boxes */}
            {visibleDetections.map((det, idx) => {
              const [ymin, xmin, ymax, xmax] = det.box_2d;
              // Coordinates are 0-1000
              const top = ymin / 10;
              const left = xmin / 10;
              const height = (ymax - ymin) / 10;
              const width = (xmax - xmin) / 10;
              const colors = getColorForClass(det.class_id);

              return (
                <div
                  key={idx}
                  className="absolute border-2 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    borderColor: colors.border,
                  }}
                >
                  <div 
                    className="absolute -top-6 left-[-2px] text-white text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap font-medium shadow-sm flex items-center gap-1 z-10"
                    style={{ backgroundColor: colors.bg }}
                  >
                    {det.label}
                    <span className="opacity-80 font-light">
                       {det.score ? Math.round(det.score * 100) + '%' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="flex flex-col gap-4 landscape:h-full landscape:overflow-y-auto landscape:justify-center">
          {/* Model Name Display */}
          {modelName && (
            <div className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-blue-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <div>
                  <h3 className="font-bold text-blue-800 text-sm">检测模型</h3>
                  <p className="text-blue-600 text-xs mt-0.5">{modelName}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-bold text-slate-800 text-base">目标统计</h3>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {stats.map((item, index) => {
                const maxCount = Math.max(...stats.map(s => s.count));
                const barWidth = `${(item.count / maxCount) * 100}%`;
                const isVisible = visibleClasses.has(item.label);
                const classId = detections.find(d => d.label === item.label)?.class_id;
                const colors = getColorForClass(classId);

                return (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleClassVisibility(item.label)}
                      className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                      style={{ accentColor: colors.border }}
                    />
                    <div className="flex-1 grid grid-cols-[70px_1fr_20px] items-center gap-2">
                      <span 
                        className="text-sm font-medium truncate"
                        style={{ color: isVisible ? colors.bg : 'rgb(148, 163, 184)' }}
                      >
                        {item.label}
                      </span>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: barWidth,
                            backgroundColor: isVisible ? colors.border : 'rgb(203, 213, 225)'
                          }}
                        />
                      </div>
                      <span 
                        className="text-sm font-bold text-right"
                        style={{ color: isVisible ? 'rgb(71, 85, 105)' : 'rgb(148, 163, 184)' }}
                      >
                        {item.count}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="pt-4 text-center">
                <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full">
                  共检测到 {detections.length} 个目标 · 显示 {visibleDetections.length} 个
                </span>
              </div>
            </div>
          </div>
          
          {/* Landscape Button */}
          <button
            onClick={onReset}
            className="hidden landscape:flex w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all items-center justify-center gap-2 mt-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><line x1="21" y1="5" x2="9" y2="17"></line><line x1="9" y1="5" x2="21" y2="17"></line></svg>
            新的检测
          </button>
        </div>
      </div>
    </div>
  );
};
