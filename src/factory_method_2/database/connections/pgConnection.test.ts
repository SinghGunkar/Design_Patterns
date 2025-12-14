import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PGConnection } from './pgConnection.js';
import { Client } from 'pg';

// Mock the pg Client
vi.mock('pg');

describe('PGConnection', () => {
    let connection: PGConnection;
    let mockClient: any;

    beforeEach(async () => {
        // Setup mock client instance
        mockClient = {
            connect: vi.fn().mockResolvedValue(undefined),
            end: vi.fn().mockResolvedValue(undefined),
            query: vi.fn().mockResolvedValue({ rows: [] })
        };

        // Mock Client constructor
        vi.mocked(Client).mockImplementation(function (this: any) {
            return mockClient;
        } as any);

        connection = new PGConnection({
            host: 'localhost',
            port: 5432,
            database: 'test_db',
            user: 'test_user',
            password: 'test_pass'
        });
        await connection.connect();
    });

    afterEach(async () => {
        await connection.disconnect();
    });

    describe('constructor', () => {
        it('should create connection with default config', () => {
            const defaultConnection = new PGConnection();
            expect(defaultConnection).toBeInstanceOf(PGConnection);
        });

        it('should create connection with custom config', () => {
            const customConnection = new PGConnection({
                host: 'customhost',
                port: 5433,
                database: 'customdb',
                user: 'customuser',
                password: 'custompass'
            });
            expect(customConnection).toBeInstanceOf(PGConnection);
        });

        it('should merge partial config with defaults', () => {
            const partialConnection = new PGConnection({
                database: 'mydb'
            });
            expect(partialConnection).toBeInstanceOf(PGConnection);
        });
    });

    describe('connect', () => {
        it('should call client.connect()', async () => {
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
        });

        it('should create Client with correct config', () => {
            expect(Client).toHaveBeenCalledWith({
                host: 'localhost',
                port: 5432,
                database: 'test_db',
                user: 'test_user',
                password: 'test_pass'
            });
        });

        it('should propagate connection errors', async () => {
            const errorConnection = new PGConnection();
            mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'));

            await expect(errorConnection.connect()).rejects.toThrow('Connection failed');
        });
    });

    describe('disconnect', () => {
        it('should call client.end()', async () => {
            await connection.disconnect();
            expect(mockClient.end).toHaveBeenCalledTimes(1);
        });

        it('should handle disconnect when not connected', async () => {
            const newConnection = new PGConnection();
            await expect(newConnection.disconnect()).resolves.not.toThrow();
        });

        it('should set client to null after disconnect', async () => {
            await connection.disconnect();
            await expect(connection.find('test_table', 'test-id'))
                .rejects.toThrow('Not connected');
        });
    });

    describe('createTable', () => {
        it('should execute CREATE TABLE query', async () => {
            await connection.createTable('test_table');

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('CREATE TABLE IF NOT EXISTS test_table')
            );
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();
            await expect(connection.createTable('test_table'))
                .rejects.toThrow('Not connected');
        });
    });

    describe('save', () => {
        it('should execute INSERT query with correct parameters', async () => {
            const record = {
                id: 'test-123',
                type: 'test',
                data: 'test data'
            };

            await connection.save('test_table', record);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO test_table'),
                ['test-123', JSON.stringify(record)]
            );
        });

        it('should use ON CONFLICT for upsert', async () => {
            const record = { id: 'test-456', data: 'test' };

            await connection.save('test_table', record);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('ON CONFLICT (id) DO UPDATE'),
                expect.any(Array)
            );
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();
            const record = { id: 'test-error', data: 'test' };

            await expect(connection.save('test_table', record))
                .rejects.toThrow('Not connected');
        });

        it('should handle complex nested objects', async () => {
            const record = {
                id: 'complex-123',
                nested: {
                    level1: { level2: { value: 42 } }
                },
                array: [1, 2, 3]
            };

            await connection.save('complex_table', record);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.any(String),
                ['complex-123', JSON.stringify(record)]
            );
        });

        it('should propagate database errors', async () => {
            mockClient.query.mockRejectedValueOnce(new Error('Table does not exist'));
            const record = { id: 'test-123', data: 'test' };

            await expect(connection.save('non_existent_table', record))
                .rejects.toThrow('Table does not exist');
        });
    });

    describe('find', () => {
        it('should execute SELECT query', async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{ data: { id: 'find-123', type: 'test' } }]
            });

            await connection.find('find_table', 'find-123');

            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT data FROM find_table WHERE id = $1',
                ['find-123']
            );
        });

        it('should return record when found', async () => {
            const record = { id: 'find-123', data: 'findable' };
            mockClient.query.mockResolvedValueOnce({
                rows: [{ data: record }]
            });

            const found = await connection.find('find_table', 'find-123');
            expect(found).toEqual(record);
        });

        it('should return null when record not found', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            const found = await connection.find('find_table', 'non-existent');
            expect(found).toBeNull();
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();

            await expect(connection.find('find_table', 'test-id'))
                .rejects.toThrow('Not connected');
        });

        it('should correctly return complex objects', async () => {
            const record = {
                id: 'complex-123',
                number: 42,
                boolean: true,
                null: null,
                array: ['a', 'b', 'c']
            };
            mockClient.query.mockResolvedValueOnce({
                rows: [{ data: record }]
            });

            const found = await connection.find('test_table', 'complex-123');
            expect(found).toEqual(record);
        });
    });

    describe('update', () => {
        it('should execute UPDATE query', async () => {
            const record = {
                id: 'update-123',
                data: 'updated'
            };

            await connection.update('update_table', 'update-123', record);

            expect(mockClient.query).toHaveBeenCalledWith(
                'UPDATE update_table SET data = $1 WHERE id = $2',
                [JSON.stringify(record), 'update-123']
            );
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();
            const record = { id: 'test', data: 'test' };

            await expect(connection.update('update_table', 'test', record))
                .rejects.toThrow('Not connected');
        });

        it('should not throw error when updating non-existent record', async () => {
            const record = { id: 'non-existent', data: 'test' };

            await expect(connection.update('update_table', 'non-existent', record))
                .resolves.not.toThrow();
        });

        it('should handle complex data', async () => {
            const record = {
                id: 'complex-update-123',
                complexField: {
                    nested: { array: [1, 2, 3] }
                }
            };

            await connection.update('complex_update_table', 'complex-update-123', record);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.any(String),
                [JSON.stringify(record), 'complex-update-123']
            );
        });
    });

    describe('delete', () => {
        it('should execute DELETE query', async () => {
            await connection.delete('delete_table', 'delete-123');

            expect(mockClient.query).toHaveBeenCalledWith(
                'DELETE FROM delete_table WHERE id = $1',
                ['delete-123']
            );
        });

        it('should throw error when not connected', async () => {
            await connection.disconnect();

            await expect(connection.delete('delete_table', 'test-id'))
                .rejects.toThrow('Not connected');
        });

        it('should not throw error when deleting non-existent record', async () => {
            await expect(connection.delete('delete_table', 'non-existent'))
                .resolves.not.toThrow();
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete CRUD lifecycle', async () => {
            const table = 'crud_table';
            const record = {
                id: 'crud-123',
                name: 'Test Record',
                value: 100
            };

            // Create
            await connection.createTable(table);
            await connection.save(table, record);

            // Simulate finding the saved record
            mockClient.query.mockResolvedValueOnce({
                rows: [{ data: record }]
            });
            let found = await connection.find(table, 'crud-123');
            expect(found).toEqual(record);

            // Update
            const updated = { ...record, value: 200 };
            await connection.update(table, 'crud-123', updated);

            // Simulate finding the updated record
            mockClient.query.mockResolvedValueOnce({
                rows: [{ data: updated }]
            });
            found = await connection.find(table, 'crud-123');
            expect(found?.value).toBe(200);

            // Delete
            await connection.delete(table, 'crud-123');

            // Simulate record not found after delete
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            found = await connection.find(table, 'crud-123');
            expect(found).toBeNull();
        });

        it('should handle multiple operations', async () => {
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

            expect(mockClient.query).toHaveBeenCalledTimes(4); // 1 createTable + 3 saves
        });
    });
});