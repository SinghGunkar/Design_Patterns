import { MongoClient } from 'mongodb';
import type { DatabaseConnection } from '../interfaces.js';

export class MongoDBConnection implements DatabaseConnection {
    private client: MongoClient | null = null;
    private readonly uri: string;
    private readonly dbName: string;

    constructor(config?: {
        uri?: string;
        dbName?: string;
    }) {
        this.uri = config?.uri ?? 'mongodb://localhost:27017';
        this.dbName = config?.dbName ?? 'eventdb';
    }

    async connect(): Promise<void> {
        this.client = new MongoClient(this.uri);
        await this.client.connect();
    }

    async disconnect(): Promise<void> {
        if (!this.client) return;

        await this.client.close();
        this.client = null;
    }

    async createTable(table: string): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        await db.createCollection(table);
        const collection = db.collection(table);
        await collection.createIndex({ id: 1 }, { unique: true });
    }

    async save(table: string, record: Record<string, unknown>): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        await collection.replaceOne({ id: record.id }, record, { upsert: true });
    }

    async find(table: string, id: string): Promise<Record<string, unknown> | null> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        const result = await collection.findOne({ id });
        if (!result) return null;
        const { _id, ...record } = result;
        return record as Record<string, unknown>;
    }

    async update(table: string, id: string, record: Record<string, unknown>): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        await collection.updateOne({ id }, { $set: record });
    }

    async delete(table: string, id: string): Promise<void> {
        if (!this.client) throw new Error('Not connected');
        const db = this.client.db(this.dbName);
        const collection = db.collection(table);
        await collection.deleteOne({ id });
    }
}