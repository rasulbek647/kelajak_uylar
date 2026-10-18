// Modular SMS Provider (Eskiz.uz & PlayMobile)
// Provayder va kalitlar .env orqali boshqariladi

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type SmsLang = "uz" | "ru" | "en";

export function getSmsMessage(code: string, lang: SmsLang = "uz"): string {
  switch (lang) {
    case "ru":
      return `Kelajak Uylar: Ваш код подтверждения: ${code}. Никому не сообщайте его.`;
    case "en":
      return `Kelajak Uylar: Your verification code: ${code}. Do not share it.`;
    case "uz":
    default:
      return `Kelajak Uylar: Sizning tasdiqlash kodingiz: ${code}. Uni hech kimga bermang.`;
  }
}

// Eskiz.uz orqali yuborish
async function sendViaEskiz(phone: string, text: string): Promise<SendSmsResult> {
  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;
  const from = process.env.ESKIZ_FROM || "4546";

  if (!email || !password) {
    return { success: false, error: "ESKIZ_EMAIL yoki ESKIZ_PASSWORD .env da ko'rsatilmagan" };
  }

  try {
    // 1. Token olish
    const tokenRes = await fetch("https://notify.eskiz.uz/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const tokenData = await tokenRes.json();
    const token = tokenData?.data?.token;

    if (!token) {
      return { success: false, error: "Eskiz token olishda xatolik: " + JSON.stringify(tokenData) };
    }

    // 2. SMS yuborish (format: 998901234567)
    const cleanPhone = phone.replace(/\D/g, "");
    const smsRes = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mobile_phone: cleanPhone,
        message: text,
        from,
      }),
    });

    const smsData = await smsRes.json();
    if (smsData?.status === "waiting" || smsData?.status === "success") {
      return { success: true, messageId: smsData?.id };
    }

    return { success: false, error: smsData?.message || "Eskiz yuborish xatosi" };
  } catch (err: any) {
    return { success: false, error: err?.message || "Eskiz tarmoq xatosi" };
  }
}

// PlayMobile orqali yuborish
async function sendViaPlayMobile(phone: string, text: string): Promise<SendSmsResult> {
  const username = process.env.PLAYMOBILE_USERNAME;
  const password = process.env.PLAYMOBILE_PASSWORD;
  const originator = process.env.PLAYMOBILE_ORIGINATOR || "3700";

  if (!username || !password) {
    return { success: false, error: "PLAYMOBILE_USERNAME yoki PLAYMOBILE_PASSWORD .env da ko'rsatilmagan" };
  }

  try {
    const cleanPhone = phone.replace(/\D/g, "");
    const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch("https://send.smsxabar.uz/broker-api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        messages: [
          {
            recipient: cleanPhone,
            "message-id": "ku_" + Date.now(),
            sms: {
              originator,
              content: { text },
            },
          },
        ],
      }),
    });

    if (res.ok) {
      return { success: true };
    }

    const data = await res.text();
    return { success: false, error: `PlayMobile xatosi (${res.status}): ${data}` };
  } catch (err: any) {
    return { success: false, error: err?.message || "PlayMobile tarmoq xatosi" };
  }
}

/**
 * Universal SMS yuborish funksiyasi.
 * .env dagi SMS_PROVIDER qiymatiga qarab Eskiz yoki PlayMobile ishlatiladi.
 * Agar sozlanmagan bo'lsa, sayt buzilmaydi, faqat ogohlantirish qaytadi.
 */
export async function sendOtpSms(
  phone: string,
  code: string,
  lang: SmsLang = "uz"
): Promise<SendSmsResult> {
  const provider = (process.env.SMS_PROVIDER || "").toLowerCase().trim();
  const text = getSmsMessage(code, lang);

  if (!provider || provider === "none" || provider === "off") {
    // SMS provayder o'chiq holatda sayt xavfsiz ishlayveradi
    return {
      success: false,
      error: "SMS_PROVIDER_NOT_CONFIGURED",
    };
  }

  if (provider === "eskiz") {
    return await sendViaEskiz(phone, text);
  }

  if (provider === "playmobile") {
    return await sendViaPlayMobile(phone, text);
  }

  return {
    success: false,
    error: `Noma'lum SMS provayder: "${provider}". Qo'llab-quvvatlanadi: eskiz, playmobile`,
  };
}
