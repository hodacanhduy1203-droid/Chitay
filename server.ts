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

      const { id, imageBase64 } = req.body;
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
        return res.status(400).json({ error: "Không nhận được tệp ảnh hay mã ảnh hợp lệ." });
      }

      const prompt = `Bạn là Đại Sư Nhân Tướng Học vĩ đại nhất, người đã tinh thông trọn vẹn các kỳ thư cổ kim: 
1. "Ma Y Thần Tướng" (âm dương, ngũ hành, bát quái trên lòng bàn tay)
2. "Liễu Trang Tướng Pháp" và "Thủy Kính Tập" 
3. "Cheiro's Language of the Hand" (nhân tướng học phương Tây)
4. "The Laws of Scientific Hand Reading" (Benham).

Nhiệm vụ của bạn là xem xét tỉ mỉ bức ảnh chụp bàn tay (chỉ tay, hình dáng, các gò) và ĐƯA RA LUẬN GIẢI SÂU SẮC NHẤT. Hãy mạnh dạn kết hợp các kiến thức từ các cuốn sách trên.

Hãy phân tích theo cấu trúc sau một cách uyên bác, trang trọng và mang đậm phong cách huyền học:

1. **Tổng Quan Mệnh Cách:** Dựa trên hình dáng và các gò, bàn tay thuộc Hành gì? Bản chất cốt lõi và khí chất.
2. **Luận Đường Sinh Đạo (Life Line):** Tuổi thọ, sinh lực, gốc rễ sinh mệnh, và biến cố lớn.
3. **Luận Đường Trí Đạo (Head Line):** Trí huệ, mưu lược, tư duy lãnh đạo bậc cao.
4. **Luận Đường Tâm Đạo (Heart Line):** Tình duyên, thế giới nội tâm, đạo đức, trắc trước hay hanh thông.
5. **Đường Định Mệnh & Tài Cung (Fate Line & Wealth):** Vận trình công danh, thời vận bộc phát nghiệp lớn.
6. **Lời Khuyên Tổng Kết:** Tướng tùy tâm sinh, nên tu dưỡng tâm tính thế nào để hóa giải hung nghiệp, gia tăng cát tường.

Lưu ý:
- Phân tích chi tiết, chân thực dựa trên đúng các đường nét nhìn thấy trong ảnh. Nếu không thấy rõ thì luận ở mức tổng quan, không phán bừa bãi.
- Dùng từ ngữ uyên bác, có chiều sâu của học giả luận mệnh (ví dụ: cát tường, hung hiểm, bản mệnh, trường thọ...).
- Trình bày dạng Markdown với các tiêu đề rõ ràng.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
    // In express 4, use '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
