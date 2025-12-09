import fs from 'fs';
import { EventFactory } from './eventFactory.js';
import { PGDatabaseFactory, MongoDBDatabaseFactory, SQLiteDatabaseFactory, JSONDatabaseFactory } from './databases.js';

async function main() {
    const sampleData = fs.readFileSync('./sampleEvents.json', 'utf-8');
    const records = JSON.parse(sampleData);

    const events = EventFactory.createEvents(records);

    const factories = [
        { name: 'PostgreSQL', factory: new PGDatabaseFactory() },
        { name: 'MongoDB', factory: new MongoDBDatabaseFactory() },
        { name: 'SQLite', factory: new SQLiteDatabaseFactory() },
        { name: 'JSON', factory: new JSONDatabaseFactory() }
    ];

    for (const { name, factory } of factories) {
        console.log(`\n=== Storing events in ${name} ===`);
        const connection = factory.createConnection();
        await connection.connect();
        for (const event of events) {
            await connection.save('events', event.toRecord());
        }
        await connection.disconnect();
    }

    console.log('\nAll events stored successfully!');
}

main().catch(console.error);
