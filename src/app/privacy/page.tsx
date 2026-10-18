"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export default function PrivacyPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121316] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 dark:border-white/5">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 hover:underline font-medium"
          >
            ← {lang === "ru" ? "На главную" : lang === "en" ? "Back to Home" : "Bosh sahifaga qaytish"}
          </Link>
        </div>

        {lang === "ru" ? (
          /* RUSSIAN VERSION */
          <article className="prose dark:prose-invert max-w-none space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Политика конфиденциальности</h1>
            <p className="text-xs text-gray-500">Последнее обновление: 18 октября 2026 г.</p>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">1. Общие положения</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Настоящая Политика конфиденциальности регулирует порядок сбора, обработки и защиты персональных данных пользователей платформы «Kelajak Uylar» в соответствии с Законом Республики Узбекистан «О персональных данных» № ЗРУ-547 от 2 июля 2019 года.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">2. Какие данные мы собираем</h2>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-gray-700 dark:text-gray-300">
                <li><strong>Имя и фамилия:</strong> для идентификации профиля пользователя;</li>
                <li><strong>Номер телефона:</strong> для авторизации, подтверждения личности и связи по объявлениям;</li>
                <li><strong>Регион:</strong> для отображения релевантных объявлений в вашем регионе;</li>
                <li><strong>Технические данные:</strong> IP-адрес, тип устройства, файлы cookie для защиты от мошенничества.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">3. Цели сбора данных</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Мы используем данные исключительно для:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>Предоставления доступа к сервису размещения и поиска недвижимости;</li>
                <li>Обеспечения безопасности аккаунта и защиты от спама;</li>
                <li>Отправки важных уведомлений по аккаунту и подтверждающих кодов.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">4. Передача третьим лицам</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Мы <strong>не продаём и не передаём</strong> ваши персональные данные третьим лицам в рекламных целях. Передача возможна только по законному требованию государственных органов Республики Узбекистан в предусмотренном законодательством порядке.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">5. Срок хранения и право на удаление</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Данные хранятся до тех пор, пока активен ваш аккаунт. Вы имеете право в любой момент запросить полное удаление ваших персональных данных и аккаунта, обратившись в нашу службу поддержки.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">6. Контакты</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                По всем вопросам касательно конфиденциальности пишите нам через раздел поддержки на сайте или по официальным каналам связи.
              </p>
            </section>

            <div className="mt-8 p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-700 dark:text-yellow-300">
              ⚠️ <strong>Примечание:</strong> Данный документ является типовой редакцией и подлежит последующей юридической экспертизе в соответствии с корпоративными стандартами компании.
            </div>
          </article>
        ) : lang === "en" ? (
          /* ENGLISH VERSION */
          <article className="prose dark:prose-invert max-w-none space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-gray-500">Last updated: October 18, 2026</p>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">1. Overview</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                This Privacy Policy outlines how «Kelajak Uylar» collects, uses, and safeguards personal data in compliance with the Republic of Uzbekistan Law «On Personal Data» No. ZRU-547 dated July 2, 2019.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">2. Information We Collect</h2>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-gray-700 dark:text-gray-300">
                <li><strong>Name:</strong> To identify your user profile;</li>
                <li><strong>Phone number:</strong> For authentication, verification, and listing inquiries;</li>
                <li><strong>Region:</strong> To display relevant local real estate listings;</li>
                <li><strong>Technical data:</strong> IP address, device type, and session cookies for anti-fraud protection.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">3. Purpose of Processing</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                We process your personal information only to:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>Provide property listing and discovery services;</li>
                <li>Authenticate your account securely and prevent abuse;</li>
                <li>Send transactional verification codes and service notices.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">4. Third-Party Disclosure</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                We <strong>do not sell or share</strong> your personal details with third-party advertisers. Information is only disclosed if required by the competent authorities of the Republic of Uzbekistan pursuant to applicable law.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">5. Retention and Right to Deletion</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Your data is stored while your account remains active. You reserve the right at any time to request complete erasure of your personal data and account by contacting our support team.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">6. Contact</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                For questions regarding privacy, please contact us via our site support page or official communication channels.
              </p>
            </section>

            <div className="mt-8 p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-700 dark:text-yellow-300">
              ⚠️ <strong>Note:</strong> It is recommended that this document undergo legal review prior to final enterprise deployment.
            </div>
          </article>
        ) : (
          /* UZBEK VERSION */
          <article className="prose dark:prose-invert max-w-none space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Maxfiylik siyosati</h1>
            <p className="text-xs text-gray-500">Oxirgi yangilanish: 2026-yil 18-oktabr</p>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">1. Umumiy qoidalar</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Ushbu Maxfiylik siyosati «Kelajak Uylar» platformasida foydalanuvchilarning shaxsiy ma&apos;lumotlarini yig&apos;ish, saqlash va himoya qilish tartibini O&apos;zbekiston Respublikasining 2019-yil 2-iyuldagi «Shaxsiy ma&apos;lumotlar to&apos;g&apos;risida»gi O&apos;RQ-547-son Qonuniga muvofiq belgilaydi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">2. Qanday ma&apos;lumotlar yig&apos;iladi?</h2>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-gray-700 dark:text-gray-300">
                <li><strong>Ism va familiya:</strong> Foydalanuvchi profilini shakllantirish uchun;</li>
                <li><strong>Telefon raqam:</strong> Hisobni tasdiqlash, xavfsizlik va e&apos;lonlar bo&apos;yicha bog&apos;lanish uchun;</li>
                <li><strong>Hudud (viloyat/shahar):</strong> Sizga yaqin ko&apos;chmas mulk takliflarini ko&apos;rsatish uchun;</li>
                <li><strong>Texnik ma&apos;lumotlar:</strong> IP-manzil, qurilma turi va xavfsizlik cookie-fayllari (firibgarlikdan himoyalanish maqsadida).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">3. Ma&apos;lumotlar nima maqsadda ishlatiladi?</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Yig&apos;ilgan ma&apos;lumotlar faqat quyidagi maqsadlarda foydalaniladi:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>Saytda e&apos;lon joylashtirish va qidirish xizmatlarini taqdim etish;</li>
                <li>Hisobingizni ruxsatsiz kirishlardan himoya qilish;</li>
                <li>Tasdiqlash kodlari va xizmatga oid zarur xabarlarni yuborish.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">4. Uchinchi shaxslarga berilmasligi</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Sizning shaxsiy ma&apos;lumotlaringiz <strong>uchinchi shaxslarga, reklama agentliklariga sotilmaydi va berilmaydi</strong>. Ma&apos;lumotlar faqat O&apos;zbekiston Respublikasi qonunlarida belgilangan hollarda davlat vakolatli organlari talabiga binoan berilishi mumkin.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">5. Saqlash muddati va o&apos;chirish huquqi</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Ma&apos;lumotlaringiz profilingiz faol bo&apos;lgan davrda saqlanadi. Har bir foydalanuvchi istalgan vaqtda o&apos;z profilingizni va shaxsiy ma&apos;lumotlaringizni to&apos;liq o&apos;chirib tashlashni so&apos;rash huquqiga ega. Buning uchun qo&apos;llab-quvvatlash bo&apos;limiga murojaat qilishingiz kifoya.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-yellow-500">6. Aloqa kontakti</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Shaxsiy ma&apos;lumotlaringiz bo&apos;yicha savol yoki takliflar bo&apos;lsa, saytdagi «Qo&apos;llab-quvvatlash» sahifasi orqali biz bilan bog&apos;lanishingiz mumkin.
              </p>
            </section>

            <div className="mt-8 p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-700 dark:text-yellow-300">
              ⚠️ <strong>Eslatma:</strong> Ushbu hujjat platformaning namunaviy maxfiylik siyosati hisoblanadi va foydalanishdan oldin yuridik tekshiruvdan o&apos;tkazish tavsiya etiladi.
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
