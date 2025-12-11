import React from 'react';
import { ChevronLeft, PenLine, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  showDetectionTitle?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showDetectionTitle = false, onBack }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-slate-50">
      <button 
        onClick={onBack}
        className="p-2.5 bg-white rounded-full shadow-sm text-slate-700 hover:bg-slate-100 transition-colors border border-slate-100 active:scale-95"
      >
        <ChevronLeft size={20} />
      </button>
      
      {/* Center title in landscape mode when detection result is shown */}
      {showDetectionTitle && (
        <div className="hidden landscape:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <CheckCircle2 className="text-slate-700 fill-slate-200" size={24} strokeWidth={2} />
          <span className="text-slate-800 font-bold text-lg">检测结果</span>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <button className="p-2.5 bg-white rounded-full shadow-sm text-cyan-500 hover:bg-slate-100 transition-colors border border-slate-100">
          <Sparkles size={18} fill="currentColor" className="opacity-20" />
        </button>
        <button className="p-2.5 bg-white rounded-full shadow-sm text-slate-700 hover:bg-slate-100 transition-colors border border-slate-100">
          <PenLine size={18} />
        </button>
        <button className="p-2.5 bg-white rounded-full shadow-sm text-slate-700 hover:bg-slate-100 transition-colors border border-slate-100">
          <Share2 size={18} />
        </button>
      </div>
    </header>
  );
};
