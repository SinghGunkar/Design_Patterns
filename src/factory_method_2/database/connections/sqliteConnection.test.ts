import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteConnection } from './sqliteConnection.js';

describe('SQLiteConnection', () => {
    let connection: SQLiteConnection;

    beforeEach(async () => {
        connection = new SQLiteConnection(':memory:');
        await connection.connect();
    });

    afterEach(async () => {
        await connection.disconnect();
    });

    describe('connect', () => {
        it('should successfully connect to database', async () => {
            const newConnection = new SQLiteConnection(':memory:');
            await expect(newConnection.connect()).resolves.not.toThrow();
            await newConnection.disconnect();
        });

        it('should allow connection to file-based database', async () => {
            const fileConnection = new SQLiteConnection('./test-temp.db');
            await expect(fileConnection.connect()).resolves.not.toThrow();
            await fileConnection.disconnect();
        });
    });

    describe('disconnect', () => {
        it('should disconnect without errors', async () => {
            await expect(connection.disconnect()).resolves.not.toThrow();
        });

        it('should handle disconnect when not connected', async () => {
            const newConnection = new SQLiteConnection(':memory:');
            await expect(newConnection.disconnect()).resolves.not.toThrow();
        });
    });

    describe('createTable', () => {
        it('should create a new table', async () => {
            await expect(connection.createTable('new_table')).resolves.not.toThrow();
        });

        it('should not throw error if table already exists', async () => {
            await connection.createTable('existing_table');
            await expect(connection.createTable('existing_table')).resolves.not.toThrow();
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

        it('should handle complex nested objects', async () => {
            await connection.createTable('complex_table');
            const record = {
                id: 'complex-123',
                type: 'complex',
                nested: {
                    level1: {
                        level2: {
                            value: 42
                        }
                    }
                },
                array: [1, 2, 3, { key: 'value' }]
            };

            await connection.save('complex_table', record);
            const retrieved = await connection.find('complex_table', 'complex-123');

            expect(retrieved).toEqual(record);
        });

        it('should throw error when table does not exist', async () => {
            const record = { id: 'test-123', data: 'test' };

            await expect(connection.save('non_existent_table', record))
                .rejects.toThrow('SQLITE_ERROR');
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
            expect(found).toEqual(updated);
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

            // Create
            await connection.save(table, record);
            let found = await connection.find(table, 'crud-123');
            expect(found).toEqual(record);

            // Update
            const updated = { ...record, value: 200 };
            await connection.update(table, 'crud-123', updated);
            found = await connection.find(table, 'crud-123');
            expect(found?.value).toBe(200);

            // Delete
            await connection.delete(table, 'crud-123');
            found = await connection.find(table, 'crud-123');
            expect(found).toBeNull();
        });

        it('should handle multiple records in same table', async () => {
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

        it('should handle multiple tables', async () => {
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

        it('should isolate data between different connections', async () => {
            const connection2 = new SQLiteConnection(':memory:');
            await connection2.connect();

            await connection.createTable('isolation_test');
            await connection2.createTable('isolation_test');

            await connection.save('isolation_test', { id: 'conn1', data: 'first' });
            await connection2.save('isolation_test', { id: 'conn2', data: 'second' });

            const found1 = await connection.find('isolation_test', 'conn1');
            const found2 = await connection.find('isolation_test', 'conn2');
            const found3 = await connection2.find('isolation_test', 'conn1');

            expect(found1?.data).toBe('first');
            expect(found2).toBeNull(); // conn2 data not in connection
            expect(found3).toBeNull(); // conn1 data not in connection2

            await connection2.disconnect();
        });
    });
});