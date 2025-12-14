import { describe, it, expect } from 'vitest';
import { TestEvent, TestType, TestStatus, TestSeverity, TEST_EVENT_TYPE } from './testEvent.js';

describe('TestEvent', () => {
    const createTestEvent = (overrides: Partial<{
        testId: string;
        testType: TestType;
        status: TestStatus;
        severity: TestSeverity;
        duration: number;
        retryCount: number;
        tags: string[];
        payload: any;
    }> = {}) => {
        return new TestEvent(
            overrides.testId ?? 'test-123',
            overrides.testType ?? TestType.UNIT,
            overrides.status ?? TestStatus.PASSED,
            overrides.severity ?? TestSeverity.MEDIUM,
            overrides.duration ?? 1000,
            overrides.retryCount ?? 0,
            overrides.tags ?? [],
            overrides.payload ?? {
                testName: 'should work',
                testSuite: 'MyTestSuite',
                testFile: 'test.spec.ts'
            }
        );
    };

    describe('constructor', () => {
        it('should create a test event with all required fields', () => {
            const payload = {
                testName: 'should work',
                testSuite: 'MyTestSuite',
                testFile: 'test.spec.ts'
            };
            const event = new TestEvent(
                'test-123',
                TestType.UNIT,
                TestStatus.PASSED,
                TestSeverity.HIGH,
                2500,
                0,
                ['smoke', 'critical'],
                payload
            );

            expect(event.testId).toBe('test-123');
            expect(event.testType).toBe(TestType.UNIT);
            expect(event.status).toBe(TestStatus.PASSED);
            expect(event.severity).toBe(TestSeverity.HIGH);
            expect(event.duration).toBe(2500);
            expect(event.retryCount).toBe(0);
            expect(event.tags).toEqual(['smoke', 'critical']);
            expect(event.payload).toEqual(payload);
            expect(event.type).toBe(TEST_EVENT_TYPE);
        });
    });

    describe('getAdditionalFields', () => {
        it('should include test-specific fields in serialization', () => {
            const event = createTestEvent({
                testId: 'test-456',
                tags: ['integration']
            });

            const record = event.toRecord();

            expect(record.testId).toBe('test-456');
            expect(record.testType).toBe(TestType.UNIT);
            expect(record.status).toBe(TestStatus.PASSED);
            expect(record.severity).toBe(TestSeverity.MEDIUM);
            expect(record.duration).toBe(1000);
            expect(record.retryCount).toBe(0);
            expect(record.tags).toEqual(['integration']);
        });
    });

    describe('fromRecord', () => {
        it('should deserialize a test event from record', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                type: TEST_EVENT_TYPE,
                timestamp: new Date().toISOString(),
                testId: 'test-789',
                testType: TestType.E2E,
                status: TestStatus.FAILED,
                severity: TestSeverity.CRITICAL,
                duration: 5000,
                retryCount: 2,
                tags: ['flaky', 'regression'],
                payload: {
                    testName: 'should fail',
                    testSuite: 'E2E Tests',
                    testFile: 'e2e.spec.ts',
                    errorMessage: 'Timeout',
                    stackTrace: 'Error: Timeout at line 42'
                }
            };

            const event = TestEvent.fromRecord(record);

            expect(event.id).toBe(record.id);
            expect(event.testId).toBe('test-789');
            expect(event.testType).toBe(TestType.E2E);
            expect(event.status).toBe(TestStatus.FAILED);
            expect(event.severity).toBe(TestSeverity.CRITICAL);
            expect(event.duration).toBe(5000);
            expect(event.retryCount).toBe(2);
            expect(event.tags).toEqual(['flaky', 'regression']);
            expect(event.payload.errorMessage).toBe('Timeout');
        });

        it('should maintain data integrity through round-trip', () => {
            const original = createTestEvent({
                testId: 'round-trip-test',
                tags: ['unit', 'fast']
            });

            const record = original.toRecord();
            const deserialized = TestEvent.fromRecord(record);

            expect(deserialized.testId).toBe(original.testId);
            expect(deserialized.testType).toBe(original.testType);
            expect(deserialized.status).toBe(original.status);
            expect(deserialized.duration).toBe(original.duration);
            expect(deserialized.tags).toEqual(original.tags);
        });
    });

    describe('isPassed', () => {
        it('should return true for passed tests', () => {
            const event = createTestEvent({ status: TestStatus.PASSED });
            expect(event.isPassed()).toBe(true);
        });

        it('should return false for non-passed tests', () => {
            expect(createTestEvent({ status: TestStatus.FAILED }).isPassed()).toBe(false);
            expect(createTestEvent({ status: TestStatus.SKIPPED }).isPassed()).toBe(false);
            expect(createTestEvent({ status: TestStatus.PENDING }).isPassed()).toBe(false);
            expect(createTestEvent({ status: TestStatus.FLAKY }).isPassed()).toBe(false);
        });
    });

    describe('isFailed', () => {
        it('should return true for failed tests', () => {
            const event = createTestEvent({ status: TestStatus.FAILED });
            expect(event.isFailed()).toBe(true);
        });

        it('should return false for non-failed tests', () => {
            expect(createTestEvent({ status: TestStatus.PASSED }).isFailed()).toBe(false);
            expect(createTestEvent({ status: TestStatus.SKIPPED }).isFailed()).toBe(false);
        });
    });

    describe('isSkipped', () => {
        it('should return true for skipped tests', () => {
            const event = createTestEvent({ status: TestStatus.SKIPPED });
            expect(event.isSkipped()).toBe(true);
        });

        it('should return false for non-skipped tests', () => {
            expect(createTestEvent({ status: TestStatus.PASSED }).isSkipped()).toBe(false);
            expect(createTestEvent({ status: TestStatus.FAILED }).isSkipped()).toBe(false);
        });
    });

    describe('isFlaky', () => {
        it('should return true when status is FLAKY', () => {
            const event = createTestEvent({
                status: TestStatus.FLAKY,
                retryCount: 0
            });
            expect(event.isFlaky()).toBe(true);
        });

        it('should return true when retryCount is greater than 0', () => {
            const event = createTestEvent({
                status: TestStatus.PASSED,
                retryCount: 1
            });
            expect(event.isFlaky()).toBe(true);
        });

        it('should return true when both status is FLAKY and retryCount > 0', () => {
            const event = createTestEvent({
                status: TestStatus.FLAKY,
                retryCount: 3
            });
            expect(event.isFlaky()).toBe(true);
        });

        it('should return false when status is not FLAKY and retryCount is 0', () => {
            const event = createTestEvent({
                status: TestStatus.PASSED,
                retryCount: 0
            });
            expect(event.isFlaky()).toBe(false);
        });
    });

    describe('isCritical', () => {
        it('should return true for critical severity', () => {
            const event = createTestEvent({ severity: TestSeverity.CRITICAL });
            expect(event.isCritical()).toBe(true);
        });

        it('should return false for non-critical severity', () => {
            expect(createTestEvent({ severity: TestSeverity.HIGH }).isCritical()).toBe(false);
            expect(createTestEvent({ severity: TestSeverity.MEDIUM }).isCritical()).toBe(false);
            expect(createTestEvent({ severity: TestSeverity.LOW }).isCritical()).toBe(false);
        });
    });

    describe('isSlow', () => {
        it('should return true when duration exceeds 5000ms', () => {
            expect(createTestEvent({ duration: 5001 }).isSlow()).toBe(true);
            expect(createTestEvent({ duration: 10000 }).isSlow()).toBe(true);
        });

        it('should return false when duration is exactly 5000ms', () => {
            expect(createTestEvent({ duration: 5000 }).isSlow()).toBe(false);
        });

        it('should return false when duration is below 5000ms', () => {
            expect(createTestEvent({ duration: 4999 }).isSlow()).toBe(false);
            expect(createTestEvent({ duration: 1000 }).isSlow()).toBe(false);
            expect(createTestEvent({ duration: 0 }).isSlow()).toBe(false);
        });
    });

    describe('hasTag', () => {
        it('should return true when tag exists', () => {
            const event = createTestEvent({ tags: ['smoke', 'critical', 'regression'] });

            expect(event.hasTag('smoke')).toBe(true);
            expect(event.hasTag('critical')).toBe(true);
            expect(event.hasTag('regression')).toBe(true);
        });

        it('should return false when tag does not exist', () => {
            const event = createTestEvent({ tags: ['smoke'] });

            expect(event.hasTag('critical')).toBe(false);
            expect(event.hasTag('unit')).toBe(false);
        });

        it('should return false when tags array is empty', () => {
            const event = createTestEvent({ tags: [] });

            expect(event.hasTag('smoke')).toBe(false);
        });
    });

    describe('integration with different test types', () => {
        it('should handle unit test events', () => {
            const event = createTestEvent({
                testType: TestType.UNIT,
                duration: 50,
                payload: {
                    testName: 'should calculate sum',
                    testSuite: 'Math Utils',
                    testFile: 'math.test.ts',
                    assertions: 3
                }
            });

            expect(event.testType).toBe(TestType.UNIT);
            expect(event.isSlow()).toBe(false);
        });

        it('should handle e2e test events', () => {
            const event = createTestEvent({
                testType: TestType.E2E,
                duration: 8000,
                status: TestStatus.FAILED,
                severity: TestSeverity.CRITICAL,
                payload: {
                    testName: 'should complete checkout flow',
                    testSuite: 'E2E Suite',
                    testFile: 'checkout.e2e.ts',
                    errorMessage: 'Element not found'
                }
            });

            expect(event.testType).toBe(TestType.E2E);
            expect(event.isSlow()).toBe(true);
            expect(event.isFailed()).toBe(true);
            expect(event.isCritical()).toBe(true);
        });

        it('should handle performance test events', () => {
            const event = createTestEvent({
                testType: TestType.PERFORMANCE,
                duration: 15000,
                payload: {
                    testName: 'should load page under 2s',
                    testSuite: 'Performance',
                    testFile: 'perf.test.ts',
                    metadata: { avgLoadTime: 1850, p95: 2100 }
                }
            });

            expect(event.testType).toBe(TestType.PERFORMANCE);
            expect(event.isSlow()).toBe(true);
        });
    });
});