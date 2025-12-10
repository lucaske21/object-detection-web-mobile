import React, { useRef } from 'react';
import { CloudUpload } from 'lucide-react';

interface UploadAreaProps {
  onImageSelect: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div 
        onClick={handleClick}
        className="w-full aspect-[4/3] landscape:aspect-video bg-blue-50/50 border-2 border-dashed border-blue-400 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors active:scale-[0.99] transform duration-200"
      >
        <div className="p-4 bg-blue-500 rounded-full text-white mb-6 shadow-blue-200 shadow-xl">
          <CloudUpload size={28} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">点击上传图片</h3>
        <p className="text-slate-400 text-sm font-medium">支持 JPG、PNG、GIF 格式</p>
        <input 
          ref={inputRef}
          type="file" 
          accept="image/png, image/jpeg, image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
