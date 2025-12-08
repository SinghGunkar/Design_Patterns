import { Event } from "../abstract/event.js";

// Constants
const EVENT_TYPE = 'test' as const;

// Enums
enum TestType {
    UNIT = 'unit',
    INTEGRATION = 'integration',
    E2E = 'e2e',
    PERFORMANCE = 'performance',
    SECURITY = 'security'
}

enum TestStatus {
    PASSED = 'passed',
    FAILED = 'failed',
    SKIPPED = 'skipped',
    PENDING = 'pending',
    FLAKY = 'flaky'
}

enum TestSeverity {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

interface TestPayload {
    testName: string;
    testSuite: string;
    testFile: string;
    errorMessage?: string;
    stackTrace?: string;
    assertions?: number;
    coverage?: number;
    metadata?: Record<string, any>;
}

class TestEvent extends Event<TestPayload> {
    testId: string;
    testType: TestType;
    status: TestStatus;
    severity: TestSeverity;
    duration: number;
    retryCount: number;
    tags: string[];

    constructor(
        testId: string,
        testType: TestType,
        status: TestStatus,
        severity: TestSeverity,
        duration: number,
        retryCount: number,
        tags: string[],
        payload: TestPayload
    ) {
        super(EVENT_TYPE, payload);
        this.testId = testId;
        this.testType = testType;
        this.status = status;
        this.severity = severity;
        this.duration = duration;
        this.retryCount = retryCount;
        this.tags = tags;
    }

    protected override getAdditionalFields(): Record<string, any> {
        return {
            testId: this.testId,
            testType: this.testType,
            status: this.status,
            severity: this.severity,
            duration: this.duration,
            retryCount: this.retryCount,
            tags: this.tags
        };
    }

    static override fromRecord(record: Record<string, any>): TestEvent {
        const event = new TestEvent(
            record.testId,
            record.testType,
            record.status,
            record.severity,
            record.duration,
            record.retryCount,
            record.tags,
            record.payload
        );
        event.id = record.id;
        event.timestamp = new Date(record.timestamp);
        return event;
    }

    isPassed(): boolean {
        return this.status === TestStatus.PASSED;
    }

    isFailed(): boolean {
        return this.status === TestStatus.FAILED;
    }

    isSkipped(): boolean {
        return this.status === TestStatus.SKIPPED;
    }

    isFlaky(): boolean {
        return this.status === TestStatus.FLAKY || this.retryCount > 0;
    }

    isCritical(): boolean {
        return this.severity === TestSeverity.CRITICAL;
    }

    isSlow(): boolean {
        const SLOW_THRESHOLD_MS = 5000;
        return this.duration > SLOW_THRESHOLD_MS;
    }

    hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }
}

export { TestEvent, TestType, TestStatus, TestSeverity, EVENT_TYPE as TEST_EVENT_TYPE };
