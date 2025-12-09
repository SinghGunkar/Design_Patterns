interface DatabaseConnection {
    connect(): void;
    disconnect(): void;
}

class PGConnection implements DatabaseConnection {
    connect(): void {
        console.log("Connected to MyPG Database");
    }
    disconnect(): void {
        console.log("Disconnected from MyPG Database");
    }
}

class MongoDBConnection implements DatabaseConnection {
    connect(): void {
        console.log("Connected to MongoDB Database");
    }
    disconnect(): void {
        console.log("Disconnected from MongoDB Database");
    }
}

class SQLiteConnection implements DatabaseConnection {
    connect(): void {
        console.log("Connected to SQLite Database");
    }
    disconnect(): void {
        console.log("Disconnected from SQLite Database");
    }
}

class JSONConnection implements DatabaseConnection {
    connect(): void {
        console.log("JSON file ready");
    }
    disconnect(): void {
        console.log("JSON file closed");
    }
}

interface DatabaseFactory {
    createConnection(): DatabaseConnection;
}

class PGDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new PGConnection();
    }
}

class MongoDBDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new MongoDBConnection();
    }
}

class SQLiteDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new SQLiteConnection();
    }
}

class JSONDatabaseFactory implements DatabaseFactory {
    createConnection(): DatabaseConnection {
        return new JSONConnection();
    }
}

export { PGDatabaseFactory, MongoDBDatabaseFactory, SQLiteDatabaseFactory, JSONDatabaseFactory }  
