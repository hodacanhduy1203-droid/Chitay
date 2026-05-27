import { UploadCloud, Sparkles, Image as ImageIcon, CheckCircle2, RefreshCw } from "lucide-react";

interface FileUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  isUploading?: boolean;
}

export function FileUpload({ onImageSelect, selectedImage, isUploading }: FileUploadProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <div className="w-full">
      {isUploading ? (
        <div className="flex flex-col items-center justify-center w-full h-[400px] sm:h-[500px] border border-[#c4a46d44] bg-[#0a0a0c] relative overflow-hidden">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#c4a46d] animate-spin mb-2" />
            <p className="text-xs tracking-[0.3em] uppercase font-bold text-[#c4a46d] animate-pulse">
              Đang đồng bộ hóa sinh trắc học...
            </p>
            <p className="text-[10px] text-[#a1a1aa] tracking-widest uppercase font-mono">Bảo mật dữ liệu 256-bit AES</p>
          </div>
        </div>
      ) : !selectedImage ? (
        <label 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full h-[400px] sm:h-[500px] border border-[#c4a46d44] cursor-pointer hover:bg-white/[0.02] transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <div className="mb-6 opacity-40 group-hover:opacity-60 transition-opacity duration-300">
              {/* Abstract Hand Outline from Theme */}
              <svg className="w-32 sm:w-48 h-auto fill-none stroke-[#c4a46d]" viewBox="0 0 24 24" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                
                {/* Life line */}
                <path d="M10 10.5 Q 8 16 11 20.5" stroke="#e2e2d5" strokeWidth="0.4" strokeDasharray="0.5 0.5" />
                {/* Head line */}
                <path d="M10 11.5 Q 12 14 16 14" stroke="#c4a46d" strokeWidth="0.4" />
                {/* Heart line */}
                <path d="M18 14 Q 15 11 11 12" stroke="#e2e2d5" strokeWidth="0.5" />
                {/* Fate line */}
                <path d="M13 21 L 13 13" stroke="#c4a46d" strokeWidth="0.3" strokeDasharray="1 1" />
              </svg>
            </div>
            
            <p className="mb-2 text-xs tracking-widest uppercase font-bold text-[#c4a46d]">
              Tải ảnh lên hoặc kéo thả vào đây
            </p>
            <p className="text-xs text-[#a1a1aa] tracking-widest uppercase font-sans">Độ phân giải lớn nhất: 8K Deep-Scan</p>
          </div>
          
          <div className="absolute top-1/4 w-full h-[1px] bg-[#c4a46d] shadow-[0_0_15px_#c4a46d] opacity-0 group-hover:opacity-50 transition-opacity" />
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleChange}
          />
        </label>
      ) : (
        <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden border border-[#c4a46d44] flex items-center justify-center bg-black/40 group">
          <img 
            src={selectedImage} 
            alt="Bàn tay của bạn" 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
          />
          <div className="absolute inset-0 bg-[#0a0a0c]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <label className="cursor-pointer bg-[#c4a46d] text-[#0a0a0c] text-xs font-bold uppercase tracking-widest px-8 py-3 flex items-center gap-2 hover:bg-[#d4b47d] transition">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Đổi ảnh
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="absolute top-6 left-6 text-[#c4a46d] text-[10px] font-sans uppercase tracking-widest flex items-center gap-1.5 border border-[#c4a46d] px-3 py-1 bg-[#0a0a0c]/80">
            <span>● Đã tải ảnh lên</span>
          </div>
        </div>
      )}
    </div>
  );
}
