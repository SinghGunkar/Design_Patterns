import { Client } from 'pg';
import type { DatabaseConnection } from '../interfaces.js';

export class PGConnection implements DatabaseConnection {
    private client: Client | null = null;
    private readonly config: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
    private readonly createTableSQL = `CREATE TABLE IF NOT EXISTS $1 (id TEXT PRIMARY KEY, data JSONB)`;

    constructor(config?: {
        host?: string;
        port?: number;
        database?: string;
        user?: string;
        password?: string;
    }) {
        this.config = {
            host: config?.host ?? 'localhost',
            port: config?.port ?? 5432,
            database: config?.database ?? 'eventdb',
            user: config?.user ?? 'postgres',
            password: config?.password ?? 'password'
        };
    }

    async connect(): Promise<void> {
        this.client = new Client(this.config);
        await this.client.connect();
    }

    async disconnect(): Promise<void> {
        if (!this.client) return;

        await this.client.end();
        this.client = null;
    }

    async createTable(table: string): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const createSQL = this.createTableSQL.replace('$1', table);
        await this.client.query(createSQL);
    }

    async save(table: string, record: Record<string, unknown>): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const insertSQL = `INSERT INTO ${table} (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
        await this.client.query(insertSQL, [record.id, JSON.stringify(record)]);
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
    }

    async delete(table: string, id: string): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        await this.client.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    }
}