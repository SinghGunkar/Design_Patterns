import type { DatabaseFactory } from '../interfaces.js';
import { SQLiteConnection } from '../connections/sqliteConnection.js';

export class SQLiteDatabaseFactory implements DatabaseFactory {
    createConnection() {
        return new SQLiteConnection();
    }
}
