import path from "node:path";

/** Root for everything that must survive redeploys (SQLite file, uploads, backups). Runtime data, never traced. */
export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? ".data");
export const DB_PATH = path.join(/*turbopackIgnore: true*/ DATA_DIR, "mustang.db");
export const UPLOAD_DIR = path.join(/*turbopackIgnore: true*/ DATA_DIR, "uploads");
export const BACKUP_DIR = path.join(/*turbopackIgnore: true*/ DATA_DIR, "backups");
