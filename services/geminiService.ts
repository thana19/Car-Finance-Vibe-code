import { GoogleGenAI, Type } from "@google/genai";

export interface CarInfo {
  brand: string;
  model: string;
  trim: string;
  price: number;
  imageUrl?: string | null;
  brandLogoUrl?: string | null;
}

export const searchCars = async (carModel: string): Promise<CarInfo[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `คุณคือ AI assistant สำหรับแอปพลิเคชันคำนวณไฟแนนซ์รถยนต์ในประเทศไทย
ภารกิจของคุณคือการวิเคราะห์คำค้นหาของผู้ใช้: "${carModel}" และส่งคืนข้อมูลรถยนต์ที่เกี่ยวข้องในรูปแบบ JSON

**คำสั่ง:**
1.  ค้นหารุ่นรถยนต์ที่เกี่ยวข้องกับคำค้นหา ไม่เกิน 5 รายการ
2.  **เป้าหมายหลักคือการหารูปภาพรถยนต์และโลโก้ยี่ห้อให้ได้เสมอ** ไม่ต้องกังวลเรื่องคุณภาพที่สมบูรณ์แบบ ขอแค่เป็นรูปที่เกี่ยวข้องและชัดเจนก็เพียงพอ
3.  สำหรับรถแต่ละคัน ให้ส่งข้อมูลกลับมาตามโครงสร้าง JSON ที่กำหนดเท่านั้น

**โครงสร้างข้อมูลที่ต้องการ (สำหรับรถแต่ละคัน):**
*   \`brand\`: ยี่ห้อรถยนต์ (ภาษาไทยหรืออังกฤษ)
*   \`model\`: รุ่นรถยนต์
*   \`trim\`: รุ่นย่อย (ถ้ามี) หากไม่มี ให้ใส่เป็นสตริงว่าง ""
*   \`price\`: ราคาประเมินในประเทศไทย (หน่วยเป็นบาท, ตัวเลขเท่านั้น)
*   \`imageUrl\`: URL ของรูปภาพรถยนต์
    *   พยายามหารูปภาพภายนอกของรถยนต์ที่ชัดเจนและตรงกับรุ่นที่ระบุให้มากที่สุด
    *   ไม่จำเป็นต้องมาจากเว็บไซต์ทางการ ขอแค่เป็นรูปที่ดูดีและสื่อถึงรถรุ่นนั้นๆ ได้
    *   หากไม่สามารถหารูปที่ตรงรุ่นได้จริงๆ ให้หารูปของรุ่นที่ใกล้เคียงที่สุดแทน
    *   ถ้าหาไม่ได้จริงๆ เท่านั้นจึงจะส่งค่าเป็น \`null\`
*   \`brandLogoUrl\`: URL ของโลโก้ยี่ห้อรถยนต์
    *   พยายามหาโลโก้ที่ชัดเจนของยี่ห้อรถยนต์
    *   ไม่จำเป็นต้องมีพื้นหลังโปร่งใส
    *   ถ้าหาไม่ได้จริงๆ เท่านั้นจึงจะส่งค่าเป็น \`null\`

**ตัวอย่างคำค้นหา:** "Toyota Yaris Ativ"
AI ควรจะค้นหาข้อมูล, รูปภาพ, และโลโก้ของ Toyota Yaris Ativ`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.STRING, description: "ยี่ห้อรถยนต์" },
              model: { type: Type.STRING, description: "รุ่นรถยนต์" },
              trim: { type: Type.STRING, description: "รุ่นย่อยของรถยนต์" },
              price: { type: Type.NUMBER, description: "ราคาประเมิน (ตัวเลข)" },
              imageUrl: { type: Type.STRING, description: "URL รูปภาพของรถยนต์" },
              brandLogoUrl: { type: Type.STRING, description: "URL โลโก้ของยี่ห้อรถยนต์" },
            },
            required: ["brand", "model", "trim", "price"],
          },
        },
      },
    });

    const text = response.text.trim();
    const cars: CarInfo[] = JSON.parse(text);

    if (!Array.isArray(cars)) {
        throw new Error("AI response is not an array.");
    }
    
    return cars;

  } catch (error) {
    console.error("Error fetching car list from Gemini API:", error);
    if (error instanceof SyntaxError) {
        throw new Error("ไม่สามารถประมวลผลข้อมูลจาก AI ได้ รูปแบบไม่ถูกต้อง");
    }
    throw new Error("ค้นหาข้อมูลรถไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  }
};