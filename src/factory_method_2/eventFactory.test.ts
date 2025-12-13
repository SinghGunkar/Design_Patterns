import { describe, it, expect } from 'vitest';
import { EventFactory, EVENT_TYPES } from './eventFactory.js';
import { WorkflowEvent, WorkflowStatus, WorkflowPriority } from './events/workflowEvent.js';
import { WebserviceEvent, HttpMethod, WebserviceStatus, ResponseType } from './events/webserviceEvent.js';
import { TestEvent, TestType, TestStatus, TestSeverity } from './events/testEvent.js';

describe('EventFactory', () => {
    describe('createEvent', () => {
        it('should create WorkflowEvent from record', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                type: EVENT_TYPES.WORKFLOW,
                timestamp: new Date().toISOString(),
                workflowId: 'wf-123',
                stepId: 'step-001',
                dbClusterId: 'cluster-abc',
                status: WorkflowStatus.IN_PROGRESS,
                priority: WorkflowPriority.HIGH,
                retryCount: 0,
                payload: {
                    workflowName: 'Test Workflow',
                    workflowType: 'test',
                    customerId: 'cust-123'
                }
            };

            const event = EventFactory.createEvent(record);

            expect(event).toBeInstanceOf(WorkflowEvent);
            expect(event.type).toBe(EVENT_TYPES.WORKFLOW);
            expect((event as WorkflowEvent).workflowId).toBe('wf-123');
        });

        it('should create WebserviceEvent from record', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174001',
                type: EVENT_TYPES.WEBSERVICE,
                timestamp: new Date().toISOString(),
                requestId: 'req-456',
                method: HttpMethod.GET,
                statusCode: 200,
                responseTime: 150,
                status: WebserviceStatus.SUCCESS,
                responseType: ResponseType.JSON,
                retryAttempt: 0,
                payload: {
                    endpoint: '/api/users',
                    headers: { 'Content-Type': 'application/json' }
                }
            };

            const event = EventFactory.createEvent(record);

            expect(event).toBeInstanceOf(WebserviceEvent);
            expect(event.type).toBe(EVENT_TYPES.WEBSERVICE);
            expect((event as WebserviceEvent).requestId).toBe('req-456');
        });

        it('should create TestEvent from record', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174002',
                type: EVENT_TYPES.TEST,
                timestamp: new Date().toISOString(),
                testId: 'test-789',
                testType: TestType.UNIT,
                status: TestStatus.PASSED,
                severity: TestSeverity.MEDIUM,
                duration: 1000,
                retryCount: 0,
                tags: ['smoke'],
                payload: {
                    testName: 'should work',
                    testSuite: 'TestSuite',
                    testFile: 'test.spec.ts'
                }
            };

            const event = EventFactory.createEvent(record);

            expect(event).toBeInstanceOf(TestEvent);
            expect(event.type).toBe(EVENT_TYPES.TEST);
            expect((event as TestEvent).testId).toBe('test-789');
        });

        it('should throw error for unknown event type', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174003',
                type: 'unknown_type',
                timestamp: new Date().toISOString(),
                payload: {}
            };

            expect(() => EventFactory.createEvent(record)).toThrow('Unknown event type: unknown_type');
        });

        it('should throw error for missing type field', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174004',
                timestamp: new Date().toISOString(),
                payload: {}
            };

            expect(() => EventFactory.createEvent(record)).toThrow('Unknown event type: undefined');
        });
    });

    describe('createEventFromJSON', () => {
        it('should create WorkflowEvent from JSON string', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174005',
                type: EVENT_TYPES.WORKFLOW,
                timestamp: new Date().toISOString(),
                workflowId: 'wf-json-123',
                stepId: 'step-json-001',
                dbClusterId: 'cluster-json',
                status: WorkflowStatus.COMPLETED,
                priority: WorkflowPriority.LOW,
                retryCount: 1,
                payload: {
                    workflowName: 'JSON Workflow',
                    workflowType: 'json',
                    customerId: 'cust-json'
                }
            };

            const json = JSON.stringify(record);
            const event = EventFactory.createEventFromJSON(json);

            expect(event).toBeInstanceOf(WorkflowEvent);
            expect(event.id).toBe(record.id);
            expect((event as WorkflowEvent).workflowId).toBe('wf-json-123');
        });

        it('should create WebserviceEvent from JSON string', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174006',
                type: EVENT_TYPES.WEBSERVICE,
                timestamp: new Date().toISOString(),
                requestId: 'req-json-789',
                method: HttpMethod.POST,
                statusCode: 201,
                responseTime: 250,
                status: WebserviceStatus.SUCCESS,
                responseType: ResponseType.JSON,
                retryAttempt: 0,
                payload: {
                    endpoint: '/api/orders',
                    requestBody: { orderId: 123 }
                }
            };

            const json = JSON.stringify(record);
            const event = EventFactory.createEventFromJSON(json);

            expect(event).toBeInstanceOf(WebserviceEvent);
            expect((event as WebserviceEvent).method).toBe(HttpMethod.POST);
        });

        it('should create TestEvent from JSON string', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174007',
                type: EVENT_TYPES.TEST,
                timestamp: new Date().toISOString(),
                testId: 'test-json-456',
                testType: TestType.E2E,
                status: TestStatus.FAILED,
                severity: TestSeverity.CRITICAL,
                duration: 5000,
                retryCount: 2,
                tags: ['e2e', 'critical'],
                payload: {
                    testName: 'should fail',
                    testSuite: 'E2E Suite',
                    testFile: 'e2e.spec.ts',
                    errorMessage: 'Timeout'
                }
            };

            const json = JSON.stringify(record);
            const event = EventFactory.createEventFromJSON(json);

            expect(event).toBeInstanceOf(TestEvent);
            expect((event as TestEvent).testType).toBe(TestType.E2E);
        });

        it('should throw error for invalid JSON', () => {
            const invalidJson = '{ invalid json }';

            expect(() => EventFactory.createEventFromJSON(invalidJson)).toThrow();
        });

        it('should throw error for JSON with unknown event type', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174008',
                type: 'invalid_type',
                timestamp: new Date().toISOString(),
                payload: {}
            };

            const json = JSON.stringify(record);

            expect(() => EventFactory.createEventFromJSON(json)).toThrow('Unknown event type: invalid_type');
        });
    });

    describe('createEvents', () => {
        it('should create multiple events from array of records', () => {
            const records = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174009',
                    type: EVENT_TYPES.WORKFLOW,
                    timestamp: new Date().toISOString(),
                    workflowId: 'wf-multi-1',
                    stepId: 'step-1',
                    dbClusterId: 'cluster-1',
                    status: WorkflowStatus.STARTED,
                    priority: WorkflowPriority.HIGH,
                    retryCount: 0,
                    payload: {
                        workflowName: 'Workflow 1',
                        workflowType: 'type1',
                        customerId: 'cust-1'
                    }
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174010',
                    type: EVENT_TYPES.WEBSERVICE,
                    timestamp: new Date().toISOString(),
                    requestId: 'req-multi-1',
                    method: HttpMethod.GET,
                    statusCode: 200,
                    responseTime: 100,
                    status: WebserviceStatus.SUCCESS,
                    responseType: ResponseType.JSON,
                    retryAttempt: 0,
                    payload: {
                        endpoint: '/api/test'
                    }
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174011',
                    type: EVENT_TYPES.TEST,
                    timestamp: new Date().toISOString(),
                    testId: 'test-multi-1',
                    testType: TestType.UNIT,
                    status: TestStatus.PASSED,
                    severity: TestSeverity.LOW,
                    duration: 50,
                    retryCount: 0,
                    tags: [],
                    payload: {
                        testName: 'test 1',
                        testSuite: 'suite 1',
                        testFile: 'test1.spec.ts'
                    }
                }
            ];

            const events = EventFactory.createEvents(records);

            expect(events).toHaveLength(3);
            expect(events[0]).toBeInstanceOf(WorkflowEvent);
            expect(events[1]).toBeInstanceOf(WebserviceEvent);
            expect(events[2]).toBeInstanceOf(TestEvent);
        });

        it('should return empty array for empty input', () => {
            const events = EventFactory.createEvents([]);

            expect(events).toEqual([]);
            expect(events).toHaveLength(0);
        });

        it('should create multiple events of same type', () => {
            const records = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174012',
                    type: EVENT_TYPES.TEST,
                    timestamp: new Date().toISOString(),
                    testId: 'test-1',
                    testType: TestType.UNIT,
                    status: TestStatus.PASSED,
                    severity: TestSeverity.LOW,
                    duration: 50,
                    retryCount: 0,
                    tags: [],
                    payload: {
                        testName: 'test 1',
                        testSuite: 'suite',
                        testFile: 'test.spec.ts'
                    }
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174013',
                    type: EVENT_TYPES.TEST,
                    timestamp: new Date().toISOString(),
                    testId: 'test-2',
                    testType: TestType.INTEGRATION,
                    status: TestStatus.FAILED,
                    severity: TestSeverity.HIGH,
                    duration: 1000,
                    retryCount: 1,
                    tags: ['integration'],
                    payload: {
                        testName: 'test 2',
                        testSuite: 'suite',
                        testFile: 'test.spec.ts'
                    }
                }
            ];

            const events = EventFactory.createEvents(records);

            expect(events).toHaveLength(2);
            expect(events[0]).toBeInstanceOf(TestEvent);
            expect(events[1]).toBeInstanceOf(TestEvent);
            expect((events[0] as TestEvent).testId).toBe('test-1');
            expect((events[1] as TestEvent).testId).toBe('test-2');
        });

        it('should throw error if any record has unknown type', () => {
            const records = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174014',
                    type: EVENT_TYPES.WORKFLOW,
                    timestamp: new Date().toISOString(),
                    workflowId: 'wf-1',
                    stepId: 'step-1',
                    dbClusterId: 'cluster-1',
                    status: WorkflowStatus.STARTED,
                    priority: WorkflowPriority.HIGH,
                    retryCount: 0,
                    payload: {
                        workflowName: 'Workflow',
                        workflowType: 'type',
                        customerId: 'cust-1'
                    }
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174015',
                    type: 'invalid_type',
                    timestamp: new Date().toISOString(),
                    payload: {}
                }
            ];

            expect(() => EventFactory.createEvents(records)).toThrow('Unknown event type: invalid_type');
        });
    });

    describe('isEventTypeSupported', () => {
        it('should return true for WORKFLOW event type', () => {
            expect(EventFactory.isEventTypeSupported(EVENT_TYPES.WORKFLOW)).toBe(true);
        });

        it('should return true for WEBSERVICE event type', () => {
            expect(EventFactory.isEventTypeSupported(EVENT_TYPES.WEBSERVICE)).toBe(true);
        });

        it('should return true for TEST event type', () => {
            expect(EventFactory.isEventTypeSupported(EVENT_TYPES.TEST)).toBe(true);
        });

        it('should return false for unknown event type', () => {
            expect(EventFactory.isEventTypeSupported('unknown_type')).toBe(false);
            expect(EventFactory.isEventTypeSupported('custom_event')).toBe(false);
            expect(EventFactory.isEventTypeSupported('')).toBe(false);
        });

        it('should handle case sensitivity correctly', () => {
            expect(EventFactory.isEventTypeSupported('WORKFLOW')).toBe(false);
            expect(EventFactory.isEventTypeSupported('Workflow')).toBe(false);
        });
    });

    describe('getSupportedEventTypes', () => {
        it('should return all supported event types', () => {
            const supportedTypes = EventFactory.getSupportedEventTypes();

            expect(supportedTypes).toHaveLength(3);
            expect(supportedTypes).toContain(EVENT_TYPES.WORKFLOW);
            expect(supportedTypes).toContain(EVENT_TYPES.WEBSERVICE);
            expect(supportedTypes).toContain(EVENT_TYPES.TEST);
        });

        it('should return array with correct values', () => {
            const supportedTypes = EventFactory.getSupportedEventTypes();

            expect(supportedTypes).toEqual([
                'workflow',
                'webservice',
                'test'
            ]);
        });
    });

    describe('integration scenarios', () => {
        it('should handle round-trip serialization for all event types', () => {
            const workflowRecord = {
                id: '123e4567-e89b-12d3-a456-426614174016',
                type: EVENT_TYPES.WORKFLOW,
                timestamp: new Date().toISOString(),
                workflowId: 'wf-round',
                stepId: 'step-round',
                dbClusterId: 'cluster-round',
                status: WorkflowStatus.COMPLETED,
                priority: WorkflowPriority.MEDIUM,
                retryCount: 0,
                payload: {
                    workflowName: 'Round Trip',
                    workflowType: 'test',
                    customerId: 'cust-round'
                }
            };

            const workflowEvent = EventFactory.createEvent(workflowRecord);
            const workflowJson = workflowEvent.toJSON();
            const deserializedWorkflow = EventFactory.createEventFromJSON(workflowJson);

            expect(deserializedWorkflow).toBeInstanceOf(WorkflowEvent);
            expect(deserializedWorkflow.id).toBe(workflowEvent.id);
            expect((deserializedWorkflow as WorkflowEvent).workflowId).toBe('wf-round');
        });

        it('should validate event type before creating event', () => {
            const unknownType = 'custom_event';

            expect(EventFactory.isEventTypeSupported(unknownType)).toBe(false);

            const record = {
                id: '123e4567-e89b-12d3-a456-426614174017',
                type: unknownType,
                timestamp: new Date().toISOString(),
                payload: {}
            };

            expect(() => EventFactory.createEvent(record)).toThrow(`Unknown event type: ${unknownType}`);
        });

        it('should handle batch processing of mixed event types', () => {
            const records = [
                {
                    id: '1',
                    type: EVENT_TYPES.WORKFLOW,
                    timestamp: new Date().toISOString(),
                    workflowId: 'wf-1',
                    stepId: 'step-1',
                    dbClusterId: 'cluster-1',
                    status: WorkflowStatus.STARTED,
                    priority: WorkflowPriority.HIGH,
                    retryCount: 0,
                    payload: { workflowName: 'wf1', workflowType: 't1', customerId: 'c1' }
                },
                {
                    id: '2',
                    type: EVENT_TYPES.WEBSERVICE,
                    timestamp: new Date().toISOString(),
                    requestId: 'req-1',
                    method: HttpMethod.GET,
                    statusCode: 200,
                    responseTime: 100,
                    status: WebserviceStatus.SUCCESS,
                    responseType: ResponseType.JSON,
                    retryAttempt: 0,
                    payload: { endpoint: '/api/test' }
                },
                {
                    id: '3',
                    type: EVENT_TYPES.TEST,
                    timestamp: new Date().toISOString(),
                    testId: 'test-1',
                    testType: TestType.UNIT,
                    status: TestStatus.PASSED,
                    severity: TestSeverity.LOW,
                    duration: 50,
                    retryCount: 0,
                    tags: [],
                    payload: { testName: 't1', testSuite: 's1', testFile: 'f1' }
                }
            ];

            const events = EventFactory.createEvents(records);
            const supportedTypes = EventFactory.getSupportedEventTypes();

            expect(events).toHaveLength(3);
            events.forEach(event => {
                expect(supportedTypes).toContain(event.type);
            });
        });
    });
});