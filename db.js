const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("bcryptjs");

const dataDir = path.join(__dirname, "data");
const sessionsDir = path.join(dataDir, "sessions");
const formsDir = path.join(dataDir, "forms");

[dataDir, sessionsDir, formsDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Use app.db (not must.db) so older local DB files with incompatible schemas are skipped.
const dbPath = path.join(dataDir, "app.db");
const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  permissions TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS course_file_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quality_standards_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

function tableColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}

function migrateIfNeeded() {
  try {
    const uc = tableColumns("users");
    if (uc.length && !uc.includes("is_active")) {
      db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1");
    }
    if (uc.length && !uc.includes("permissions")) {
      db.exec("ALTER TABLE users ADD COLUMN permissions TEXT");
    }
  } catch (e) {
    console.warn("DB migrate users:", e.message);
  }
}

migrateIfNeeded();

function seedUsersIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (count > 0) return;

  const hash = (p) => bcrypt.hashSync(p, 10);
  const ins = db.prepare(
    "INSERT INTO users (name, email, password, role, is_active, permissions) VALUES (?, ?, ?, ?, 1, ?)",
  );

  ins.run(
    "مدير عام",
    "admin@must.edu.eg",
    hash("admin1234"),
    "main_admin",
    JSON.stringify({
      reportAccess: "courseAndQuality",
    }),
  );
  ins.run(
    "مدير",
    "admin@must.edu",
    hash("admin1234"),
    "admin",
    JSON.stringify({ reportAccess: "courseAndQuality" }),
  );
  ins.run(
    "مشاهد",
    "viewer@must.edu",
    hash("viewer1234"),
    "viewer",
    JSON.stringify({ reportAccess: "courseAndQuality" }),
  );
}

seedUsersIfEmpty();

db.clearExpiredOTPs = function clearExpiredOTPs() {
  const now = Date.now();
  db.prepare("DELETE FROM otp_codes WHERE expires_at < ?").run(now);
};

db.saveOTP = function saveOTP(email, code) {
  db.prepare("DELETE FROM otp_codes WHERE email = ?").run(email);
  db.prepare("INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)").run(
    email,
    code,
    Date.now() + 10 * 60 * 1000,
  );
};

db.verifyOTP = function verifyOTP(email, code) {
  const row = db
    .prepare("SELECT * FROM otp_codes WHERE email = ? AND code = ?")
    .get(email, code);
  if (!row) return { valid: false, error: "كود التحقق غير صحيح" };
  if (Date.now() > row.expires_at)
    return { valid: false, error: "كود التحقق انتهت صلاحيته" };
  db.prepare("DELETE FROM otp_codes WHERE email = ?").run(email);
  return { valid: true };
};

db.addCourse = function addCourse(code, name) {
  try {
    const info = db
      .prepare("INSERT INTO courses (code, name) VALUES (?, ?)")
      .run(code, name);
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(info.lastInsertRowid);
    return { success: true, course };
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return { success: false, error: "كود المقرر مسجل مسبقاً" };
    }
    return { success: false, error: "تعذر حفظ المقرر" };
  }
};

db.updateCourse = function updateCourse(id, code, name) {
  try {
    const r = db.prepare("UPDATE courses SET code = ?, name = ? WHERE id = ?").run(code, name, id);
    if (r.changes === 0) return { success: false, error: "المقرر غير موجود" };
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(id);
    return { success: true, course };
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return { success: false, error: "كود المقرر مسجل مسبقاً" };
    }
    return { success: false, error: "تعذر تحديث المقرر" };
  }
};

db.deleteCourse = function deleteCourse(id) {
  const r = db.prepare("DELETE FROM courses WHERE id = ?").run(id);
  if (r.changes === 0) return { success: false, error: "المقرر غير موجود" };
  return { success: true };
};

db.getCourses = function getCourses() {
  return db.prepare("SELECT * FROM courses ORDER BY code ASC").all();
};

db.addForm = function addForm(name, filePath) {
  const info = db
    .prepare("INSERT INTO forms (name, file_path) VALUES (?, ?)")
    .run(name, filePath);
  const form = db.prepare("SELECT id, name, file_path AS filePath, created_at FROM forms WHERE id = ?").get(
    info.lastInsertRowid,
  );
  return { success: true, form };
};

db.deleteForm = function deleteForm(id) {
  const row = db.prepare("SELECT * FROM forms WHERE id = ?").get(id);
  if (!row) return { success: false, error: "النموذج غير موجود" };
  if (row.file_path && fs.existsSync(row.file_path)) {
    try {
      fs.unlinkSync(row.file_path);
    } catch (_) {}
  }
  db.prepare("DELETE FROM forms WHERE id = ?").run(id);
  return { success: true };
};

db.getForms = function getForms() {
  return db
    .prepare("SELECT id, name, file_path AS filePath, created_at FROM forms ORDER BY created_at DESC")
    .all();
};

db.updateUserPermissions = function updateUserPermissions(userId, permissions) {
  const u = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
  if (!u) return { success: false, error: "المستخدم غير موجود" };
  const json = JSON.stringify(permissions || {});
  db.prepare("UPDATE users SET permissions = ? WHERE id = ?").run(json, userId);
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return {
    success: true,
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      isActive: row.is_active !== 0,
      permissions: row.permissions ? JSON.parse(row.permissions) : {},
    },
  };
};

module.exports = db;
