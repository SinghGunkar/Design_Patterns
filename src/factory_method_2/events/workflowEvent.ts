import { Event } from "../abstract/event.js";

// Constants
const EVENT_TYPE = 'workflow' as const;

// Enums
enum WorkflowStatus {
    STARTED = 'started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

enum WorkflowPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

interface WorkflowPayload {
    workflowName: string;
    workflowType: string;
    customerId: string;
    stepName?: string;
    executionTime?: number;
    message?: string;
    metadata?: Record<string, any>;
}

class WorkflowEvent extends Event<WorkflowPayload> {
    workflowId: string;
    stepId: string;
    dbClusterId: string;
    status: WorkflowStatus;
    priority: WorkflowPriority;
    retryCount: number;

    constructor(
        workflowId: string,
        stepId: string,
        dbClusterId: string,
        status: WorkflowStatus,
        priority: WorkflowPriority,
        retryCount: number,
        payload: WorkflowPayload
    ) {
        super(EVENT_TYPE, payload);
        this.workflowId = workflowId;
        this.stepId = stepId;
        this.dbClusterId = dbClusterId;
        this.status = status;
        this.priority = priority;
        this.retryCount = retryCount;
    }

    protected override getAdditionalFields(): Record<string, any> {
        return {
            workflowId: this.workflowId,
            stepId: this.stepId,
            dbClusterId: this.dbClusterId,
            status: this.status,
            priority: this.priority,
            retryCount: this.retryCount
        };
    }

    static override fromRecord(record: Record<string, any>): WorkflowEvent {
        const event = new WorkflowEvent(
            record.workflowId,
            record.stepId,
            record.dbClusterId,
            record.status,
            record.priority,
            record.retryCount,
            record.payload
        );
        event.id = record.id;
        event.timestamp = new Date(record.timestamp);
        return event;
    }

    isCompleted(): boolean {
        return this.status === WorkflowStatus.COMPLETED;
    }

    isFailed(): boolean {
        return this.status === WorkflowStatus.FAILED;
    }

    needsRetry(): boolean {
        return this.status === WorkflowStatus.FAILED;
    }

    isHighPriority(): boolean {
        return this.priority === WorkflowPriority.HIGH;
    }
}

export { WorkflowEvent, WorkflowStatus, WorkflowPriority, EVENT_TYPE as WORKFLOW_EVENT_TYPE };
