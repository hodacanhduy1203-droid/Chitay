import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Moon, 
  Star, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Layers, 
  Compass, 
  Calendar, 
  Activity, 
  Flame, 
  HelpCircle,
  Eye,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUpload } from './components/FileUpload';
import { PalmLineVisualizer } from './components/PalmLineVisualizer';

interface Section {
  id: string;
  title: string;
  content: string;
}

function parseSections(markdownText: string): Section[] {
  const sections: Section[] = [];
  
  // Clean up codeblock markers or master header if any
  const cleanedMarkdown = markdownText.replace(/```markdown/gi, "").replace(/```/g, "");
  
  // Seek pattern like "## 1. " or "## 2." or "## \d"
  const regex = /##\s+(\d)\.\s*([^\n]+)/g;
  const matches = [...cleanedMarkdown.matchAll(regex)];
  
  if (matches.length === 0) {
    // Basic split fallback if markdown lacks exact "## 1." format
    const parts = cleanedMarkdown.split(/##\s+/);
    if (parts.length > 1) {
      let index = 1;
      if (parts[0].trim()) {
        sections.push({
          id: "1",
          title: "Bản Luận Mệnh Thư",
          content: parts[0].trim()
        });
        index = 2;
      }
      for (let i = 1; i < parts.length; i++) {
        const lines = parts[i].split("\n");
        const title = lines[0].replace(/[\d\.\s#*]+/g, "").trim();
        const content = lines.slice(1).join("\n").trim();
        sections.push({
          id: String(index++),
          title: title || `Luận giải ${i}`,
          content: content
        });
      }
      return sections;
    }
    
    // Hard fallback
    return [{ id: "1", title: "Cát Hung Vận Mệnh Thư", content: cleanedMarkdown }];
  }
  
  // Extract introductory header text before the first section matches[0].index
  const introText = cleanedMarkdown.substring(0, matches[0].index).trim();
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const id = match[1];
    const headingText = match[2].trim().replace(/[*_#]+/g, "");
    
    const startIndex = match.index + match[0].length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : cleanedMarkdown.length;
    
    let content = cleanedMarkdown.substring(startIndex, endIndex).trim();
    
    // Add introduction to first section if it's there
    if (i === 0 && introText) {
      content = introText + "\n\n" + content;
    }
    
    sections.push({
      id,
      title: headingText,
      content
    });
  }
  
  return sections;
}

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [fallbackImages, setFallbackImages] = useState<string[]>([]);
  const [heicConverting, setHeicConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);
  
  // Calibration parameters
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [handSide, setHandSide] = useState<'left' | 'right'>('left');
  const [ageBracket, setAgeBracket] = useState<string>('25 - 45 tuổi');
  const [palmType, setPalmType] = useState<string>('Tự động đoán định');
  const [palmThickness, setPalmThickness] = useState<string>('Tự động đoán định');
  
  // Scan log stage tracking
  const [scanStep, setScanStep] = useState<number>(0);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto scroll effects for step simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      setScanStep(0);
      const stepsCount = 4;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        if (currentStep < stepsCount) {
          currentStep++;
          setScanStep(currentStep);
        } else {
          clearInterval(interval);
        }
      }, 2200);
      
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const handleImageSelect = async (file: File) => {
    setError(null);
    setResult(null);
    setSelectedImage(null);
    setImageId(null);
    setFallbackImages([]);

    let activeFile = file;

    // Detect HEIC / HEIF format (extremely common on modern smartphones)
    const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif') || 
                   file.type === 'image/heic' || 
                   file.type === 'image/heif' ||
                   file.type === 'image/heic-sequence';

    if (isHeic) {
      setHeicConverting(true);
      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.82
        });
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        activeFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
      } catch (err: any) {
        console.error("Lỗi chuyển đổi HEIC:", err);
        setError("Có lỗi khi giải mã tệp ảnh HEIC/HEIF từ điện thoại của bạn. Vui lòng thử tải ảnh chụp định dạng thông thường (JPEG/PNG).");
        setHeicConverting(false);
        return;
      } finally {
        setHeicConverting(false);
      }
    }

    const blobUrl = URL.createObjectURL(activeFile);

    setIsUploading(true);
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
          // Serve relative same-origin URL first as it fully conforms to strict CSP,
          // then keep blob URL and raw base64 as immediate client fallbacks!
          setSelectedImage(data.url);
          setImageId(data.id);
          setFallbackImages([blobUrl, base64]);
        } else {
          setSelectedImage(blobUrl);
          setFallbackImages([base64]);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        setSelectedImage(blobUrl);
        setFallbackImages([base64]);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(activeFile);
  };

  // Instant demo-palm selection function
  const loadDemoPalm = () => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0a0a0c"/>
      <circle cx="200" cy="250" r="180" fill="none" stroke="#c4a46d" stroke-width="0.5" stroke-dasharray="3,6" opacity="0.3"/>
      <path d="M110,380 C80,370 70,330 65,300 C60,280 40,270 30,260 C20,250 15,240 20,230 C25,220 45,235 60,250 C70,260 75,250 75,230 C75,190 70,140 70,110 C70,100 80,95 85,95 C90,95 100,100 100,110 L100,200 L105,200 C105,170 105,110 105,80 C105,70 115,65 120,65 C125,65 135,70 135,80 L135,200 L140,200 C141,170 142,120 145,90 C145,80 155,75 160,75 C165,75 175,80 175,90 L173,205 L178,205 C182,180 185,140 188,125 C188,115 198,110 203,110 C208,110 216,115 214,130 C210,165 205,220 205,230 C205,240 215,245 220,250 C235,265 240,285 240,310 C240,340 220,370 190,380 Z" fill="none" stroke="#c4a46d" stroke-width="1.5" opacity="0.8"/>
      <path d="M 85,245 C 110,255 135,295 105,365" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.8"/>
      <path d="M 83,247 C 120,247 160,260 205,310" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.8"/>
      <path d="M 223,260 C 170,240 120,230 90,225" fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.8"/>
      <path d="M 148,365 C 142,300 138,260 135,220" fill="none" stroke="#eab308" stroke-width="2.5" opacity="0.7"/>
      <text x="200" y="440" fill="#c4a46d" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="4" opacity="0.6">ANCIENT BIOMETRICS MAP</text>
    </svg>`;
    const base64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
    setSelectedImage(base64);
    setImageId(null);
    setFallbackImages([]);
    setError(null);
    setResult(null);
  };

  const analyzePalm = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setActiveSectionId("1");

    try {
      const payload = {
        gender,
        handSide,
        ageBracket,
        palmType,
        palmThickness,
        ...(imageId ? { id: imageId } : { imageBase64: selectedImage })
      };

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
      
      // Scroll to result after a short delay
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
    <div className="min-h-screen bg-[#060608] text-[#e2e2d5] font-sans selection:bg-[#c4a46d33] overflow-x-hidden flex flex-col relative">
      
      {/* Decorative starry map background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Fine grid lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#c4a46d_1px,transparent_1px),linear-gradient(to_bottom,#c4a46d_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Giant celestial map wheels */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle,rgba(196,164,109,0.04)_0%,transparent_70%)] rounded-full border border-[#c4a46d]/[0.02] flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full border border-dashed border-[#c4a46d]/[0.03] animate-[spin_100s_linear_infinite]" />
          <div className="w-[300px] h-[300px] rounded-full border border-dotted border-[#c4a46d]/[0.05] animate-[spin_60s_linear_infinite_reverse] absolute" />
        </div>
      </div>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center flex-1">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-10 sm:mb-14 space-y-4"
        >
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border border-[#c4a46d]/30 rotate-45 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-2 border border-dotted border-[#c4a46d]/55 -rotate-45" />
              <Compass className="w-6 h-6 text-[#c4a46d] animate-[pulse_3s_ease-in-out_infinite]" />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[#c4a46d] font-sans font-semibold">
                BIOMETRIC PALMISTRY EXPERT SYSTEM
              </p>
              <h1 className="text-3xl sm:text-5xl tracking-[0.25em] uppercase font-light text-white font-serif">
                Kính Thiên Thư
              </h1>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-[#9ea1a3] max-w-2xl mx-auto font-sans font-light leading-relaxed tracking-wide">
            Hệ thống phân tích sinh trắc họa chỉ tay kết hợp học thuật từ 126 pho cổ thư Đông - Tây tuyển lựa. <br className="hidden sm:block" />
            Nhận dạng đường nét sắc tố cơ hàn, kiến tạo bản đồ định mệnh chi tiết và phương thức bồi phước dưỡng an.
          </p>
        </motion.div>

        {/* Dashboard Grid Workspace */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* LEFT: Calibration Board & Data Input (colspan 5) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-5 bg-[#0b0c0f]/85 border border-[#c4a46d22] p-5 sm:p-7 rounded-none flex flex-col justify-between backdrop-blur-sm shadow-xl"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#c4a46d1a]">
                <Settings className="w-4 h-4 text-[#c4a46d]" />
                <h2 className="text-[#c4a46d] font-sans text-xs uppercase tracking-widest font-semibold">
                  Hiệu Chuẩn Sinh Trắc Chiêm Tinh
                </h2>
              </div>

              {/* Polarity Slider (Gender) */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-[#a1a1aa] font-sans flex items-center justify-between">
                  <span>Phối Cực Âm Dương (Giới tính)</span>
                  <span className="text-white text-xs font-semibold">{gender}</span>
                </span>
                
                <div className="grid grid-cols-3 gap-1 bg-[#121318] p-1 border border-[#c4a46d11]">
                  {(['Nam', 'Nữ', 'Khác'] as const).map((currGender) => (
                    <button
                      key={currGender}
                      type="button"
                      onClick={() => setGender(currGender)}
                      className={`py-1.5 text-[10px] font-sans font-medium uppercase tracking-widest transition-all ${
                        gender === currGender 
                          ? 'bg-[#c4a46d] text-black font-semibold' 
                          : 'text-[#888] hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      {currGender}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-[#7c7d85] font-serif leading-normal italic">
                  *Luận thư cổ: Nam xem tả thủ (trái) tàng nguyên khí, Nữ xem hữu thủ (phải) tàng phước tinh.
                </p>
              </div>

              {/* Hand side direction */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-[#a1a1aa] font-sans flex items-center justify-between">
                  <span>Chọn Diện Bàn Tay Luận Giải</span>
                  <span className="text-white text-xs font-semibold">
                    {handSide === 'left' ? 'Tay Trái (Căn Khí)' : 'Tay Phải (Vận Khí)'}
                  </span>
                </span>
                
                <div className="grid grid-cols-2 gap-1 bg-[#121318] p-1 border border-[#c4a46d11]">
                  <button
                    type="button"
                    onClick={() => setHandSide('left')}
                    className={`py-2 text-[10px] font-sans uppercase tracking-widest transition-all ${
                      handSide === 'left' 
                        ? 'bg-[#c4a46d15] text-[#c4a46d] border border-[#c4a46d33] font-semibold' 
                        : 'text-[#888] border border-transparent hover:text-white'
                    }`}
                  >
                    Tay Trái (Tả Thủ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandSide('right')}
                    className={`py-2 text-[10px] font-sans uppercase tracking-widest transition-all ${
                      handSide === 'right' 
                        ? 'bg-[#c4a46d15] text-[#c4a46d] border border-[#c4a46d33] font-semibold' 
                        : 'text-[#888] border border-transparent hover:text-white'
                    }`}
                  >
                    Tay Phải (Hữu Thủ)
                  </button>
                </div>
              </div>

              {/* Age Bracket */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-[#a1a1aa] font-sans block">
                  Niên Kỷ Vận Hạn (Giai đoạn tuổi)
                </label>
                <select
                  value={ageBracket}
                  onChange={(e) => setAgeBracket(e.target.value)}
                  className="w-full bg-[#121318] text-xs font-sans p-2 rounded-none border border-[#c4a46d1a] focus:border-[#c4a46d] outline-none text-[#e2e2d5]"
                >
                  <option value="Dưới 25 tuổi">Dưới 25 tuổi (Khởi sinh học nghiệp - Tiền Vận)</option>
                  <option value="25 - 45 tuổi">25 - 45 tuổi (Lập thân hành sự - Trung Vận cát hung)</option>
                  <option value="Trên 45 tuổi">Trên 45 tuổi (Tích lũy bồi thọ - Hậu Vận viên mãn)</option>
                </select>
              </div>

              {/* Ngũ khuyết chưởng hình (Palm element structure) */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-[#a1a1aa] font-sans block">
                  Cơ Thiết Ngũ Hành (Chưởng diện)
                </label>
                <select
                  value={palmType}
                  onChange={(e) => setPalmType(e.target.value)}
                  className="w-full bg-[#121318] text-xs font-sans p-2 rounded-none border border-[#c4a46d1a] focus:border-[#c4a46d] outline-none text-[#e2e2d5]"
                >
                  <option value="Tự động đoán định">Tự động quét đo (Bản mệnh tự nhiên)</option>
                  <option value="Kim Hình (Chưởng vuông chắc chắn)">Kim Hình (Dầy rát, vuông vức - Tài vận kiên định)</option>
                  <option value="Mộc Hình (Ngón tay thon dài)">Mộc Hình (Thanh khiết, thon dài - Trí tuệ thâm viễn)</option>
                  <option value="Thủy Hình (Bàn tay dẹt mềm mại)">Thủy Hình (Thời thượng, múp tròn - Linh hoạt thương lộ)</option>
                  <option value="Hỏa Hình (Ngón thon nhọn hồng sắc)">Hỏa Hình (Sắc nhọn, hồng thắm - Nhiệt huyết cao chí)</option>
                  <option value="Thổ Hình (Lòng bàn tay dầy cứng cáp)">Thổ Hình (Chắc nịch, sần sùi - Tăng phước vạn lộc)</option>
                </select>
              </div>

              {/* Palm skin thickness */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-[#a1a1aa] font-sans block">
                  Đàn Lực Chất Da (Chất Chưởng)
                </label>
                <select
                  value={palmThickness}
                  onChange={(e) => setPalmThickness(e.target.value)}
                  className="w-full bg-[#121318] text-xs font-sans p-2 rounded-none border border-[#c4a46d1a] focus:border-[#c4a46d] outline-none text-[#e2e2d5]"
                >
                  <option value="Tự động đoán định">Quét tự động (Phân tích mật độ cơ xương)</option>
                  <option value="Dày dặn đàn hồi ấm áp">Chưởng dày dặn đàn hồi ấm áp (An định phú quý dư giả)</option>
                  <option value="Mỏng dẻo mềm mại thanh cao">Chưởng mảnh dẻo mềm mại thanh cao (Trí lực sáng bừng)</option>
                  <option value="Khỏe khoắn chắc chắn bền vững">Chưởng khỏe khoắn chắc chắc chắn (Tâm tính kiên tài tự lực)</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-[#c4a46d11] mt-6">
              <div className="p-3 bg-[#c4a46d]/[0.02] border border-[#c4a46d11] text-center space-y-1">
                <p className="text-[10px] font-sans text-[#c4a46d] uppercase tracking-widest font-semibold">Tọa độ thời gian</p>
                <p className="text-[9px] font-mono text-[#8c8f94] tracking-wide">
                  Hệ quy chiếu: {new Date().toLocaleDateString('vi-VN')} ● Tiêu chuẩn 126 Cổ Bản
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Image Capture / Scan Center (colspan 7) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-12 xl:col-span-7 bg-[#0b0c0f]/85 border border-[#c4a46d22] p-5 sm:p-7 rounded-none flex flex-col justify-between backdrop-blur-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#c4a46d1a]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#c4a46d]" />
                  <h2 className="text-[#c4a46d] font-sans text-xs uppercase tracking-widest font-semibold">
                    Thâu Nhận Dữ Liệu Chưởng Khí
                  </h2>
                </div>
                
                {/* Instant Demo Match Button */}
                {!selectedImage && (
                  <button
                    type="button"
                    onClick={loadDemoPalm}
                    className="flex items-center gap-1.5 px-3 py-1 border border-[#c4a46d44] hover:border-[#c4a46d] transition-all bg-[#c4a46d08] text-[9px] font-sans text-[#c4a46d] uppercase tracking-wider"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Dùng bàn tay mẫu (Quét nhanh)</span>
                  </button>
                )}
              </div>

              {/* Upload area */}
              <div className="relative">
                <FileUpload 
                  onImageSelect={handleImageSelect} 
                  selectedImage={selectedImage} 
                  isUploading={isUploading} 
                  fallbackImages={fallbackImages}
                  heicConverting={heicConverting}
                />
                
                {/* Display Clear button if image exists */}
                {selectedImage && !isAnalyzing && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImageId(null);
                      setResult(null);
                    }}
                    className="absolute top-4 right-4 bg-black/80 hover:bg-black text-[10px] text-[#ff6b6b] border border-[#ff6b6b]/40 hover:border-[#ff6b6b] uppercase tracking-widest px-3 py-1.5 font-sans transition-all"
                  >
                    Bỏ ảnh
                  </button>
                )}
              </div>
            </div>

            {/* Analysis Controls and Step Indicator Log */}
            <div className="mt-6 pt-5 border-t border-[#c4a46d11]">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="w-full space-y-4 bg-[#07080a] border border-[#c4a46d11] p-4 font-mono text-[10px] sm:text-xs text-[#9c9da0]"
                  >
                    <div className="flex items-center justify-between text-[#c4a46d] font-sans uppercase tracking-widest font-semibold pb-2 border-b border-[#c4a46d11]">
                      <span>Trạng Thái Bộ Phân Tích Kính Thiên</span>
                      <span className="animate-pulse">ĐANG DUYỆT THƯ...</span>
                    </div>
                    
                    {/* Progress log lines */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[#22c55e] font-sans">[✔]</span>
                        <span>Đã bắt nhận tọa độ chưởng diện ({gender === 'Nam' ? 'Dương khí Tả' : 'Âm khí Hữu'})...</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={scanStep >= 1 ? "text-[#22c55e]" : "text-[#888] animate-pulse"}>
                          {scanStep >= 1 ? "[✔]" : "[✦]"}
                        </span>
                        <span className={scanStep >= 1 ? "text-white" : "text-[#777]"}>
                          Dò quét vĩ độ 126 cổ bối, đo đạc phân thế các Gò tinh tú ngôi vị...
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={scanStep >= 2 ? "text-[#22c55e]" : "text-[#888] animate-pulse"}>
                          {scanStep >= 2 ? "[✔]" : "[✦]"}
                        </span>
                        <span className={scanStep >= 2 ? "text-white" : "text-[#777]"}>
                          Tia rà mạng lưới Sinh Đạo Đôi & Giác quan thứ Sáu (Chữ thập X)...
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={scanStep >= 3 ? "text-[#22c55e]" : "text-[#888] animate-pulse"}>
                          {scanStep >= 3 ? "[✔]" : "[✦]"}
                        </span>
                        <span className={scanStep >= 3 ? "text-white" : "text-[#777]"}>
                          Giải mã đường Định Mệnh và Tụ tài đĩa Vân Thuyền Bát Nhã...
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={scanStep >= 4 ? "text-[#22c55e]" : "text-[#888] animate-pulse"}>
                          {scanStep >= 4 ? "[✔]" : "[✦]"}
                        </span>
                        <span className={scanStep >= 4 ? "text-white" : "text-[#777]"}>
                          Tích tụ khí tức ngũ hành chiết tự cát hung, xuất bản luận văn tối cao...
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#121318] h-1 relative overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 8.5, ease: "linear" }}
                        className="absolute inset-0 bg-[#c4a46d]"
                      />
                    </div>
                  </motion.div>
                ) : selectedImage ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={analyzePalm}
                      disabled={isAnalyzing}
                      className="w-full bg-[#c4a46d] hover:bg-[#d4b47d] text-black text-xs font-sans font-bold uppercase tracking-[0.3em] py-3.5 px-8 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-[#c4a46d]/10"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Luận Giải Cát Thư Ngay</span>
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-center py-4 bg-[#121318]/40 border border-dashed border-[#c4a46d11]">
                    <HelpCircle className="w-5 h-5 text-[#c4a46d]/40 mx-auto mb-2" />
                    <p className="text-[11px] font-sans text-[#8e8f96] uppercase tracking-wider">
                      Vui lòng thâu nhận ảnh lòng bàn tay hoặc nhấn mẫu phía trên để bắt đầu vận bàn
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mt-4 p-4 bg-red-950/30 border border-red-500/20 text-[#ff8f8f] text-xs text-center font-sans tracking-wide">
                  [Lỗi hệ thống]: {error}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Results Report Board */}
        <AnimatePresence>
          {result && (() => {
            const parsedSections = parseSections(result);
            const currentSection = parsedSections.find(s => s.id === activeSectionId) || parsedSections[0];
            
            const getTabLabel = (id: string, fullTitle: string) => {
              switch (id) {
                case "1": return "I. Tổng Quan & Các Gò";
                case "2": return "II. Sinh Đạo";
                case "3": return "III. Trí Đạo";
                case "4": return "IV. Tâm Đạo";
                case "5": return "V. Định Mệnh";
                case "6": return "VI. Khai Vận Tự Tâm";
                default: return fullTitle.length > 15 ? fullTitle.substring(0, 13) + "..." : fullTitle;
              }
            };

            return (
              <motion.div 
                ref={resultRef}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full scroll-mt-12 bg-[#0a0b0e] border border-[#c4a46d33] p-5 sm:p-10 relative"
              >
                {/* Ancient Parchment styling details */}
                <div className="absolute top-2 left-2 bottom-2 right-2 border border-[#c4a46d11] pointer-events-none" />
                <div className="absolute top-4 left-4 right-4 h-[1px] bg-[#c4a46d1a]" />
                <div className="absolute bottom-4 left-4 right-4 h-[1px] bg-[#c4a46d1a]" />
                
                {/* Visual Header */}
                <div className="flex flex-col items-center justify-center text-center mt-4 mb-10 space-y-3 relative z-10">
                  <span className="text-[10px] font-sans text-[#c4a46d] tracking-[0.4em] uppercase font-bold">
                    CELESTIAL REPORT CENTER
                  </span>
                  
                  <h3 className="text-2xl sm:text-3xl font-light text-white tracking-widest uppercase">
                    Bản Luận Mệnh Chiêm Tinh Thư
                  </h3>
                  
                  <div className="h-[1px] w-24 bg-[#c4a46d]/40 mx-auto" />
                  
                  {/* Metadata Calibration Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] font-sans tracking-wide">
                    <span className="bg-[#121318] text-[#c4a46d] border border-[#c4a46d33] px-3 py-1 uppercase rounded-full">
                      Cực tính: <strong>{gender}</strong>
                    </span>
                    <span className="bg-[#121318] text-[#c4a46d] border border-[#c4a46d33] px-3 py-1 uppercase rounded-full">
                      Diện chưởng: <strong>{handSide === 'left' ? 'Tả thủ (Căn)' : 'Hữu thủ (Hành)'}</strong>
                    </span>
                    <span className="bg-[#121318] text-[#c4a46d] border border-[#c4a46d33] px-3 py-1 uppercase rounded-full">
                      Phân kỳ: <strong>{ageBracket}</strong>
                    </span>
                    <span className="bg-[#121318] text-[#c4a46d] border border-[#c4a46d33] px-3 py-1 uppercase rounded-full">
                      Bản ngũ hành: <strong>{palmType.split(' ')[0]}</strong>
                    </span>
                  </div>
                </div>

                {/* Grid Split Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                  
                  {/* Left Column: Visual hand SVG with active target tracking */}
                  <div className="lg:col-span-12 xl:col-span-5 space-y-4 lg:sticky lg:top-8">
                    <PalmLineVisualizer 
                      activeSectionId={activeSectionId} 
                      selectedImage={selectedImage}
                      onSectionSelect={(id) => {
                        if (parsedSections.some(s => s.id === id)) {
                          setActiveSectionId(id);
                        }
                      }}
                    />
                    
                    {/* Visual hints and coordinates info */}
                    <div className="bg-[#0b0c0e] border border-[#c4a46d11] p-4 text-center text-[10px] text-[#a1a1aa] tracking-widest uppercase font-sans">
                      <p className="animate-pulse text-[#c4a46d] text-[9px] mb-1">
                        ● HỆ LIÊN KẾT ĐA ĐIỂM HOẠT ĐỘNG
                      </p>
                      Mẹo: Nhấp trực tiếp tâm Gò hoặc Chỉ tuyến trên chưởng họa để luân chuyển thẻ luận giải nhanh.
                    </div>
                  </div>

                  {/* Right Column: Markdown Scroll Reader */}
                  <div className="lg:col-span-12 xl:col-span-7 bg-[#0b0c0e]/90 border border-[#c4a46d22] p-5 sm:p-8 flex flex-col justify-between min-h-[500px] shadow-inner">
                    
                    <div>
                      {/* Interactive Tab Navigation */}
                      <div className="flex flex-row overflow-x-auto gap-1 border-b border-[#c4a46d11] pb-2 mb-8 no-scrollbar scroll-smooth">
                        {parsedSections.map((sec) => (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => {
                              setActiveSectionId(sec.id);
                            }}
                            className={`px-3.5 py-2.5 text-[9px] sm:text-[10px] uppercase tracking-widest font-sans border-b-2 transition-all whitespace-nowrap ${
                              activeSectionId === sec.id
                                ? "bg-[#c4a46d15] text-[#c4a46d] border-b-[#c4a46d] font-semibold"
                                : "text-[#7e8085] border-b-transparent hover:text-white hover:bg-white/[0.02]"
                            }`}
                          >
                            {getTabLabel(sec.id, sec.title)}
                          </button>
                        ))}
                      </div>

                      {/* Active Text segment displaying beautiful typography */}
                      <div className="min-h-[300px]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeSectionId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="markdown-body max-w-none text-left text-xs sm:text-sm leading-relaxed text-[#c6c8cc]"
                          >
                            {currentSection ? (
                              <div className="space-y-6">
                                <div className="border-b border-[#c4a46d1a] pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <h4 className="text-[#c4a46d] font-sans font-light tracking-widest text-base sm:text-lg uppercase leading-normal">
                                    {currentSection.title}
                                  </h4>
                                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[#c4a46d]/40 shrink-0">
                                    PHẦN {currentSection.id} / {parsedSections.length}
                                  </span>
                                </div>
                                <div className="prose prose-invert prose-amber max-w-none selection:bg-[#c4a46d55]">
                                  <ReactMarkdown>{currentSection.content}</ReactMarkdown>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-400">Chọn một chương ở phía trên để tiếp tục đọc cổ bản.</p>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Step Card controls footer */}
                    <div className="flex items-center justify-between mt-12 pt-5 border-t border-[#c4a46d11]">
                      <button
                        type="button"
                        disabled={parsedSections.findIndex(s => s.id === activeSectionId) === 0}
                        onClick={() => {
                          const currentIndex = parsedSections.findIndex(s => s.id === activeSectionId);
                          if (currentIndex > 0) {
                            setActiveSectionId(parsedSections[currentIndex - 1].id);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-[#c4a46d22] hover:border-[#c4a46d] text-[#c4a46d] text-[10px] uppercase tracking-widest transition-all disabled:opacity-10 disabled:cursor-not-allowed hover:bg-[#c4a46d0a]"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Chương Trước</span>
                      </button>
                      
                      <span className="text-[10px] font-mono text-[#5b5d63] tracking-widest">
                        PHÂN ĐỌC: {parsedSections.findIndex(s => s.id === activeSectionId) + 1} / {parsedSections.length}
                      </span>

                      <button
                        type="button"
                        disabled={parsedSections.findIndex(s => s.id === activeSectionId) === parsedSections.length - 1}
                        onClick={() => {
                          const currentIndex = parsedSections.findIndex(s => s.id === activeSectionId);
                          if (currentIndex < parsedSections.length - 1) {
                            setActiveSectionId(parsedSections[currentIndex + 1].id);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#c4a46d] text-black font-semibold text-[10px] uppercase tracking-widest transition-all disabled:opacity-10 disabled:cursor-not-allowed hover:bg-[#d4b47d]"
                      >
                        <span>Chương Tiếp</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                  </div>

                </div>

                <div className="mt-12 text-center text-[10px] tracking-[0.3em] uppercase text-[#47494f] font-sans">
                  <p>AI Engine v5.1.0 ● Độc Quyên Chưởng Pháp Chẩn Đoán</p>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

      </main>
    </div>
  );
}
