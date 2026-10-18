import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  // Get listing titles
  const listingIds = [...new Set(reports.map(r => r.listingId))];
  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, title: true }
  });
  const listingMap: Record<string, string> = {};
  listings.forEach(l => { listingMap[l.id] = l.title; });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shikoyatlar</h1>
        <span className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-400 dark:text-red-400 font-bold px-4 py-1.5 rounded-full text-sm">
          {reports.length} ta shikoyat
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">
          <div className="text-5xl mb-4">✅</div>
          <p className="font-semibold text-lg">Hech qanday shikoyat yo'q</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => {
            const listingTitle = listingMap[report.listingId] || "O'chirilgan e'lon";
            return (
              <div key={report.id} className="bg-white dark:bg-[#1e1f23] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-400 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        Shikoyat
                      </span>
                      <a
                        href={`/listing/${report.listingId}`}
                        target="_blank"
                        className="text-yellow-700 dark:text-yellow-400 font-bold text-sm hover:underline truncate max-w-[300px]"
                      >
                        🏠 {listingTitle}
                      </a>
                    </div>
                    <p className="text-gray-900 dark:text-white font-semibold">{report.reason}</p>
                    {report.note && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{report.note}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString("uz-UZ", {
                        year: "numeric", month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    <a
                      href={`/listing/${report.listingId}`}
                      target="_blank"
                      className="px-3 py-1.5 text-xs font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition"
                    >
                      E'lonni ko'rish
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
