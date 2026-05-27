import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase the limit for base64 image uploads
  app.use(express.json({ limit: '50mb' }));

  // Initialize Gemini
  let ai: GoogleGenAI;
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (error) {
    console.warn("Failed to initialize GoogleGenAI. Did you provide GEMINI_API_KEY?");
  }

  // Simple in-memory image cache to bypass sandbox / CSP constraints for data: and blob: URLs
  const imageCache = new Map<string, { buffer: Buffer; mimeType: string }>();

  // Endpoint to cache base64 image and return a safe relative URL path
  app.post("/api/upload-image", (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Không tìm thấy dữ liệu ảnh." });
      }

      const mimeTypeMatch = imageBase64.match(/^data:(.*?);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64Data = imageBase64.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const id = Math.random().toString(36).substring(2, 15);
      imageCache.set(id, { buffer, mimeType });

      // Keep cache size bounded
      if (imageCache.size > 50) {
        const firstKey = imageCache.keys().next().value;
        if (firstKey) imageCache.delete(firstKey);
      }

      res.json({ id, url: `/api/image/${id}` });
    } catch (err: any) {
      console.error("Error caching image:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to serve cached image directly as a safe HTTP relative asset
  app.get("/api/image/:id", (req, res) => {
    const { id } = req.params;
    const img = imageCache.get(id);
    if (!img) {
      return res.status(404).send("Hình ảnh không tồn tại hoặc đã hết hạn.");
    }
    res.setHeader("Content-Type", img.mimeType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(img.buffer);
  });

  app.post("/api/analyze-palm", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API is not initialized. Please ensure GEMINI_API_KEY is securely configured." });
      }

      const { id, imageBase64, gender, ageBracket, handSide, palmType, palmThickness } = req.body;
      let mimeType = "image/jpeg";
      let base64Data = "";

      if (id) {
        const img = imageCache.get(id);
        if (!img) {
          return res.status(400).json({ error: "Phiên làm việc của ảnh đã hết hạn. Vui lòng tải lại ảnh." });
        }
        mimeType = img.mimeType;
        base64Data = img.buffer.toString("base64");
      } else if (imageBase64) {
        const mimeTypeMatch = imageBase64.match(/^data:(.*?);base64,/);
        mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
        base64Data = imageBase64.replace(/^data:.*?;base64,/, "");
      } else {
        return res.status(400).json({ error: "Không nhận dạng được dữ liệu hình ảnh bản mệnh." });
      }

      let profileContext = "";
      if (gender || ageBracket || handSide || palmType || palmThickness) {
        profileContext = `\n\n[THÔNG TIN THIẾT LẬP CHIÊM TINH BAN ĐẦU CỦA ĐỒNG SỰ CHỦ]:
- Giới tính (Luận Âm Dương): ${gender || "Chưa chọn (Rà quét sinh trắc)"} ${gender === "Nam" ? "-> Ứng dụng quy luật 'Nam tả Nữ hữu' cổ học phương Đông (Tay trái tàng ẩn căn khí tổ nghiệp tiền vận, tay phải kiến tạo hậu vận)." : gender === "Nữ" ? "-> Ứng dụng quy luật 'Nam tả Nữ hữu' cổ học phương Đông (Tay phải tàng ẩn căn khí bản mệnh tiền vận, tay trái định lượng hậu vận cát tinh)." : ""}
- Niên kỷ thế cục (Độ tuổi): ${ageBracket || "Chưa chọn (Phân kỳ sinh học)"}
- Định hướng Chưởng diện (Xác định tay): ${handSide === "left" ? "Bàn tay Trái" : handSide === "right" ? "Bàn tay Phải" : "Tự động phân giải"}
- Bản mệnh Chưởng hình (Ngũ Hành lòng bàn tay): ${palmType || "Tự động dò quét đặc tính"}
- Đàn lực sắc trạch (Độ dày mỏng chất da): ${palmThickness || "Tự động phân tích sâu"}
Hãy khéo léo kết hợp đặc tính này để hiệu chuẩn chính xác đồ hình chỉ tay niên hạn bộc tài lộc và phước thọ gặt hái của họ.`;
      }

      const prompt = `Bạn là Đại Sư Nhân Tướng Học lỗi lạc và uyên bác nhất thế gian, người đã nghiên cứu sâu sắc và tinh thông trọn vẹn thập đại kỳ thư về xem tướng tay Đông Tây cổ kim:
1. "Ma Y Thần Tướng" (Ngũ Hành sinh khắc, Bát Quái phân định trên lòng bàn tay)
2. "Thần Tướng Toàn Biên" & "Thủy Kính Tập" (Vận hành mạng mạch qua sắc diện lòng bàn tay)
3. "Liễu Trang Tướng Pháp" (Chỉ tay định cát hung)
4. "Cheiro's Language of the Hand" (Trường phái phân tích sinh trắc học chỉ tay phương Tây của Bá tước Cheiro)
5. "The Laws of Scientific Hand Reading" của William G. Benham.

Nhiệm vụ của bạn là xem xét cực kỳ tỉ mỉ và luận giải chi tiết bức ảnh chụp lòng bàn tay này. Hãy hòa quyện giữa học thuật thần bí của Phương Đông (Âm Dương Ngũ Hành, các cung Bát Quái trên lòng bàn tay) và độ chính xác phân tích hình học sinh trắc của Phương Tây để đưa ra bản Cát Hung Thư luận đoán vận mệnh hoàn mỹ nhất. ${profileContext}

Đặc biệt, bạn cần phân tích toàn diện các đặc điểm và dấu hiệu linh nghiệm sau:
- **Các Gò trong lòng bàn tay:** Hãy xác định rõ trạng thái vồng cao, đầy đặn hay trũng dẹt của các gò tinh tú:
  - **Gò Kim Tinh** (nằm ở dưới ngón tay cái, được bao bọc bởi sinh đạo): Chủ về sinh lực dồi dào, thọ mệnh dẻo dai, phóng khoáng gia đạo, tình yêu thương vạn vật.
  - **Gò Mộc Tinh** (nằm dưới ngón tay trỏ): Đạo chí hướng tự cường, khát vọng công danh, uy quyền chí tôn tài cát bộc phát.
  - **Gò Thổ Tinh** (nằm dưới ngón tay giữa): Bản lĩnh tự lập độc hành, kiên định định mệnh, vượt muôn trùng sóng gió nhân quả bền vững.
  - **Gò Thái Dương** (nằm dưới ngón tay áp út): Hàn thử nghệ thuật xuất chúng, danh tiếng, hào quang và tài vận hưng vượng.
  - **Gò Thủy Tinh** (nằm dưới ngón tay út): Trí mưu thương mại, tài ngoại giao giao tế sắc sảo, thích ứng biến hóa linh động.
  - **Gò Nguyệt** (nằm ở rìa ngoài bàn tay bên dưới, đối diện gò Kim Tinh): Trực giác tâm linh, sức sáng tạo vô cực, duyên xuất ngoại lữ hành đắc tài đắc lộc.
- **Dấu chữ X (Mystic Cross):** Chữ thập huyền bí nằm ở thung lũng lòng bàn tay giữa đường Trí Đạo và đường Tâm Đạo. Tướng này đại diện cho giác quan thứ 6 nhạy bén phi thường, tinh thần thấu thị, tôn kính tâm linh, được tổ tiên bồi đắp và Thần Phật che chở tuyệt đối giúp tai qua nạn khỏi hiển hách.
- **Hình Thuyền Bát Nhã (Vân Thuyền Cứu Thế / Thuyền Tụ Bảo):** Bản chỉ tay cổ thư đan xen thành dòng thuyền tài lộc. Báo hiệu trung vận lập thân cực kỳ nhọc nhằn dấn thân hiểm nguy, nhưng nhờ tự lực cường đại mà hậu vận thu quả ngọt lớn lao, sở hữu điền trang, vàng bạc sung túc trọn vẹn, trọn đời làm việc nghĩa tích thiện vô lượng tăng phúc.
- **Đường Sinh Đạo Đôi (Sinh Đạo Song Hành / Quý Nhân Chỉ):** Một đường chỉ chạy song song mọc ngay phía trong Sinh Đạo chính, củng cố sinh khí bản mệnh vững như bàn thạch. Gặp hung hóa cát, thăng trầm bệnh tật tiêu tan ngoạn mục nhờ lực gia trì vô hình phì nhiêu gia hộ.
- **Các đường gạch cản trở (vân cản cản phá dọc ngang / Rahu Lines):** Các vệt cắt sắc sảo mảnh ngang chọc sườn các đường chính, đại biểu cho những hạn khúc quanh thị phi cát hung của cuộc đời dời đổi ở các mốc tuổi nhất định nhằm tôi luyện tâm tính.

Hãy cấu trúc bài luận đoán theo đúng định dạng gồm 6 phần lớn (bắt đầu bằng tiêu đề bậc 2 "## [Số]. ") để hệ thống có thể chia menu thẻ rõ ràng:

## 1. 🌌 Tổng Quan & Vận Khí Các Gò
- Đưa ra nhận xét tổng thể nhất bản mệnh (Hình kim, mộc, thủy, hỏa, thổ của bàn tay, chưởng dày hay mỏng, độ đàn hồi của chưởng khí và tinh khí).
- Luận giải chi tiết sự nhô tràn hay lõm dẹt của **Gò Kim Tinh, Gò Mộc Tinh, Gò Thổ Tinh, Gò Thái Dương, Gò Thủy Tinh, Gò Nguyệt** để biết rõ từng gò cát tường mang vai trò gì đối với số mệnh, giải thích chi tiết vị trí mỗi gò để người đọc tự soi thấu dễ nắm bắt.

## 2. 📿 Chỉ Tay Sinh Đạo & Sinh Đạo Song Hành
- Đoán định dộ dài, sâu, liên tục của đường Sinh Đạo chính.
- Tầm soát, chỉ điểm rõ sự xuất hiện của **Sinh Đạo Đôi (Quý Nhân Chỉ / Sinh Mệnh Phụ)** hỗ trợ bản thể đề kháng tật ách, mang ý nghĩa gia thọ và phước duyên lớn khi lâm nạn.

## 3. 🧠 Chỉ Tay Trí Đạo & Dấu Chữ X Huyền Bí
- Phân tích chi tiết đường Trí Đạo (chiều dài, độ sâu sắc lẹm hay xô lệch, chỉ rõ sự hanh thông của ý chí và thiên tài tài mưu).
- Săm soi chính xác lòng bàn tay xem có hiển lộ **Dấu chữ X (Chữ Thập Huyền Bí / Mystic Cross)** ở khoảng giữa Trí Đạo và Tâm Đạo hay không. Phân giải năng lực trực cảm thần sầu, cái đầu tinh anh đức độ tâm linh sâu đậm.

## 4. 💖 Chỉ Tay Tâm Đạo & Đường Gạch Ngang Trở Ngại
- Luận thế đi của đường Tâm Đạo (vắt ngang lòng bàn tay hay chếch cao nhẹ nhàng), độ dung hòa của khí phách nam nữ thế sự, tơ duyên thăng trầm tình ái.
- Đặc biệt phân tích sâu sắc các **vân cản ngang trở ngại (Rahu Lines / Gạch cản phá)** cắt xéo dòng năng lượng chính để tiên đề hóa giải thế nhân quả tình cảm gia quyến êm đềm.

## 5. 🔱 Đường Định Mệnh & Vân Thuyền Bát Nhã Tụ Tài
- Đánh giá đường Định Mệnh (Fate Line) có vươn thẳng từ đáy cổ tay hướng tới gò Thổ Tinh nâng đỡ sự phát đạt quan lộc không.
- Tìm kiếm phân tích bảo vật **Thuyền Bát Nhã (Vân Thuyền Cứu Thế / Thuyền Tụ Bảo)** đọng lại giữa các gạch tay. Luận về gia đạo trung niên tích phúc vạn dặm và hậu vận giàu có thịnh an dồi dào tài mộc.
- Phân giải vân chữ M quyền quý hoặc vân chữ Nhất trí cao thủ nếu có xuất hiện.

## 6. 🕊️ Phương Pháp Chuyển Hung Hóa Cát & Hành Trình Tăng Phúc
- Khẳng định triết lý nhân văn bất hủ: *"Tâm sinh tướng diệt, đức năng thắng số"*.
- Cách hóa giải các vệt gạch ngang cản phá bằng công phu dưỡng khí, hành vi từ ái bồi phúc.
- Rèn luyện thân mộc dưỡng thần để kích hoạt cát vân tối quý (Sinh Đạo Đôi, Thuyền Bát Nhã, Chữ Thập) đơm hoa kết trái cát tường.

---

*Lưu ý quan trọng cho Đại Sư:*
- Luận giải phải tôn trọng người xem, bám sát các chi tiết có thể thấy chân thực qua ảnh chụp lòng bàn tay của họ.
- Hành văn tôn nghiêm, uyên học, thấu đạt lòng người, luôn kết hợp lối mở rộng cát khí bằng nhân cách để chủ nhân hân hoan an lạc bồi phúc.*`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error analyzing palm:", error);
      res.status(500).json({ error: error.message || "An error occurred during analysis." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
