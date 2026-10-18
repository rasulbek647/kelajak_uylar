# ROLLBACK — Orqaga qaytarish va Tizim Hujjati

Ushbu fayl loyihaga kiritilgan barcha o'zgarishlarni boshqarish, kerak bo'lganda to'liq yoki bosqichma-bosqich bekor qilish va yangi tizimlarni sozlash uchun tayyorlangan.

---

## 1. Zaxiralar ro'yxati (backups/)

Barcha e'lonlar va foydalanuvchilar o'zgartirishdan oldin to'liq eksport qilingan:
- `backups/listings_backup.json` — 5 ta e'lon (shu jumladan test e'lonlar)
- `backups/users_backup.json` — 6 ta foydalanuvchi ma'lumotlari

### Test e'lonlarni qaytarish buyrug'i:
Agar yashirilgan 3 ta test e'lonni (`cmudo0p1900019mt6mjrpkiqi`, `cmudq9gyo00012m6pwxn071ji`, `cmuxyyi4w0001kl7gd8tuutpf`) qayta ochmoqchi bo'lsangiz:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.listing.updateMany({ where: { id: { in: ['cmudo0p1900019mt6mjrpkiqi','cmudq9gyo00012m6pwxn071ji','cmuxyyi4w0001kl7gd8tuutpf'] } }, data: { isHidden: false } }).then(r => console.log('Tiklandi:', r.count)).finally(() => prisma.\$disconnect());"
```

---

## 2. Yangi yaratilgan fayllar

| Fayl | Maqsadi |
|---|---|
| `src/app/privacy/page.tsx` | Maxfiylik siyosati (UZ, RU, EN) — O'zbekiston O'RQ-547 Qonuniga muvofiq |
| `src/app/about/page.tsx` | Kompaniya haqida sahifasi (UZ, RU, EN) |
| `src/lib/sms.ts` | Modulli SMS provayder (Eskiz.uz & PlayMobile) |
| `src/app/api/otp/send/route.ts` | OTP yuborish, rate limit (soatiga 5 ta), 5-daqiqa muddat, Telegram fallback |
| `ROLLBACK.md` | Ushbu yo'riqnoma hujjati |

---

## 3. O'zgartirilgan fayllar

| Fayl | O'zgarish mohiyati |
|---|---|
| `prisma/schema.prisma` | `Listing.isHidden`, `User.isVerified` qo'shildi |
| `src/lib/lang.ts` | 262 ta kalit — barchasi UZ, RU, EN da 100% to'liq sinxronlandi |
| `src/app/page.tsx` | `isHidden: false` filtri qo'shildi (test e'lonlar bosh sahifadan yashirildi) |
| `src/app/listing/[id]/page.tsx` | O'xshash e'lonlar so'roviga `isHidden: false` qo'shildi |
| `src/app/api/user/[id]/route.ts` | Profil e'lonlariga `isHidden: false`, foydalanuvchiga `isVerified` qo'shildi |
| `src/app/register/page.tsx` | +998 maska, parol ko'rish/yashirish ko'zi, parol kuchi, oferta rozilik checkbox, ishonch yozuvi, 3 til |
| `src/app/api/register/route.ts` | Test kodi `1111` olib tashlandi, bcrypt rounds 12 ga oshirildi, server-side validatsiya, 3 tilda xatolar |
| `src/app/api/telegram-webhook/route.ts` | Hardcoded bot token olib tashlandi (`.env` ga ko'chirildi), 6 xonali OTP, 5 daqiqa muddat, rate limit |
| `src/lib/auth.ts` | 5 marta xato urinishdan so'ng 15 daqiqaga blokirovka, xavfsiz cookie sozlari (`httpOnly`, `sameSite: "lax"`, `secure`) |
| `src/app/api/listings/route.ts` | Yangi e'lon qo'shishda sarlavha (min 10 belgi), narx, tavsif va anti-spam validatsiyasi |
| `src/components/AgentSidebar.tsx` | "0 ta rieltor" bo'sh satr yashirildi, barcha matnlar 3 tilda tarjima qilindi |
| `src/components/ListingCard.tsx` | `user.isVerified` bo'lsa e'lon kartasida "✓" nishoni qo'yildi |
| `src/app/profile/page.tsx` | Profil sahifasida "✓ Tasdiqlangan" nishoni ko'rsatildi |
| `src/app/user/[id]/page.tsx` | Ommaviy profilda "✓ Tasdiqlangan" nishoni ko'rsatildi |
| `src/components/Footer.tsx` | `/privacy` va `/about` havolalari qo'shildi, Telegram `.env` ga ulandi |
| `src/app/layout.tsx` | `cookies()` orqali serverda tanlangan tilni o'qish, HTML `lang` va Providers ga uzatish, viewport va SEO yangilandi |
| `src/components/Providers.tsx` | `initialLang` parametrini qabul qilib, LangProvider ga uzatish |
| `src/components/LangProvider.tsx` | Server tili bilan boshlanish (`initialLang`), cookie (`joymee_lang`, `lang`) va localStorage sinxronizatsiyasi |
| `src/components/Navbar.tsx` | Til o'zgarganda `router.refresh()` chaqirish, hydration warninglarni bartaraf etish |
| `next.config.ts` | Xavfsizlik sarlavhalari (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) qo'shildi |

---

## 4. Siz to'ldirishingiz kerak bo'lgan `.env` o'zgaruvchilari

Hozirda `.env` faylingizda faqat `DATABASE_URL` mavjud. Sayt xavfsiz va to'liq ishlashi uchun quyidagilarni to'ldirish tavsiya etiladi:

```env
# 1. Telegram Bot (Tasdiqlash kodi va xabarlar uchun)
TELEGRAM_BOT_TOKEN="8979456061:AAHPubEufbXu1EdyjGXP4mf6IQlqvm4Xw44"
COMPANY_TELEGRAM_URL="https://t.me/kelajakuylar_sms_bot"

# 2. NextAuth Xavfsizlik kaliti (Istalgan uzun tasodifiy satr)
NEXTAUTH_SECRET="sizning_juda_maxfiy_kalitingiz_2026_kamida_32_belgi"
NEXTAUTH_URL="https://kelajakuylar.uz"

# 3. SMS Provayder (Agar SMS orqali yubormoqchi bo'lsangiz; ulanmagan bo'lsa sayt Telegram orqali xatosiz ishlayveradi)
# Tanlov: "eskiz" yoki "playmobile" yoki "none"
SMS_PROVIDER="none"

# Agar Eskiz.uz tanlansa:
# ESKIZ_EMAIL="info@kelajakuylar.uz"
# ESKIZ_PASSWORD="eskiz_parolingiz"
# ESKIZ_FROM="4546"

# Agar PlayMobile tanlansa:
# PLAYMOBILE_USERNAME="kelajakuylar"
# PLAYMOBILE_PASSWORD="playmobile_parolingiz"
# PLAYMOBILE_ORIGINATOR="3700"
```

---

## 5. Baza sxemasini orqaga qaytarish (agar kerak bo'lsa)

Agar yangi `isHidden` yoki `isVerified` ustunlarini bazadan o'chirmoqchi bo'lsangiz:
1. `prisma/schema.prisma` dan `isHidden` va `isVerified` qatorlarini o'chiring.
2. Quyidagi buyruqni ishga tushiring:
```bash
node node_modules\prisma\build\index.js db push --accept-data-loss
```
*(Eslatma: ustunlar olib tashlansa, faqat shu ustundagi bayroqlar o'chadi, foydalanuvchilar va e'lonlar saqlanib qoladi).*
