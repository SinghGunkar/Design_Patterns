import type { DatabaseFactory } from '../interfaces.js';
import { MongoDBConnection } from '../connections/mongoConnection.js';

export class MongoDBDatabaseFactory implements DatabaseFactory {
    createConnection() {
        return new MongoDBConnection();
    }
}
