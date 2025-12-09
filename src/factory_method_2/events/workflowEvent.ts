import { Event } from "./event.js";

const EVENT_TYPE = 'workflow' as const;

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

interface WorkflowPayload extends Record<string, unknown> {
    workflowName: string;
    workflowType: string;
    customerId: string;
    stepName?: string;
    executionTime?: number;
    message?: string;
    metadata?: Record<string, unknown>;
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

    protected override getAdditionalFields(): Record<string, unknown> {
        return {
            workflowId: this.workflowId,
            stepId: this.stepId,
            dbClusterId: this.dbClusterId,
            status: this.status,
            priority: this.priority,
            retryCount: this.retryCount
        };
    }

    static override fromRecord(record: Record<string, unknown>): WorkflowEvent {
        const event = new WorkflowEvent(
            record.workflowId as string,
            record.stepId as string,
            record.dbClusterId as string,
            record.status as WorkflowStatus,
            record.priority as WorkflowPriority,
            record.retryCount as number,
            record.payload as WorkflowPayload
        );
        event.id = record.id as string;
        event.timestamp = new Date(record.timestamp as string);
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
