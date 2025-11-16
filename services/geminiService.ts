import { GoogleGenAI, Type } from "@google/genai";

export interface CarInfo {
  brand: string;
  model: string;
  trim: string;
  price: number;
}

export const searchCars = async (carModel: string): Promise<CarInfo[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `คุณคือผู้เชี่ยวชาญด้านรถยนต์ในประเทศไทย ค้นหารายการรถยนต์ที่ตรงกับคำค้นหา: "${carModel}" โดยแสดงผลลัพธ์ไม่เกิน 5 รายการ สำหรับรถแต่ละคัน ให้ระบุ ยี่ห้อ (brand), รุ่น (model), รุ่นย่อย (trim), และ ราคาประเมิน (price)`;

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