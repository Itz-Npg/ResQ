import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, "..", "db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const sqlite = new Database(path.join(dbDir, "filename.db"));

// Simple manual table creation if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    latitude REAL,
    longitude REAL,
    last_seen INTEGER,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    message TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    helper_id INTEGER REFERENCES users(id),
    is_resqued INTEGER DEFAULT 0,
    created_at INTEGER
  );
`);

export const db = drizzle(sqlite, { schema });
