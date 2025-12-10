import sqlite3 from 'sqlite3';
import type { DatabaseConnection } from '../interfaces.js';

export class SQLiteConnection implements DatabaseConnection {
    private db: sqlite3.Database | null = null;
    private readonly dbPath = './events.db';
    private readonly createTableSQL = `CREATE TABLE IF NOT EXISTS $1 (id TEXT PRIMARY KEY, data TEXT)`;

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) reject(err);
                else {
                    console.log("Connected to SQLite Database");
                    resolve();
                }
            });
        });
    }

    async disconnect(): Promise<void> {
        if (this.db) {
            this.db.close((err) => {
                if (err) console.error('Error closing SQLite database', err);
                else console.log("Disconnected from SQLite Database");
            });
        }
    }

    async save(table: string, record: Record<string, unknown>): Promise<void> {
        if (!this.db) throw new Error('Not connected');
        return new Promise((resolve, reject) => {
            const createSQL = this.createTableSQL.replace('$1', table);
            this.db!.run(createSQL, (err) => {
                if (err) return reject(err);
                const insertSQL = `INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`;
                this.db!.run(insertSQL, [record.id, JSON.stringify(record)], (err) => {
                    if (err) reject(err);
                    else {
                        console.log(`Record saved to SQLite table ${table}`);
                        resolve();
                    }
                });
            });
        });
    }

    async find(table: string, id: string): Promise<Record<string, unknown> | null> {
        if (!this.db) throw new Error('Not connected');
        return new Promise((resolve, reject) => {
            const selectSQL = `SELECT data FROM ${table} WHERE id = ?`;
            this.db!.get(selectSQL, [id], (err, row: Record<string, unknown> | undefined) => {
                if (err) reject(err);
                else if (row) {
                    resolve(JSON.parse(row.data as string));
                } else {
                    resolve(null);
                }
            });
        });
    }

    async update(table: string, id: string, record: Record<string, unknown>): Promise<void> {
        if (!this.db) throw new Error('Not connected');
        return new Promise((resolve, reject) => {
            const updateSQL = `UPDATE ${table} SET data = ? WHERE id = ?`;
            this.db!.run(updateSQL, [JSON.stringify(record), id], (err) => {
                if (err) reject(err);
                else {
                    console.log(`Record ${id} updated in SQLite table ${table}`);
                    resolve();
                }
            });
        });
    }

    async delete(table: string, id: string): Promise<void> {
        if (!this.db) throw new Error('Not connected');
        return new Promise((resolve, reject) => {
            const deleteSQL = `DELETE FROM ${table} WHERE id = ?`;
            this.db!.run(deleteSQL, [id], (err) => {
                if (err) reject(err);
                else {
                    console.log(`Record ${id} deleted from SQLite table ${table}`);
                    resolve();
                }
            });
        });
    }


}
