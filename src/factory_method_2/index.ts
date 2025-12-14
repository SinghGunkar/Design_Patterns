import fs from 'fs';
import { EventFactory } from './eventFactory.js';
import { PGDatabaseFactory, MongoDBDatabaseFactory, SQLiteDatabaseFactory, JSONDatabaseFactory } from './database/index.js';

async function main() {
    const sampleData = fs.readFileSync('/Users/gunkar/Documents/Coding/Design_Patterns/src/factory_method_2/sampleEvents.json', 'utf-8');
    const records = JSON.parse(sampleData);

    const events = EventFactory.createEvents(records);

    const factories = [
        { name: 'PostgreSQL', factory: new PGDatabaseFactory() }, // uncomment for demo (need to have MongoDB running)
        { name: 'MongoDB', factory: new MongoDBDatabaseFactory() }, // uncomment for demo (need to have MongoDB running)
        { name: 'SQLite', factory: new SQLiteDatabaseFactory() },
        { name: 'JSON', factory: new JSONDatabaseFactory() }
    ];

    for (const { name, factory } of factories) {
        console.log(`\n=== Storing events in ${name} ===`);
        const connection = factory.createConnection();
        await connection.connect();
        for (const event of events) {
            await connection.createTable('events');
            await connection.save('events', event.toRecord());
        }
        await connection.disconnect();
    }

    console.log('\nAll events stored successfully!');
}

main().catch(console.error);
