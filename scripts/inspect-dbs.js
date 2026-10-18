const Database = require("better-sqlite3");
const files = [
  "C:/Users/boyjo/Desktop/joymee/prisma/prisma/dev.db",
  "C:/Users/boyjo/Desktop/joymee/dev.db",
  "C:/Users/boyjo/Desktop/joymee/prisma/dev.db",
];
for (const f of files) {
  try {
    const db = new Database(f, { readonly: true, fileMustExist: true });
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(f);
    console.log(" tables", tables.map((t) => t.name).join(", ") || "(none)");
    for (const t of tables) {
      if (t.name.startsWith("sqlite_")) continue;
      try {
        const n = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
        console.log("  " + t.name + ": " + n.c);
      } catch {
        console.log("  " + t.name + ": err");
      }
    }
    db.close();
  } catch (e) {
    console.log(f, "FAIL", e.message);
  }
}
