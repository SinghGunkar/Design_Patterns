import fs from 'fs';
import type { DatabaseConnection } from '../interfaces.js';

export class JSONConnection implements DatabaseConnection {
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
            return records.find((r: Record<string, unknown>) => r.id === id) || null;
        } catch {
            return null;
        }
    }
    async update(_table: string, id: string, record: Record<string, unknown>): Promise<void> {
        try {
            const data = fs.readFileSync(this.filePath, this.encoding);
            let records = JSON.parse(data);
            records = records.map((r: Record<string, unknown>) => r.id === id ? { ...r, ...record } : r);
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
            records = records.filter((r: Record<string, unknown>) => r.id !== id);
            fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2));
            console.log(`Record ${id} deleted from JSON file`);
        } catch (error) {
            console.error('Error deleting from JSON file', error);
        }
    }

}
