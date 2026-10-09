import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { DATA_DIR, DB_PATH } from "./paths";

/** Consistent copy of the live database (safe while the app keeps writing). */
export function snapshotDatabase(target: string) {
  fs.rmSync(target, { force: true });
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  try {
    db.prepare("VACUUM INTO ?").run(target);
  } finally {
    db.close();
  }
}

/** Streams a .tar.gz with a DB snapshot and all uploads. Calls `cleanup` once the stream ends. */
export function createBackupStream() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mustang-backup-"));
  snapshotDatabase(path.join(tmp, "mustang.db"));
  const args = ["-czf", "-", "-C", tmp, "mustang.db"];
  if (fs.existsSync(path.join(DATA_DIR, "uploads"))) args.push("-C", DATA_DIR, "uploads");
  const tar = spawn("tar", args, { stdio: ["ignore", "pipe", "inherit"] });
  const cleanup = () => fs.rmSync(tmp, { recursive: true, force: true });
  tar.on("close", cleanup);
  tar.on("error", cleanup);
  return tar.stdout;
}

export function backupFileName(date = new Date()) {
  return `mustang-zaloha-${date.toISOString().slice(0, 10)}.tar.gz`;
}
