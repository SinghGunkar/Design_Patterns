import { Client } from 'pg';
import type { DatabaseConnection } from '../interfaces.js';

export class PGConnection implements DatabaseConnection {
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


}
