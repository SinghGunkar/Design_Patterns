export interface DatabaseConnection {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    createTable(table: string): Promise<void>; // Add this
    save(table: string, record: Record<string, unknown>): Promise<void>;
    find(table: string, id: string): Promise<Record<string, unknown> | null>;
    update(table: string, id: string, record: Record<string, unknown>): Promise<void>;
    delete(table: string, id: string): Promise<void>;
}

export interface DatabaseFactory {
    createConnection(): DatabaseConnection;
}
