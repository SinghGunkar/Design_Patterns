import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSONConnection } from './jsonConnection.js';
import fs from 'fs';
import path from 'path';

describe('JSONConnection', () => {
    let connection: JSONConnection;
    const testFilePath = path.join(__dirname, 'test-events.json');

    beforeEach(async () => {
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }

        connection = new JSONConnection(testFilePath);
        await connection.connect();
    });

    afterEach(async () => {
        await connection.disconnect();
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    describe('constructor', () => {
        it('should create connection with default file path', () => {
            const defaultConnection = new JSONConnection();
            expect(defaultConnection).toBeInstanceOf(JSONConnection);
        });

        it('should create connection with custom file path', () => {
            const customConnection = new JSONConnection('./custom-path.json');
            expect(customConnection).toBeInstanceOf(JSONConnection);
        });
    });

    describe('connect', () => {
        it('should initialize empty data when file does not exist', async () => {
            const newConnection = new JSONConnection(testFilePath);
            await newConnection.connect();

            // Should not throw and should allow operations
            await expect(newConnection.createTable('test')).resolves.not.toThrow();
            await newConnection.disconnect();
        });

        it('should load existing data when file exists', async () => {
            // Create a file with existing data
            const existingData = {
                events: [
                    { id: 'evt-1', type: 'test', data: 'existing' }
                ]
            };
            fs.writeFileSync(testFilePath, JSON.stringify(existingData, null, 2));

            const newConnection = new JSONConnection(testFilePath);
            await newConnection.connect();

            const found = await newConnection.find('events', 'evt-1');
            expect(found).toEqual({ id: 'evt-1', type: 'test', data: 'existing' });

            await newConnection.disconnect();
        });

        it('should handle malformed JSON gracefully', async () => {
            // Write invalid JSON
            fs.writeFileSync(testFilePath, '{ invalid json }');

            const newConnection = new JSONConnection(testFilePath);
            await expect(newConnection.connect()).rejects.toThrow();
        });
    });

    describe('disconnect', () => {
        it('should write data to file on disconnect', async () => {
            await connection.createTable('test_table');
            await connection.save('test_table', { id: 'test-1', data: 'test' });
            await connection.disconnect();

            // Verify file was written
            expect(fs.existsSync(testFilePath)).toBe(true);

            const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
            expect(content).toHaveProperty('test_table');
            expect(content.test_table).toHaveLength(1);
        });

        it('should clear in-memory data after disconnect', async () => {
            await connection.createTable('test_table');
            await connection.disconnect();

            // Trying to use connection after disconnect should fail
            await expect(connection.find('test_table', 'test-1'))
                .rejects.toThrow('Not connected');
        });

        it('should create file if it does not exist', async () => {
            await connection.createTable('test_table');
            await connection.disconnect();

            expect(fs.existsSync(testFilePath)).toBe(true);
        });
    });

    describe('createTable', () => {
        it('should create a new table', async () => {
            await expect(connection.createTable('test_table')).resolves.not.toThrow();
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

        it('should persist table to file', async () => {
            await connection.createTable('persisted_table');

            const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
            expect(content).toHaveProperty('persisted_table');
            expect(content.persisted_table).toEqual([]);
        });
    });

    describe('save', () => {
        beforeEach(async () => {
            await connection.createTable('test_table');
        });

        it('should save a record to the table', async () => {
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

        it('should throw error when table does not exist', async () => {
            const record = { id: 'test-123', data: 'test' };

            await expect(connection.save('non_existent_table', record))
                .rejects.toThrow('Table non_existent_table does not exist');
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

        it('should persist to file immediately', async () => {
            const record = { id: 'persist-test', data: 'test' };
            await connection.save('test_table', record);

            const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
            expect(content.test_table).toContainEqual(record);
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

        it('should return null for non-existent table', async () => {
            const found = await connection.find('non_existent_table', 'any-id');

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
            expect(found).toMatchObject(updated);
            expect(found?.data).toBe('updated');
        });

        it('should merge update data with existing record', async () => {
            const original = {
                id: 'merge-123',
                field1: 'value1',
                field2: 'value2'
            };

            await connection.save('update_table', original);
            await connection.update('update_table', 'merge-123', { field2: 'updated' });

            const found = await connection.find('update_table', 'merge-123');
            expect(found).toEqual({
                id: 'merge-123',
                field1: 'value1',
                field2: 'updated'
            });
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();
            const record = { id: 'test', data: 'test' };

            await expect(connection.update('update_table', 'test', record))
                .rejects.toThrow('Not connected');
        });

        it('should throw error when table does not exist', async () => {
            const record = { id: 'test', data: 'test' };

            await expect(connection.update('non_existent_table', 'test', record))
                .rejects.toThrow('Table non_existent_table does not exist');
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

            const updateData = {
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

        it('should persist update to file immediately', async () => {
            const record = { id: 'persist-update', data: 'original' };
            await connection.save('update_table', record);
            await connection.update('update_table', 'persist-update', { data: 'updated' });

            const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
            const savedRecord = content.update_table.find((r: any) => r.id === 'persist-update');
            expect(savedRecord.data).toBe('updated');
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

        it('should throw error when table does not exist', async () => {
            await expect(connection.delete('non_existent_table', 'test-id'))
                .rejects.toThrow('Table non_existent_table does not exist');
        });

        it('should not throw error when deleting non-existent record', async () => {
            await connection.save('delete_table', { id: 'exists', data: 'test' });
            await expect(connection.delete('delete_table', 'non-existent'))
                .resolves.not.toThrow();
        });

        it('should persist deletion to file immediately', async () => {
            const record = { id: 'persist-delete', data: 'test' };
            await connection.save('delete_table', record);
            await connection.delete('delete_table', 'persist-delete');

            const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
            const deleted = content.delete_table.find((r: any) => r.id === 'persist-delete');
            expect(deleted).toBeUndefined();
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
            await connection.update(table, 'crud-123', { value: 200 });
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

        it('should persist across disconnect and reconnect', async () => {
            await connection.createTable('persist_table');
            await connection.save('persist_table', { id: 'persist-1', data: 'test' });
            await connection.disconnect();

            // Reconnect
            const newConnection = new JSONConnection(testFilePath);
            await newConnection.connect();

            const found = await newConnection.find('persist_table', 'persist-1');
            expect(found).toEqual({ id: 'persist-1', data: 'test' });

            await newConnection.disconnect();
        });

        it('should handle file structure correctly', async () => {
            await connection.createTable('events');
            await connection.createTable('logs');

            await connection.save('events', { id: 'evt-1', type: 'workflow' });
            await connection.save('logs', { id: 'log-1', message: 'test' });

            const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

            expect(content).toHaveProperty('events');
            expect(content).toHaveProperty('logs');
            expect(content.events).toHaveLength(1);
            expect(content.logs).toHaveLength(1);
        });
    });
});