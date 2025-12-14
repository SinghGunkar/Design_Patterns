import type { DatabaseFactory } from '../interfaces.js';
import { JSONConnection } from '../connections/jsonConnection.js';

export class JSONDatabaseFactory implements DatabaseFactory {
    createConnection() {
        return new JSONConnection();
    }
}
