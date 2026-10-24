import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { resolveAuthSecret, verifyTelegramLoginToken } from "@/lib/auth-secret";

// User-Agent'dan qurilma nomini olish
function parseDevice(userAgent: string): string {
  if (!userAgent) return "Noma'lum qurilma";
  
  let os = "Noma'lum";
  if (userAgent.includes("Windows NT")) os = "Windows";
  else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS")) os = "MacOS";
  else if (userAgent.includes("Linux") && !userAgent.includes("Android")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone")) os = "iPhone";
  else if (userAgent.includes("iPad")) os = "iPad";

  let browser = "";
  if (userAgent.includes("Edg/")) browser = " · Edge";
  else if (userAgent.includes("OPR/") || userAgent.includes("Opera")) browser = " · Opera";
  else if (userAgent.includes("Chrome/") && !userAgent.includes("Chromium")) browser = " · Chrome";
  else if (userAgent.includes("Firefox/")) browser = " · Firefox";
  else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) browser = " · Safari";

  return os + browser;
}

// Login xatolarini hisoblagich (5 marta xato => 15 daqiqa blok)
interface LoginAttempt {
  count: number;
  blockedUntil?: number;
}
const loginAttempts = new Map<string, LoginAttempt>();

export const authOptions: NextAuthOptions = {
  secret: resolveAuthSecret(),
  providers: [
    CredentialsProvider({
      name: "Telefon raqam",
      credentials: {
        phone: { label: "Telefon", type: "text", placeholder: "+998 90 123 45 67" },
        password: { label: "Parol (Sms kod)", type: "password" },
        userAgent: { label: "userAgent", type: "text" },
        ip: { label: "ip", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Malumotlar to'liq emas");
        }

        const phoneKey = credentials.phone.replace(/\D/g, "");

        // 15 daqiqalik blokirovkada bormi?
        const attempt = loginAttempts.get(phoneKey);
        if (attempt?.blockedUntil && Date.now() < attempt.blockedUntil) {
          const remainingMinutes = Math.ceil((attempt.blockedUntil - Date.now()) / 60000);
          throw new Error(`Juda ko'p xato urinishlar. Iltimos, ${remainingMinutes} daqiqadan keyin qayta urinib ko'ring.`);
        }

        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });
        
        if (!user) {
          throw new Error("Bu telefon raqam ro'yxatdan o'tmagan. Iltimos, avval ro'yxatdan o'ting.");
        }

        // Parolni tekshirish
        if (credentials.password.startsWith("__tg_verified__")) {
          const loginToken = credentials.password.slice("__tg_verified__".length);
          const isValid = verifyTelegramLoginToken(loginToken, user.id);
          if (!isValid) {
            throw new Error("Telegram tasdiqlash xatosi");
          }
        } else {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            // Urinishlar sonini oshiramiz
            const currentCount = (attempt?.count || 0) + 1;
            if (currentCount >= 5) {
              loginAttempts.set(phoneKey, {
                count: currentCount,
                blockedUntil: Date.now() + 15 * 60 * 1000, // 15 daqiqa
              });
              throw new Error("5 marta noto'g'ri parol kiritildi. Hisobingiz 15 daqiqaga bloklandi.");
            } else {
              loginAttempts.set(phoneKey, { count: currentCount });
              throw new Error(`Parol xato. Qolgan urinishlar: ${5 - currentCount}`);
            }
          }
        }

        // Muvaffaqiyatli kirish — urinishlar hisobini tozalaymiz
        loginAttempts.delete(phoneKey);

        // UserAgent va IP — credentials orqali uzatilgan qiymatlarni ishlatamiz
        const userAgent = credentials.userAgent || "Noma'lum brauzer";
        const ip = credentials.ip || "Noma'lum";
        const device = parseDevice(userAgent);

        // SessionToken yaratish va saqlash
        const sessionToken = crypto.randomBytes(24).toString("hex");
        
        try {
          await prisma.userSession.create({
            data: {
              userId: user.id,
              token: sessionToken,
              userAgent,
              device,
              ip,
              lastActive: new Date(),
            }
          });
        } catch (e) {
          console.error("UserSession saqlashda xatolik:", e);
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          image: user.avatar || null,
          sessionToken,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 kun
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.image !== undefined) token.picture = session.image;
        if (session.name !== undefined) token.name = session.name;
      }
      if (user) {
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.picture = (user as any).image || null;
        token.sessionToken = (user as any).sessionToken;
        token.id = user.id;
      } else {
        if (!token.sessionToken) {
          throw new Error("Session revoked");
        }
        // Har gal tokenni DB dan tekshiramiz (Chiqarib yuborilgan bo'lsa, sessiyani to'xtatish uchun)
        const dbSession = await prisma.userSession.findFirst({
          where: { token: token.sessionToken as string },
          include: { user: true }
        });
        if (!dbSession) {
          throw new Error("Session revoked"); // Sessiya bekor qilinadi
        }
        token.role = dbSession.user.role;
        token.phone = dbSession.user.phone;
        // Ma'lumotlarni DB dan yangilab turamiz, lekin "update" trigger bo'lmasa!
        if (trigger !== "update") {
          token.picture = dbSession.user.avatar || null;
          token.name = dbSession.user.name;
        }
        token.id = dbSession.userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).id = token.id || token.sub;
        session.user.image = (token.picture as string) || null;
        (session.user as any).sessionToken = token.sessionToken;
      }
      return session;
    },
  },
};
