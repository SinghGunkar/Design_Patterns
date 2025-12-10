import type { DatabaseFactory } from '../interfaces.js';
import { PGConnection } from '../connections/pgConnection.js';

export class PGDatabaseFactory implements DatabaseFactory {
    createConnection() {
        return new PGConnection();
    }
}
