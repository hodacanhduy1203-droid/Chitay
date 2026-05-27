import { motion } from "motion/react";

interface PalmLineVisualizerProps {
  activeSectionId: string | null;
  onSectionSelect?: (id: string) => void;
  selectedImage?: string | null;
}

export function PalmLineVisualizer({ activeSectionId, onSectionSelect, selectedImage }: PalmLineVisualizerProps) {
  // Map sections: 
  // "1" -> Overall/Mounts (Các Gò)
  // "2" -> Sinh Đạo & Sinh Đạo Đôi (Life Lines)
  // "3" -> Trí Đạo & Chữ Thập X (Head Line & Mystic Cross)
  // "4" -> Tâm Đạo & Gạch Trở Ngại (Heart Line & Rahu Lines)
  // "5" -> Định Mệnh & Thuyền Bát Nhã (Fate Line & Prajna Boat)
  // "6" -> Tu tâm / Advice

  const activeId = activeSectionId || "1";

  // Helper to determine styling of lines
  const getLineStyles = (lineId: string) => {
    const isActive = activeId === lineId;
    const isAll = activeId === "6" || activeId === "all";
    
    if (isActive) {
      return {
        stroke: "#ef4444", // Bright Crimson Red
        strokeWidth: 4.5,
        filter: "drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.95))",
        opacity: 1,
      };
    } else if (isAll) {
      return {
        stroke: "#c4a46d", // Golden Harmonized
        strokeWidth: 2.5,
        filter: "drop-shadow(0px 0px 4px rgba(196, 164, 109, 0.5))",
        opacity: 0.8,
      };
    } else {
      return {
        stroke: "#c4a46d",
        strokeWidth: 1.8,
        opacity: 0.25,
      };
    }
  };

  // Helper to determine style of Mounts
  const isMountsActive = activeId === "1";

  // Golden hand outline path tailored to match either default SVG or real hand photo perfectly
  const handOutlinePath = selectedImage 
    ? "M 110,385 C 90,350 80,310 65,280 C 50,250 30,225 35,200 C 40,175 62,185 78,215 C 88,235 92,245 98,245 C 100,245 92,160 100,55 C 102,40 120,40 122,55 C 124,110 122,190 125,225 Q 126,227 127,222 C 127,160 132,100 158,25 C 160,10 178,10 180,25 C 182,90 178,180 179,220 Q 180,223 181,222 C 181,160 186,105 208,42 C 210,27 226,27 228,42 C 230,105 224,190 225,225 Q 226,228 227,228 C 227,175 232,130 252,95 C 254,80 270,85 272,100 C 274,150 258,210 258,245 C 258,255 250,295 240,325 C 230,355 220,380 210,385 Z"
    : "M 100,380 C 70,365 60,325 50,290 C 40,270 24,250 20,230 C 15,210 25,195 38,200 C 50,205 65,220 76,238 C 82,248 84,242 84,215 C 84,175 74,115 78,90 C 80,75 98,75 100,90 C 102,105 102,175 104,195 C 104,200 108,200 108,195 C 108,160 112,95 116,70 C 118,55 138,55 140,70 C 142,95 140,160 142,195 C 142,200 146,200 146,195 C 146,160 152,100 156,80 C 158,65 178,65 180,80 C 182,100 180,165 182,198 C 182,203 186,203 186,198 C 186,170 192,125 195,110 C 197,95 215,95 217,110 C 219,125 215,185 215,215 C 215,230 230,240 235,260 C 250,285 255,315 250,345 C 245,375 220,385 200,380 Z";

  // Coordinates of celestial Mounts (Gò) - dynamically optimized to align precisely on correct hand anatomy
  const mounts = selectedImage ? [
    { id: "1_venus", name: "Gò Kim Tinh", cx: 100, cy: 310, rGlow: 32, desc: "Sức sống & Phúc thọ", labelYOffset: -24 },
    { id: "1_jupiter", name: "Gò Mộc Tinh", cx: 112, cy: 245, rGlow: 18, desc: "Chí hướng & Quyền lực", labelYOffset: -24 },
    { id: "1_saturn", name: "Gò Thổ Tinh", cx: 152, cy: 232, rGlow: 18, desc: "Nhẫn nại & Định mệnh", labelYOffset: -28 },
    { id: "1_sun", name: "Gò Thái Dương", cx: 198, cy: 235, rGlow: 18, desc: "Tài vận & Danh vọng", labelYOffset: -24 },
    { id: "1_mercury", name: "Gò Thủy Tinh", cx: 242, cy: 248, rGlow: 18, desc: "Thương mại & Giao tế", labelYOffset: -28 },
    { id: "1_moon", name: "Gò Nguyệt", cx: 222, cy: 325, rGlow: 32, desc: "Trực giác & Xuất ngoại", labelYOffset: -24 }
  ] : [
    { id: "1_venus", name: "Gò Kim Tinh", cx: 80, cy: 300, rGlow: 36, desc: "Sức sống & Phúc thọ", labelYOffset: -24 },
    { id: "1_jupiter", name: "Gò Mộc Tinh", cx: 92, cy: 212, rGlow: 20, desc: "Chí hướng & Quyền lực", labelYOffset: -14 },
    { id: "1_saturn", name: "Gò Thổ Tinh", cx: 130, cy: 206, rGlow: 20, desc: "Nhẫn nại & Định mệnh", labelYOffset: -28 },
    { id: "1_sun", name: "Gò Thái Dương", cx: 168, cy: 210, rGlow: 20, desc: "Tài vận & Danh vọng", labelYOffset: -14 },
    { id: "1_mercury", name: "Gò Thủy Tinh", cx: 206, cy: 216, rGlow: 20, desc: "Thương mại & Giao tế", labelYOffset: -28 },
    { id: "1_moon", name: "Gò Nguyệt", cx: 215, cy: 315, rGlow: 36, desc: "Trực giác & Xuất ngoại", labelYOffset: -24 }
  ];

  // Configured line curves - dynamic depending on if selectedImage is set
  const palmPaths = selectedImage ? {
    life: "M 104,260 C 122,272 135,315 115,372",
    head: "M 104,261 C 135,263 175,275 215,310",
    heart: "M 252,272 C 205,255 155,248 118,242",
    fate: "M 160,375 Q 155,300 152,235",
    doubleLife: "M 98,266 C 114,278 124,318 106,370",
    doubleLifeTextX: 70,
    doubleLifeTextY: 345,
    doubleLifeLine: "M 115,330 L 98,342 L 80,342",
    mysticCrossXX: 154,
    mysticCrossXY: 258,
    mysticCrossPath: "M 144,250 L 164,266 M 164,250 L 144,266",
    mysticCrossTextX: 200,
    mysticCrossTextY: 265,
    mysticCrossLine: "M 160,258 L 180,265 L 210,265",
    boatHull: "M 132,305 Q 158,328 184,305 Q 158,312 132,305 Z",
    boatMast: "M 158,308 L 158,286 L 174,296 Z",
    boatTextY: 342,
    rahuLife: "M 90,290 L 123,293",
    rahuHeart: "M 195,245 L 230,258",
    rahuHead: "M 130,260 L 160,272",
    rahuTextY: 175,
    rahuTextX: 205,
    rahuTextLine: "M 195,185 L 215,178"
  } : {
    life: "M 85,230 C 110,240 135,285 110,365",
    head: "M 85,232 C 120,232 165,245 210,290",
    heart: "M 230,230 C 185,215 130,210 100,205",
    fate: "M 145,365 Q 138,280 128,195",
    doubleLife: "M 80,238 C 100,248 120,288 98,362",
    doubleLifeTextX: 50,
    doubleLifeTextY: 325,
    doubleLifeLine: "M 103,310 L 80,322 L 65,322",
    mysticCrossXX: 135,
    mysticCrossXY: 225,
    mysticCrossPath: "M 125,217 L 145,233 M 145,217 L 125,233",
    mysticCrossTextX: 185,
    mysticCrossTextY: 412, // adjusted to fit space safely
    mysticCrossLine: "M 143,225 L 160,233 L 205,233",
    boatHull: "M 120,290 Q 148,315 176,290 Q 148,298 120,290 Z",
    boatMast: "M 148,294 L 148,272 L 164,282 Z",
    boatTextY: 325,
    rahuLife: "M 75,270 L 115,275",
    rahuHeart: "M 185,205 L 220,220",
    rahuHead: "M 115,235 L 145,250",
    rahuTextY: 145,
    rahuTextX: 195,
    rahuTextLine: "M 190,155 L 210,148"
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-[#0a0a0c] border border-[#c4a46d22] rounded-lg relative overflow-hidden backdrop-blur-md">
      {/* Mystical Background Ring */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[300px] h-[300px] rounded-full border border-[#c4a46d05] animate-[spin_80s_linear_infinite]" />
        <div className="w-[240px] h-[240px] rounded-full border border-dashed border-[#c4a46d0d] animate-[spin_120s_linear_infinite_reverse] absolute" />
      </div>

      <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4]">
        <svg 
          viewBox="0 0 300 400" 
          className="w-full h-full select-none"
        >
          <defs>
            <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="mount-glow-active" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
              <stop offset="35%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mount-glow-inactive" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c4a46d" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#c4a46d" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#c4a46d" stopOpacity="0" />
            </radialGradient>
            <clipPath id="hand-photo-clip">
              <rect x="15" y="48" width="270" height="338" rx="24" ry="24" />
            </clipPath>
          </defs>

          {/* Real Hand Image Background Overlay if available */}
          {selectedImage && (
            <g className="pointer-events-none">
              <image
                href={selectedImage}
                x="15"
                y="48"
                width="270"
                height="338"
                preserveAspectRatio="xMidYMid meet"
                clipPath="url(#hand-photo-clip)"
                className="opacity-80 transition-opacity duration-500"
                style={{
                  filter: "brightness(0.95) contrast(1.15) saturate(1.1)"
                }}
              />
              {/* Glowing decorative indicator around correct hand clip area */}
              <rect
                x="15"
                y="48"
                width="270"
                height="338"
                rx="24"
                ry="24"
                fill="none"
                stroke="#c4a46d"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
            </g>
          )}

          {/* Hand Outline - always visible as a guidance-reference overlay, fully clickable */}
          <motion.path
            d={handOutlinePath}
            fill="none"
            stroke={isMountsActive ? "#ef4444" : "#c4a46d"}
            strokeWidth="1.5"
            strokeOpacity={selectedImage ? (isMountsActive ? "0.6" : "0.35") : (isMountsActive ? "0.45" : "0.25")}
            className="transition-all duration-700 cursor-pointer"
            onClick={() => onSectionSelect?.("1")}
          />

          {/* Wrist Lines (Rasquettes) */}
          <path d={selectedImage ? "M 110,385 Q 160,392 210,385" : "M 100,383 Q 150,390 200,383"} fill="none" stroke="#c4a46d" strokeWidth="1" strokeOpacity={selectedImage ? "0.2" : "0.25"} />
          <path d={selectedImage ? "M 113,391 Q 160,398 207,391" : "M 103,389 Q 150,396 197,389"} fill="none" stroke="#c4a46d" strokeWidth="1" strokeOpacity={selectedImage ? "0.1" : "0.15"} />


          {/* ==================== PALM LINES (CORES) ==================== */}

          {/* Sinh Đạo (Life Line - Step 2) */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("2")}>
            <title>Đường Sinh Đạo - Nhấp để xem luận giải</title>
            {/* Wider hitarea for hover & click ease */}
            <path
              d={palmPaths.life}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
            />
            <motion.path
              d={palmPaths.life}
              fill="none"
              animate={getLineStyles("2")}
              transition={{ duration: 0.5 }}
              strokeLinecap="round"
              className="group-hover:stroke-[#ef4444] transition-colors"
            />
          </g>

          {/* Trí Đạo (Head Line - Step 3) */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("3")}>
            <title>Đường Trí Đạo - Nhấp để xem luận giải</title>
            <path
              d={palmPaths.head}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
            />
            <motion.path
              d={palmPaths.head}
              fill="none"
              animate={getLineStyles("3")}
              transition={{ duration: 0.5 }}
              strokeLinecap="round"
              className="group-hover:stroke-[#ef4444] transition-colors"
            />
          </g>

          {/* Tâm Đạo (Heart Line - Step 4) */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("4")}>
            <title>Đường Tâm Đạo - Nhấp để xem luận giải</title>
            <path
              d={palmPaths.heart}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
            />
            <motion.path
              d={palmPaths.heart}
              fill="none"
              animate={getLineStyles("4")}
              transition={{ duration: 0.5 }}
              strokeLinecap="round"
              className="group-hover:stroke-[#ef4444] transition-colors"
            />
          </g>

          {/* Định Mệnh (Fate Line - Step 5) */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("5")}>
            <title>Đường Định Mệnh - Nhấp để xem luận giải</title>
            <path
              d={palmPaths.fate}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
            />
            <motion.path
              d={palmPaths.fate}
              fill="none"
              animate={getLineStyles("5")}
              transition={{ duration: 0.5 }}
              strokeLinecap="round"
              className="group-hover:stroke-[#ef4444] transition-colors"
            />
          </g>


          {/* ==================== SPECIAL GLYPHS / TRAITS ==================== */}

          {/* 1. Đường Sinh Đạo Đôi (Double Life Line) - ID 2 */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("2")}>
            <title>Sinh Đạo Song Hành - Nhấp để xem tương hợp</title>
            <motion.path
              d={palmPaths.doubleLife}
              fill="none"
              animate={{
                stroke: activeId === "2" ? "#ef4444" : "#c4a46d",
                strokeWidth: activeId === "2" ? 3.5 : 1.5,
                opacity: activeId === "2" ? 1.0 : 0.35,
                filter: activeId === "2" ? "url(#glow-red)" : "none",
              }}
              transition={{ duration: 0.4 }}
              strokeDasharray={activeId === "2" ? "0" : "2,2"}
              strokeLinecap="round"
            />
            {activeId === "2" && (
              <g filter="url(#glow-red)">
                <text x={palmPaths.doubleLifeTextX} y={palmPaths.doubleLifeTextY} fill="#ef4444" fontSize="8" className="font-sans font-semibold tracking-wider">
                  SINH ĐẠO ĐÔI
                </text>
                <path d={palmPaths.doubleLifeLine} fill="none" stroke="#ef4444" strokeWidth="0.8" />
              </g>
            )}
          </g>

          {/* 2. Dấu chữ X (Chữ Thập Huyền Bí / Mystic Cross) - ID 3 */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("3")}>
            <title>Chữ Thập Huyền Bí - Trực giác tâm linh thấu thính</title>
            {/* Draw 'X' */}
            <motion.path
              d={palmPaths.mysticCrossPath}
              fill="none"
              animate={{
                stroke: activeId === "3" ? "#ef4444" : "#c4a46d",
                strokeWidth: activeId === "3" ? 3.5 : 1.5,
                opacity: activeId === "3" ? 1.0 : 0.4,
                filter: activeId === "3" ? "url(#glow-red)" : "none",
              }}
              transition={{ duration: 0.4 }}
              strokeLinecap="round"
            />
            {/* Circular boundary marker */}
            <motion.circle
              cx={palmPaths.mysticCrossXX}
              cy={palmPaths.mysticCrossXY}
              r="12"
              fill="none"
              animate={{
                stroke: activeId === "3" ? "#ef4444" : "#c4a46d",
                strokeWidth: activeId === "3" ? 1.5 : 0.8,
                opacity: activeId === "3" ? 0.8 : 0.2,
              }}
              strokeDasharray="3,3"
            />
            {activeId === "3" && (
              <g filter="url(#glow-red)">
                <text x={palmPaths.mysticCrossTextX} y={palmPaths.mysticCrossTextY} fill="#ef4444" fontSize="8" className="font-sans font-semibold tracking-wider" textAnchor="middle">
                  CHỮ THẬP HUYỀN BÍ (X)
                </text>
                <path d={palmPaths.mysticCrossLine} fill="none" stroke="#ef4444" strokeWidth="0.8" />
              </g>
            )}
          </g>

          {/* 3. Thuyền Bát Nhã (Prajna Boat) - ID 5 */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("5")}>
            <title>Vân Thuyền Bát Nhã - Tài cát dồi dào tụ bảo</title>
            
            {/* The Boat Vessel Hull */}
            <motion.path
              d={palmPaths.boatHull}
              animate={{
                fill: activeId === "5" ? "rgba(239, 68, 68, 0.15)" : "transparent",
                stroke: activeId === "5" ? "#ef4444" : "#c4a46d",
                strokeWidth: activeId === "5" ? 2.5 : 1.2,
                opacity: activeId === "5" ? 1.0 : 0.35,
                filter: activeId === "5" ? "url(#glow-red)" : "none",
              }}
              transition={{ duration: 0.4 }}
            />
            {/* Boat Mast / Sail rigging */}
            <motion.path
              d={palmPaths.boatMast}
              animate={{
                fill: activeId === "5" ? "rgba(196, 164, 109, 0.25)" : "transparent",
                stroke: activeId === "5" ? "#ef4444" : "#c4a46d",
                strokeWidth: activeId === "5" ? 1.5 : 0.8,
                opacity: activeId === "5" ? 1.0 : 0.3,
              }}
              transition={{ duration: 0.4 }}
            />
            {activeId === "5" && (
              <g filter="url(#glow-red)">
                <text x="148" y={palmPaths.boatTextY} fill="#ef4444" fontSize="8" className="font-sans font-semibold tracking-widest uppercase" textAnchor="middle">
                  VÂN THUYỀN BÁT NHÃ
                </text>
              </g>
            )}
          </g>

          {/* 4. Vân Cản / Các gạch ngang trở ngại (Rahu Lines) - ID 4 */}
          <g className="cursor-pointer group" onClick={() => onSectionSelect?.("4")}>
            <title>Các vệt gạch cản trở (Rahu Lines) - Tương quan thăng trầm hóa cát</title>
            
            {/* Rahu line Crossing Life Line */}
            <motion.path
              d={palmPaths.rahuLife}
              fill="none"
              animate={{
                stroke: activeId === "4" ? "#f97316" : "#c4a46d",
                strokeWidth: activeId === "4" ? 2.5 : 0.8,
                opacity: activeId === "4" ? 0.9 : 0.15,
                filter: activeId === "4" ? "url(#glow-orange)" : "none",
              }}
            />
            {/* Rahu line Crossing Heart Line */}
            <motion.path
              d={palmPaths.rahuHeart}
              fill="none"
              animate={{
                stroke: activeId === "4" ? "#f97316" : "#c4a46d",
                strokeWidth: activeId === "4" ? 2.5 : 0.8,
                opacity: activeId === "4" ? 0.9 : 0.15,
                filter: activeId === "4" ? "url(#glow-orange)" : "none",
              }}
            />
            {/* Rahu line Crossing Head Line */}
            <motion.path
              d={palmPaths.rahuHead}
              fill="none"
              animate={{
                stroke: activeId === "4" ? "#f97316" : "#c4a46d",
                strokeWidth: activeId === "4" ? 2.5 : 0.8,
                opacity: activeId === "4" ? 0.9 : 0.15,
                filter: activeId === "4" ? "url(#glow-orange)" : "none",
              }}
            />

            {activeId === "4" && (
              <g filter="url(#glow-orange)">
                <text x={palmPaths.rahuTextX} y={palmPaths.rahuTextY} fill="#f97316" fontSize="7.5" className="font-sans font-bold tracking-wider">
                  VÂN CẢN (RAHU LINES)
                </text>
                <path d={palmPaths.rahuTextLine} fill="none" stroke="#f97316" strokeWidth="0.8" />
              </g>
            )}
          </g>


          {/* ==================== CELESTIAL MOUNTS (CÁC GÒ DIỆN RỘNG) ==================== */}
          {mounts.map((mnt) => {
            const isTargetHighlight = activeId === "1";
            return (
              <g 
                key={mnt.id} 
                className="transition-all duration-500 cursor-pointer"
                onClick={() => onSectionSelect?.("1")}
              >
                <title>{mnt.name}: {mnt.desc} (Ghi chú chi tiết)</title>

                {/* Pulsing Regional Glow Area */}
                <motion.circle 
                  cx={mnt.cx} 
                  cy={mnt.cy} 
                  r={mnt.rGlow} 
                  fill={isTargetHighlight ? "url(#mount-glow-active)" : "url(#mount-glow-inactive)"} 
                  animate={{
                    scale: isTargetHighlight ? [0.95, 1.12, 0.95] : [1.0, 1.05, 1.0]
                  }}
                  transition={{
                    duration: isTargetHighlight ? 2.5 : 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ transformOrigin: `${mnt.cx}px ${mnt.cy}px` }}
                  className="transition-all duration-500"
                />

                {/* Subtle core accent to anchor the celestial focus */}
                <circle
                  cx={mnt.cx}
                  cy={mnt.cy}
                  r="3.5"
                  fill={isTargetHighlight ? "#ef4444" : "#c4a46d"}
                  fillOpacity={isTargetHighlight ? "0.9" : "0.25"}
                  className="transition-all duration-500"
                  filter={isTargetHighlight ? "url(#glow-red)" : "none"}
                />

                {/* Beautiful labels ALWAYS softly visible so users can identify at all times */}
                <text 
                  x={mnt.cx} 
                  y={mnt.cy + mnt.labelYOffset} 
                  textAnchor="middle" 
                  fill={isTargetHighlight ? "#ffefda" : "#c4a46d"} 
                  fontSize="8" 
                  className="font-sans font-semibold tracking-widest uppercase pointer-events-none" 
                  fillOpacity={isTargetHighlight ? "1.0" : "0.7"}
                  style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.9)" }}
                >
                  {mnt.name}
                </text>

                {/* Tiny subtitle showing planetary attributes during active review */}
                {isTargetHighlight && (
                  <text 
                    x={mnt.cx} 
                    y={mnt.cy + (mnt.id.includes("venus") || mnt.id.includes("moon") ? 22 : 14)} 
                    textAnchor="middle" 
                    fill="#a1a1aa" 
                    fontSize="6.5" 
                    className="font-sans tracking-wide uppercase pointer-events-none"
                    fillOpacity="0.9"
                  >
                    {mnt.desc}
                  </text>
                )}
              </g>
            );
          })}


          {/* ==================== SCREEN INTERACTIVE DISPLAY LABELS ==================== */}
          {activeId === "2" && (
            <g filter="url(#glow-red)">
              <text x="150" y="35" textAnchor="middle" fill="#ef4444" fontSize="11" className="font-sans font-bold tracking-[0.25em] uppercase">
                SINH ĐẠO & SINH ĐẠO ĐÔI
              </text>
              <line x1="80" y1="42" x2="220" y2="42" stroke="#ef4444" strokeWidth="1.2" />
            </g>
          )}

          {activeId === "3" && (
            <g filter="url(#glow-red)">
              <text x="150" y="35" textAnchor="middle" fill="#ef4444" fontSize="11" className="font-sans font-bold tracking-[0.25em] uppercase">
                TRÍ ĐẠO & CHỮ THẬP HUYỀN BÍ
              </text>
              <line x1="80" y1="42" x2="220" y2="42" stroke="#ef4444" strokeWidth="1.2" />
            </g>
          )}

          {activeId === "4" && (
            <g filter="url(#glow-red)">
              <text x="150" y="35" textAnchor="middle" fill="#f97316" fontSize="11" className="font-sans font-bold tracking-[0.25em] uppercase">
                TÂM ĐẠO & VÂN CẢN TRỞ NGẠI
              </text>
              <line x1="80" y1="42" x2="220" y2="42" stroke="#f97316" strokeWidth="1.2" />
            </g>
          )}

          {activeId === "5" && (
            <g filter="url(#glow-red)">
              <text x="150" y="35" textAnchor="middle" fill="#ef4444" fontSize="11" className="font-sans font-bold tracking-[0.25em] uppercase">
                ĐƯỜNG ĐỊNH MỆNH & THUYỀN BÁT NHÃ
              </text>
              <line x1="60" y1="42" x2="240" y2="42" stroke="#ef4444" strokeWidth="1.2" />
            </g>
          )}

          {(activeId === "6" || activeId === "all") && (
            <g filter="url(#glow-gold)">
              <text x="150" y="35" textAnchor="middle" fill="#c4a46d" fontSize="12" className="font-sans font-bold tracking-[0.2em] uppercase">
                CÁT TƯỜNG KHAI VẬN THƯ
              </text>
              <line x1="80" y1="42" x2="220" y2="42" stroke="#c4a46d" strokeWidth="1" />
            </g>
          )}
        </svg>
      </div>

      <div className="text-center mt-3 px-2 max-w-xs transition-opacity duration-300">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#c4a46d] font-bold">
          {activeId === "1" ? "Tổng Quan Bản Mệnh & Các Gò Khí Sắc" :
           activeId === "2" ? "Đường Sinh Đạo & Sinh Đạo Song Hành" :
           activeId === "3" ? "Đường Trí Đạo & Chữ Thập Huyền Bí (X)" :
           activeId === "4" ? "Đường Tâm Đạo & Vân Cản Rahu Trở Ngại" :
           activeId === "5" ? "Đường Định Mệnh & Thuyền Bát Nhã Khai Vận" :
           "Cát Tường Khai Vận - Tu Tâm Tăng Phúc"}
        </p>
        <p className="text-[10px] text-[#a1a1aa] mt-1.5 tracking-wider leading-relaxed">
          {activeId === "1" ? "Nhấp trên chưởng các gò để xem định vị cát sắc bản mệnh ngũ hành cơ bản." :
           activeId === "2" ? "Đường Sinh Đạo Đôi hỗ trợ sinh mệnh phụ chủ trường trường thọ phì nhiêu cứu khốn." :
           activeId === "3" ? "Chữ Thập X giữa dòng Trí - Tâm chỉ giác quan thứ sáu, tổ tiên thần Phật hộ độ." :
           activeId === "4" ? "Những vệt gạch ngang (vân cản Rahu) cảnh báo thăng trầm để hành xử thận trọng dưỡng cát." :
           activeId === "5" ? "Vách kho tài phú Vân Thuyền Bát Nhã tụ tài, hứa hẹn thăng tiến phát đại tài đại lộc." :
           "Tướng tùy tâm dời, mưu thiện trừ tai, chuyển hung hóa cát nhờ trí đức viên mãn tự tâm."}
        </p>
      </div>
    </div>
  );
}
