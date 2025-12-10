import { MongoClient } from 'mongodb';
import type { DatabaseConnection } from '../interfaces.js';

export class MongoDBConnection implements DatabaseConnection {
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


}
