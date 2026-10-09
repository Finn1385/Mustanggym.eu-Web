/**
 * Nightly backup, run by a Coolify Scheduled Task inside the container:
 *   node scripts/backup.mjs
 * Writes /data/backups/mustang-zaloha-YYYY-MM-DD.tar.gz and keeps the newest 14.
 */
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { backupFileName, createBackupStream } from "../lib/backup";
import { BACKUP_DIR } from "../lib/paths";

const KEEP = Number(process.env.BACKUP_KEEP ?? 14);

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const target = path.join(BACKUP_DIR, backupFileName());
  await pipeline(createBackupStream(), fs.createWriteStream(target));
  console.log(`backup written: ${target} (${Math.round(fs.statSync(target).size / 1024)} KB)`);

  const old = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^mustang-zaloha-\d{4}-\d{2}-\d{2}\.tar\.gz$/.test(f))
    .sort()
    .reverse()
    .slice(KEEP);
  for (const f of old) {
    fs.rmSync(path.join(BACKUP_DIR, f));
    console.log(`removed old backup: ${f}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
