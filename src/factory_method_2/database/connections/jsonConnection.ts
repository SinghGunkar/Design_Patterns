import fs from 'fs';
import type { DatabaseConnection } from '../interfaces.js';

export class JSONConnection implements DatabaseConnection {
    private readonly filePath: string;
    private readonly encoding = 'utf-8';
    private data: Record<string, Record<string, unknown>[]> = {};
    private connected: boolean = false;


    constructor(filePath: string = './events.json') {
        this.filePath = filePath;
    }

    private ensureConnected(): void {
        if (!this.connected) throw new Error('Not connected');
    }

    async connect(): Promise<void> {
        if (fs.existsSync(this.filePath)) {
            const content = fs.readFileSync(this.filePath, this.encoding);
            this.data = JSON.parse(content);
        } else {
            this.data = {};
        }
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        this.data = {};
        this.connected = false;
    }


    async createTable(table: string): Promise<void> {
        this.ensureConnected();
        if (!this.data[table]) {
            this.data[table] = [];
            this.persist();
        }
    }


    async save(table: string, record: Record<string, unknown>): Promise<void> {
        this.ensureConnected();
        if (!this.data[table]) throw new Error(`Table ${table} does not exist`);

        // Find and replace if exists, otherwise add
        const index = this.data[table].findIndex(r => r.id === record.id);
        if (index >= 0) {
            this.data[table][index] = record;
        } else {
            this.data[table].push(record);
        }
        this.persist();
    }

    async find(table: string, id: string): Promise<Record<string, unknown> | null> {
        this.ensureConnected();

        if (!this.data[table]) return null;

        return this.data[table].find(r => r.id === id) || null;
    }

    async update(table: string, id: string, record: Record<string, unknown>): Promise<void> {
        this.ensureConnected();

        if (!this.data[table]) throw new Error(`Table ${table} does not exist`);

        const index = this.data[table].findIndex(r => r.id === id);
        if (index >= 0) {
            this.data[table][index] = { ...this.data[table][index], ...record };
            this.persist();
        }
    }


    async delete(table: string, id: string): Promise<void> {
        this.ensureConnected();
        if (!this.data[table]) throw new Error(`Table ${table} does not exist`);

        this.data[table] = this.data[table].filter(r => r.id !== id);
        this.persist();
    }

    private persist(): void {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    }
}