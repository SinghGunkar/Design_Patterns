import { MongoClient } from 'mongodb';
import { Client } from 'pg';
import sqlite3 from 'sqlite3';
import fs from 'fs';

interface DatabaseConnection {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    save(table: string, record: Record<string, unknown>): Promise<void>;
    find(table: string, id: string): Promise<Record<string, unknown> | null>;
    update(table: string, id: string, record: Record<string, unknown>): Promise<void>;
    delete(table: string, id: string): Promise<void>;
    query(table: string, criteria: Record<string, unknown>): Promise<Record<string, unknown>[]>;
}

class PGConnection implements DatabaseConnection {
    private client: Client | null = null;
    private readonly host = 'localhost';
    private readonly port = 5432;
    private readonly database = 'eventdb';
    private readonly user = 'postgres';
    private readonly password = 'password';
    private readonly createTableSQL = `CREATE TABLE IF NOT EXISTS $1 (id TEXT PRIMARY KEY, data JSONB)`;

    async connect(): Promise<void> {
        this.client = new Client({
            host: this.host,
            port: this.port,
            database: this.database,
            user: this.user,
            password: this.password
        });
        await this.client.connect();
        console.log("Connected to PostgreSQL Database");
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.end();
            console.log("Disconnected from PostgreSQL Database");
        }
    }

    async save(table: string, record: Record<string, unknown>): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        await this.client.query(this.createTableSQL.replace('$1', table));
        const insertSQL = `INSERT INTO ${table} (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
        await this.client.query(insertSQL, [record.id, JSON.stringify(record)]);
        console.log(`Record saved to PostgreSQL table ${table}`);
    }

    async find(table: string, id: string): Promise<Record<string, unknown> | null> {
        if (!this.client) throw new Error('Not connected');
        const result = await this.client.query(`SELECT data FROM ${table} WHERE id = $1`, [id]);
        if (result.rows.length > 0) {
            return result.rows[0].data as Record<string, unknown>;
        }
        return null;
    }

    async update(table: string, id: string, record: Record<string, unknown>): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const updateSQL = `UPDATE ${table} SET data = $1 WHERE id = $2`;
        await this.client.query(updateSQL, [JSON.stringify(record), id]);
        console.log(`Record ${id} updated in PostgreSQL table ${table}`);
    }

    async delete(table: string, id: string): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        await this.client.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        console.log(`Record ${id} deleted from PostgreSQL table ${table}`);
    }

    async query(table: string, criteria: Record<string, unknown>): Promise<Record<string, unknown>[]> {
        if (!this.client) throw new Error('Not connected');
        // Simple implementation: fetch all and filter in memory
        const result = await this.client.query(`SELECT data FROM ${table}`);
        const records = result.rows.map(row => row.data as Record<string, unknown>);
        return records.filter(record => {
            for (const key in criteria) {
                if (record[key] !== criteria[key]) return false;
            }
            return true;
        });
    }
}

class MongoDBConnection implements DatabaseConnection {
    private client: MongoClient | null = null;
    private readonly uri = 'mongodb://localhost:27017';
    private readonly dbName = 'eventdb';

    async connect(): Promise<void> {
        this.client = new MongoClient(this.uri);
        await this.client.connect();
        console.log("Connected to MongoDB Database");
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            console.log("Disconnected from MongoDB Database");
        }
    }

    async save(table: string, record: Record<string, unknown>): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        await collection.insertOne(record);
        console.log(`Record saved to MongoDB table ${table}`);
    }

    async find(table: string, id: string): Promise<Record<string, unknown> | null> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        return await collection.findOne({ id });
    }

    async update(table: string, id: string, record: Record<string, unknown>): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        await collection.updateOne({ id }, { $set: record });
        console.log(`Record ${id} updated in MongoDB table ${table}`);
    }

    async delete(table: string, id: string): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        await collection.deleteOne({ id });
        console.log(`Record ${id} deleted from MongoDB table ${table}`);
    }

    async query(table: string, criteria: Record<string, unknown>): Promise<Record<string, unknown>[]> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        const results = await collection.find(criteria).toArray();
        return results;
    }
}

class SQLiteConnection implements DatabaseConnection {
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
            this.db!.get(selectSQL, [id], (err, row: any) => {
                if (err) reject(err);
                else if (row) {
                    resolve(JSON.parse(row.data));
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

    async query(table: string, criteria: Record<string, unknown>): Promise<Record<string, unknown>[]> {
        if (!this.db) throw new Error('Not connected');
        return new Promise((resolve, reject) => {
            const selectSQL = `SELECT data FROM ${table}`;
            this.db!.all(selectSQL, [], (err, rows: any[]) => {
                if (err) reject(err);
                else {
                    const records = rows.map(row => JSON.parse(row.data));
                    const filtered = records.filter(record => {
                        for (const key in criteria) {
                            if (record[key] !== criteria[key]) return false;
                        }
                        return true;
                    });
                    resolve(filtered);
                }
            });
        });
    }
}

class JSONConnection implements DatabaseConnection {
    private readonly filePath = './events.json';
    private readonly encoding = 'utf-8';

    async connect(): Promise<void> {
        console.log("JSON file ready");
    }
    async disconnect(): Promise<void> {
        console.log("JSON file closed");
    }
    async save(_table: string, record: Record<string, unknown>): Promise<void> {
        const data = JSON.stringify([record], null, 2);
        fs.writeFileSync(this.filePath, data);
        console.log('Record saved to JSON file');
    }
    async find(_table: string, id: string): Promise<Record<string, unknown> | null> {
        try {
            const data = fs.readFileSync(this.filePath, this.encoding);
            const records = JSON.parse(data);
            return records.find((r: any) => r.id === id) || null;
        } catch {
            return null;
        }
    }
    async update(_table: string, id: string, record: Record<string, unknown>): Promise<void> {
        try {
            const data = fs.readFileSync(this.filePath, this.encoding);
            let records = JSON.parse(data);
            records = records.map((r: any) => r.id === id ? { ...r, ...record } : r);
            fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2));
            console.log(`Record ${id} updated in JSON file`);
        } catch (error) {
            console.error('Error updating JSON file', error);
        }
    }
    async delete(_table: string, id: string): Promise<void> {
        try {
            const data = fs.readFileSync(this.filePath, this.encoding);
            let records = JSON.parse(data);
            records = records.filter((r: any) => r.id !== id);
            fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2));
            console.log(`Record ${id} deleted from JSON file`);
        } catch (error) {
            console.error('Error deleting from JSON file', error);
        }
    }
    async query(_table: string, criteria: Record<string, unknown>): Promise<Record<string, unknown>[]> {
        try {
            const data = fs.readFileSync(this.filePath, this.encoding);
            const records = JSON.parse(data);
            return records.filter((r: any) => {
                for (const key in criteria) {
                    if (r[key] !== criteria[key]) return false;
                }
                return true;
            });
        } catch {
            return [];
        }
    }
}

interface DatabaseFactory {
    createConnection(): DatabaseConnection;
}

class PGDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new PGConnection();
    }
}

class MongoDBDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new MongoDBConnection();
    }
}

class SQLiteDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new SQLiteConnection();
    }
}

class JSONDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new JSONConnection();
    }
}

export { PGDatabaseFactory, MongoDBDatabaseFactory, SQLiteDatabaseFactory, JSONDatabaseFactory }
