import crypto from "crypto";

export function resolveAuthSecret(): string | undefined {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }
  if (process.env.DATABASE_URL) {
    return crypto
      .createHash("sha256")
      .update("kelajak-uylar:nextauth:" + process.env.DATABASE_URL)
      .digest("hex");
  }
  return undefined;
}

export function createTelegramLoginToken(userId: string): string {
  const secret = resolveAuthSecret() || "fallback-telegram-secret-kelajak";
  const expiresAtMs = Date.now() + 2 * 60 * 1000; // 2 daqiqa amal qiladi
  const payload = `${userId}:${expiresAtMs}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `tg1.${userId}.${expiresAtMs}.${hmac}`;
}

export function verifyTelegramLoginToken(token: string, userId: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [prefix, tokenUserId, expiresAtStr, providedHmac] = parts;
  if (prefix !== "tg1") return false;
  if (tokenUserId !== userId) return false;

  // HMAC hex tekshiruvi: aniq 64 ta hex belgisi bo'lishi shart
  if (!providedHmac || providedHmac.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(providedHmac)) {
    return false;
  }

  const expiresAtMs = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAtMs) || Date.now() > expiresAtMs) {
    return false;
  }

  const secret = resolveAuthSecret() || "fallback-telegram-secret-kelajak";
  const payload = `${tokenUserId}:${expiresAtStr}`;
  const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const providedBuf = Buffer.from(providedHmac, "hex");
    const expectedBuf = Buffer.from(expectedHmac, "hex");
    if (providedBuf.length !== 32 || expectedBuf.length !== 32) {
      return false;
    }
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  } catch {
    return false;
  }
}
