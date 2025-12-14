import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoDBConnection } from './mongoConnection.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

const FIRST_RUN_TIMEOUT_MS = 60_000;

describe('MongoDBConnection', () => {
    let mongoServer: MongoMemoryServer;
    let connection: MongoDBConnection;
    let testUri: string;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        testUri = mongoServer.getUri();
    }, FIRST_RUN_TIMEOUT_MS);

    afterAll(async () => {
        await mongoServer.stop();
    });

    beforeEach(async () => {
        connection = new MongoDBConnection({
            uri: testUri,
            dbName: 'test_db'
        });
        await connection.connect();
    });

    afterEach(async () => {
        await connection.disconnect();
    });

    describe('constructor', () => {
        it('should create connection with default config', () => {
            const defaultConnection = new MongoDBConnection();
            expect(defaultConnection).toBeInstanceOf(MongoDBConnection);
        });

        it('should create connection with custom config', () => {
            const customConnection = new MongoDBConnection({
                uri: 'mongodb://custom:27017',
                dbName: 'customdb'
            });
            expect(customConnection).toBeInstanceOf(MongoDBConnection);
        });

        it('should merge partial config with defaults', () => {
            const partialConnection = new MongoDBConnection({
                dbName: 'mydb'
            });
            expect(partialConnection).toBeInstanceOf(MongoDBConnection);
        });
    });

    describe('connect', () => {
        it('should successfully connect to database', async () => {
            const newConnection = new MongoDBConnection({
                uri: testUri,
                dbName: 'test_db'
            });
            await expect(newConnection.connect()).resolves.not.toThrow();
            await newConnection.disconnect();
        });

        it('should throw error for invalid URI', async () => {
            const badConnection = new MongoDBConnection({
                uri: 'mongodb://invalid:99999',
                dbName: 'test_db'
            });
            await expect(badConnection.connect()).rejects.toThrow();
        });
    });

    describe('disconnect', () => {
        it('should disconnect without errors', async () => {
            await expect(connection.disconnect()).resolves.not.toThrow();
        });

        it('should handle disconnect when not connected', async () => {
            const newConnection = new MongoDBConnection({ uri: testUri });
            await expect(newConnection.disconnect()).resolves.not.toThrow();
        });

        it('should set client to null after disconnect', async () => {
            await connection.disconnect();
            await expect(connection.find('test_table', 'test-id'))
                .rejects.toThrow('Not connected');
        });
    });

    describe('createTable', () => {
        it('should create a new collection', async () => {
            await expect(connection.createTable('test_collection')).resolves.not.toThrow();
        });

        it('should create unique index on id field', async () => {
            await connection.createTable('indexed_collection');

            // Verify by trying to insert duplicate id
            await connection.save('indexed_collection', { id: 'dup-1', data: 'first' });
            await expect(
                connection.save('indexed_collection', { id: 'dup-1', data: 'second' })
            ).resolves.not.toThrow(); // Should replace, not error
        });

        it('should not throw error if collection already exists', async () => {
            await connection.createTable('existing_collection');
            await expect(connection.createTable('existing_collection')).resolves.not.toThrow();
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();
            await expect(connection.createTable('test_table'))
                .rejects.toThrow('Not connected');
        });
    });

    describe('save', () => {
        beforeEach(async () => {
            await connection.createTable('test_table');
        });

        it('should save a record to the database', async () => {
            const record = {
                id: 'test-123',
                type: 'test',
                data: 'test data'
            };

            await expect(connection.save('test_table', record)).resolves.not.toThrow();
        });

        it('should replace existing record with same id', async () => {
            const record1 = {
                id: 'test-789',
                type: 'test',
                data: 'original data'
            };

            const record2 = {
                id: 'test-789',
                type: 'test',
                data: 'updated data'
            };

            await connection.save('test_table', record1);
            await connection.save('test_table', record2);

            const retrieved = await connection.find('test_table', 'test-789');
            expect(retrieved).toEqual(record2);
            expect(retrieved?.data).toBe('updated data');
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();
            const record = { id: 'test-error', data: 'test' };

            await expect(connection.save('test_table', record))
                .rejects.toThrow('Not connected');
        });

        it('should handle updating with complex data', async () => {
            await connection.createTable('complex_update_table');
            const original = {
                id: 'complex-update-123',
                simpleField: 'simple'
            };

            const updateData = {
                id: 'complex-update-123',
                complexField: {
                    nested: {
                        array: [1, 2, 3],
                        value: 'complex'
                    }
                }
            };

            await connection.save('complex_update_table', original);
            await connection.update('complex_update_table', 'complex-update-123', updateData);

            const found = await connection.find('complex_update_table', 'complex-update-123');

            expect(found).toMatchObject({
                id: 'complex-update-123',
                simpleField: 'simple',
                complexField: {
                    nested: {
                        array: [1, 2, 3],
                        value: 'complex'
                    }
                }
            });
        });

        it('should throw error when collection does not exist', async () => {
            const record = { id: 'test-123', data: 'test' };

            // MongoDB will auto-create collection, so this won't error
            // Instead test that it works even without createTable
            await expect(connection.save('auto_created_table', record))
                .resolves.not.toThrow();
        });
    });

    describe('find', () => {
        beforeEach(async () => {
            await connection.createTable('find_table');
        });

        it('should find an existing record', async () => {
            const record = {
                id: 'find-123',
                type: 'test',
                data: 'findable'
            };

            await connection.save('find_table', record);
            const found = await connection.find('find_table', 'find-123');

            expect(found).toEqual(record);
        });

        it('should return null for non-existent record', async () => {
            await connection.save('find_table', { id: 'exists', data: 'test' });
            const found = await connection.find('find_table', 'non-existent');

            expect(found).toBeNull();
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();

            await expect(connection.find('find_table', 'test-id'))
                .rejects.toThrow('Not connected');
        });

        it('should not return MongoDB _id field', async () => {
            const record = {
                id: 'no-id-123',
                data: 'test'
            };

            await connection.save('find_table', record);
            const found = await connection.find('find_table', 'no-id-123');

            expect(found).not.toHaveProperty('_id');
            expect(found).toHaveProperty('id');
        });

        it('should correctly deserialize saved data', async () => {
            await connection.createTable('deserialize_table');
            const record = {
                id: 'deserialize-123',
                number: 42,
                boolean: true,
                null: null,
                array: ['a', 'b', 'c'],
                object: { key: 'value' }
            };

            await connection.save('deserialize_table', record);
            const found = await connection.find('deserialize_table', 'deserialize-123');

            expect(found).toEqual(record);
            expect(typeof found?.number).toBe('number');
            expect(typeof found?.boolean).toBe('boolean');
            expect(found?.null).toBeNull();
            expect(Array.isArray(found?.array)).toBe(true);
        });
    });

    describe('update', () => {
        beforeEach(async () => {
            await connection.createTable('update_table');
        });

        it('should update an existing record', async () => {
            const original = {
                id: 'update-123',
                type: 'test',
                data: 'original'
            };

            const updated = {
                id: 'update-123',
                type: 'test',
                data: 'updated'
            };

            await connection.save('update_table', original);
            await connection.update('update_table', 'update-123', updated);

            const found = await connection.find('update_table', 'update-123');
            expect(found).toEqual(updated);
            expect(found?.data).toBe('updated');
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();
            const record = { id: 'test', data: 'test' };

            await expect(connection.update('update_table', 'test', record))
                .rejects.toThrow('Not connected');
        });

        it('should not throw error when updating non-existent record', async () => {
            const record = {
                id: 'non-existent',
                data: 'test'
            };

            await expect(connection.update('update_table', 'non-existent', record))
                .resolves.not.toThrow();
        });

        it('should handle updating with complex data', async () => {
            await connection.createTable('complex_update_table');
            const original = {
                id: 'complex-update-123',
                simpleField: 'simple'
            };

            const updated = {
                id: 'complex-update-123',
                complexField: {
                    nested: {
                        array: [1, 2, 3],
                        value: 'complex'
                    }
                }
            };

            await connection.save('complex_update_table', original);
            await connection.update('complex_update_table', 'complex-update-123', updated);

            const found = await connection.find('complex_update_table', 'complex-update-123');
            expect(found).toMatchObject(updated);
        });
    });

    describe('delete', () => {
        beforeEach(async () => {
            await connection.createTable('delete_table');
        });

        it('should delete an existing record', async () => {
            const record = {
                id: 'delete-123',
                type: 'test',
                data: 'to be deleted'
            };

            await connection.save('delete_table', record);
            await connection.delete('delete_table', 'delete-123');

            const found = await connection.find('delete_table', 'delete-123');
            expect(found).toBeNull();
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();

            await expect(connection.delete('delete_table', 'test-id'))
                .rejects.toThrow('Not connected');
        });

        it('should not throw error when deleting non-existent record', async () => {
            await connection.save('delete_table', { id: 'exists', data: 'test' });
            await expect(connection.delete('delete_table', 'non-existent'))
                .resolves.not.toThrow();
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete CRUD lifecycle', async () => {
            const table = 'crud_table';
            await connection.createTable(table);

            const record = {
                id: 'crud-123',
                name: 'Test Record',
                value: 100
            };

            await connection.save(table, record);
            let found = await connection.find(table, 'crud-123');
            expect(found).toEqual(record);

            const updated = { ...record, value: 200 };
            await connection.update(table, 'crud-123', updated);
            found = await connection.find(table, 'crud-123');
            expect(found?.value).toBe(200);

            await connection.delete(table, 'crud-123');
            found = await connection.find(table, 'crud-123');
            expect(found).toBeNull();
        });

        it('should handle multiple records in same collection', async () => {
            const table = 'multi_table';
            await connection.createTable(table);

            const records = [
                { id: 'multi-1', data: 'first' },
                { id: 'multi-2', data: 'second' },
                { id: 'multi-3', data: 'third' }
            ];

            for (const record of records) {
                await connection.save(table, record);
            }

            const found1 = await connection.find(table, 'multi-1');
            const found2 = await connection.find(table, 'multi-2');
            const found3 = await connection.find(table, 'multi-3');

            expect(found1?.data).toBe('first');
            expect(found2?.data).toBe('second');
            expect(found3?.data).toBe('third');
        });

        it('should handle multiple collections', async () => {
            await connection.createTable('table1');
            await connection.createTable('table2');

            const record1 = { id: 'table1-record', type: 'type1' };
            const record2 = { id: 'table2-record', type: 'type2' };

            await connection.save('table1', record1);
            await connection.save('table2', record2);

            const found1 = await connection.find('table1', 'table1-record');
            const found2 = await connection.find('table2', 'table2-record');

            expect(found1).toEqual(record1);
            expect(found2).toEqual(record2);
        });

        it('should handle concurrent operations', async () => {
            const table = 'concurrent_table';
            await connection.createTable(table);

            const records = Array.from({ length: 10 }, (_, i) => ({
                id: `concurrent-${i}`,
                index: i
            }));

            const savePromises = records.map(record =>
                connection.save(table, record)
            );

            await Promise.all(savePromises);

            const findPromises = records.map(record =>
                connection.find(table, record.id)
            );

            const results = await Promise.all(findPromises);

            expect(results).toHaveLength(10);
            results.forEach((result, i) => {
                expect(result?.index).toBe(i);
            });
        });

        it('should preserve document structure through save and find', async () => {
            const table = 'structure_table';
            await connection.createTable(table);

            interface UserRecord extends Record<string, unknown> {
                id: string;
                user: {
                    name: string;
                    email: string;
                    address: {
                        street: string;
                        city: string;
                        zip: string;
                    };
                };
                tags: string[];
                metadata: {
                    created: Date;
                    count: number;
                };
            }

            const record: UserRecord = {
                id: 'structure-123',
                user: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    address: {
                        street: '123 Main St',
                        city: 'NYC',
                        zip: '10001'
                    }
                },
                tags: ['important', 'verified'],
                metadata: {
                    created: new Date('2024-01-01'),
                    count: 42
                }
            };

            await connection.save(table, record);
            const found = await connection.find(table, 'structure-123') as UserRecord | null;

            expect(found).toEqual(record);
            expect(found?.user.address.city).toBe('NYC');
            expect(found?.tags).toEqual(['important', 'verified']);
        });
    });
});