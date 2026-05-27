import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Moon, Star, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUpload } from './components/FileUpload';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);
    setSelectedImage(null);
    setImageId(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await response.json();
        if (response.ok && data.url) {
          setSelectedImage(data.url);
          setImageId(data.id);
        } else {
          // Fallback to client-side data url if upload endpoint had issues
          setSelectedImage(base64);
          setError(data.error || 'Máy chủ không thể đồng bộ hóa hình ảnh này.');
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        // Local fallback
        setSelectedImage(base64);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzePalm = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const payload = imageId ? { id: imageId } : { imageBase64: selectedImage };
      const response = await fetch('/api/analyze-palm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đã có lỗi xảy ra trong quá trình phân tích.');
      }

      setResult(data.result);
      
      // Sroll to result after a short delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e2e2d5] font-serif selection:bg-[#c4a46d33] overflow-x-hidden flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(196,164,109,0.08)_0%,transparent_70%)] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center flex-1">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16 space-y-4"
        >
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <div className="w-12 h-12 border border-[#c4a46d] flex items-center justify-center rotate-45">
              <span className="-rotate-45 text-[#c4a46d] font-bold font-sans tracking-widest">AI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl tracking-widest uppercase font-light text-[#c4a46d] font-sans">
              Xem Chỉ Tay Digital
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#a1a1aa] max-w-xl mx-auto font-light leading-relaxed">
            Khám phá bí ẩn vận mệnh qua lăng kính trí tuệ nhân tạo am hiểu 126 cổ thư phương Đông & phương Tây.
          </p>
        </motion.div>

        {/* Interactive Workspace */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl bg-[#0d0d0f] border border-[#c4a46d33] p-6 sm:p-12 relative"
        >
          <FileUpload onImageSelect={handleImageSelect} selectedImage={selectedImage} isUploading={isUploading} />
          
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
                  <button
                    onClick={analyzePalm}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto bg-[#c4a46d] text-[#0a0a0c] text-xs font-bold uppercase tracking-widest px-10 py-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#d4b47d]"
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang luận giải...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Luận giải ngay</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-red-950/50 border border-red-500/20 text-[#e2e2d5] text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Area */}
        <AnimatePresence>
          {result && (
            <motion.div 
              ref={resultRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="w-full mt-12 sm:mt-20 scroll-mt-24"
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] flex-1 bg-[#c4a46d33]" />
                <h3 className="text-[#c4a46d] text-xs tracking-[0.3em] uppercase font-sans px-4 text-center">Tổng Quan Mệnh Cách</h3>
                <div className="h-[1px] flex-1 bg-[#c4a46d33]" />
              </div>
              
              <div className="bg-[#0d0d0f] border border-[#c4a46d22] p-8 sm:p-12 relative">
                <div className="markdown-body max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
              
              <div className="mt-12 text-center text-xs tracking-widest uppercase text-[#52525b] font-sans">
                <p>AI Engine v4.2.0 ● 126 Cổ Thư Tích Hợp</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
