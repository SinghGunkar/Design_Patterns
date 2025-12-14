import { describe, it, expect } from 'vitest';
import { Event } from './event.js';
import { validate as isValidUUID } from 'uuid';


class TestEvent<T = Record<string, unknown>> extends Event<T> {
    static override fromRecord(record: Record<string, unknown>): TestEvent {
        const event = new TestEvent(
            record.type as string,
            record.payload as Record<string, unknown>
        );
        event.id = record.id as string;
        event.timestamp = new Date(record.timestamp as string);
        return event;
    }
}


class ExtendedTestEvent extends Event<{ value: number }> {
    public metadata: string;

    constructor(type: string, payload: { value: number }, metadata: string) {
        super(type, payload);
        this.metadata = metadata;
    }

    protected override getAdditionalFields(): Record<string, unknown> {
        return {
            metadata: this.metadata
        };
    }

    static override fromRecord(record: Record<string, unknown>): ExtendedTestEvent {
        const event = new ExtendedTestEvent(
            record.type as string,
            record.payload as { value: number },
            record.metadata as string
        );
        event.id = record.id as string;
        event.timestamp = new Date(record.timestamp as string);
        return event;
    }
}

describe('Event', () => {
    describe('constructor', () => {
        it('should create an event with generated id', () => {
            const payload = { foo: 'bar' };
            const event = new TestEvent('test.event', payload);

            expect(event.id).toBeDefined();
            expect(isValidUUID(event.id)).toBe(true);

        });

        it('should create an event with provided type', () => {
            const payload = { foo: 'bar' };
            const event = new TestEvent('test.event', payload);

            expect(event.type).toBe('test.event');
        });

        it('should create an event with current timestamp', () => {
            const before = new Date();
            const event = new TestEvent('test.event', { foo: 'bar' });
            const after = new Date();

            expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(event.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
        });

        it('should create an event with provided payload', () => {
            const payload = { foo: 'bar', num: 42 };
            const event = new TestEvent('test.event', payload);

            expect(event.payload).toEqual(payload);
        });

        it('should generate unique ids for different events', () => {
            const event1 = new TestEvent('test.event', { foo: 'bar' });
            const event2 = new TestEvent('test.event', { foo: 'bar' });

            expect(event1.id).not.toBe(event2.id);
        });
    });

    describe('toJSON', () => {
        it('should serialize event to JSON string', () => {
            const payload = { foo: 'bar' };
            const event = new TestEvent('test.event', payload);

            const json = event.toJSON();
            const parsed = JSON.parse(json);

            expect(parsed.id).toBe(event.id);
            expect(parsed.type).toBe('test.event');
            expect(parsed.timestamp).toBe(event.timestamp.toISOString());
            expect(parsed.payload).toEqual(payload);
        });

        it('should include additional fields in JSON', () => {
            const event = new ExtendedTestEvent(
                'extended.event',
                { value: 123 },
                'extra-metadata'
            );

            const json = event.toJSON();
            const parsed = JSON.parse(json);

            expect(parsed.metadata).toBe('extra-metadata');
        });

        it('should handle complex payload types', () => {
            const payload = {
                nested: { deep: { value: 42 } },
                array: [1, 2, 3],
                bool: true,
                null: null
            };
            const event = new TestEvent('test.event', payload);

            const json = event.toJSON();
            const parsed = JSON.parse(json);

            expect(parsed.payload).toEqual(payload);
        });
    });

    describe('fromJSON', () => {
        it('should deserialize event from JSON string', () => {
            const original = new TestEvent('test.event', { foo: 'bar' });
            const json = original.toJSON();

            const deserialized = TestEvent.fromJSON(json);

            expect(deserialized.id).toBe(original.id);
            expect(deserialized.type).toBe(original.type);
            expect(deserialized.timestamp.toISOString()).toBe(original.timestamp.toISOString());
            expect(deserialized.payload).toEqual(original.payload);
        });

        it('should handle extended events with additional fields', () => {
            const original = new ExtendedTestEvent(
                'extended.event',
                { value: 456 },
                'metadata-value'
            );
            const json = original.toJSON();

            const deserialized = ExtendedTestEvent.fromJSON(json) as ExtendedTestEvent;

            expect(deserialized.metadata).toBe('metadata-value');
            expect(deserialized.payload.value).toBe(456);
        });

        it('should throw error for invalid JSON', () => {
            expect(() => TestEvent.fromJSON('invalid json')).toThrow();
        });
    });

    describe('toRecord', () => {
        it('should convert event to record object', () => {
            const payload = { foo: 'bar' };
            const event = new TestEvent('test.event', payload);

            const record = event.toRecord();

            expect(record.id).toBe(event.id);
            expect(record.type).toBe('test.event');
            expect(record.timestamp).toBe(event.timestamp);
            expect(record.payload).toEqual(payload);
        });

        it('should include additional fields in record', () => {
            const event = new ExtendedTestEvent(
                'extended.event',
                { value: 789 },
                'record-metadata'
            );

            const record = event.toRecord();

            expect(record.metadata).toBe('record-metadata');
        });

        it('should return a plain object, not an Event instance', () => {
            const event = new TestEvent('test.event', { foo: 'bar' });
            const record = event.toRecord();

            expect(record).not.toBeInstanceOf(Event);
            expect(typeof record).toBe('object');
        });
    });

    describe('fromRecord', () => {
        it('should create event from record object', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                type: 'test.event',
                timestamp: new Date().toISOString(),
                payload: { foo: 'bar' }
            };

            const event = TestEvent.fromRecord(record);

            expect(event.id).toBe(record.id);
            expect(event.type).toBe(record.type);
            expect(event.timestamp.toISOString()).toBe(record.timestamp);
            expect(event.payload).toEqual(record.payload);
        });

        it('should throw error when called on base Event class', () => {
            const record = {
                id: '123',
                type: 'test',
                timestamp: new Date().toISOString(),
                payload: {}
            };

            expect(() => Event.fromRecord(record)).toThrow(
                'fromRecord must be implemented by subclasses'
            );
        });
    });

    describe('round-trip serialization', () => {
        it('should maintain data integrity through JSON round-trip', () => {
            const original = new TestEvent('test.event', {
                foo: 'bar',
                num: 42,
                nested: { value: true }
            });

            const json = original.toJSON();
            const deserialized = TestEvent.fromJSON(json);

            expect(deserialized.id).toBe(original.id);
            expect(deserialized.type).toBe(original.type);
            expect(deserialized.timestamp.toISOString()).toBe(original.timestamp.toISOString());
            expect(deserialized.payload).toEqual(original.payload);
        });

        it('should maintain data integrity through record round-trip', () => {
            const original = new TestEvent('test.event', { foo: 'bar' });

            const record = original.toRecord();
            const deserialized = TestEvent.fromRecord(record);

            expect(deserialized.id).toBe(original.id);
            expect(deserialized.type).toBe(original.type);
            expect(deserialized.timestamp).toEqual(original.timestamp);
            expect(deserialized.payload).toEqual(original.payload);
        });
    });
});
