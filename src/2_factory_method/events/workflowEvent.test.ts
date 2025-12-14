import { describe, it, expect } from 'vitest';
import { WorkflowEvent, WorkflowStatus, WorkflowPriority, WORKFLOW_EVENT_TYPE } from './workflowEvent.js';

describe('WorkflowEvent', () => {
    const createWorkflowEvent = (overrides: Partial<{
        workflowId: string;
        stepId: string;
        dbClusterId: string;
        status: WorkflowStatus;
        priority: WorkflowPriority;
        retryCount: number;
        payload: any;
    }> = {}) => {
        return new WorkflowEvent(
            overrides.workflowId ?? 'wf-123',
            overrides.stepId ?? 'step-001',
            overrides.dbClusterId ?? 'cluster-abc',
            overrides.status ?? WorkflowStatus.IN_PROGRESS,
            overrides.priority ?? WorkflowPriority.MEDIUM,
            overrides.retryCount ?? 0,
            overrides.payload ?? {
                workflowName: 'Order Processing',
                workflowType: 'order',
                customerId: 'cust-456'
            }
        );
    };

    describe('constructor', () => {
        it('should create a workflow event with all required fields', () => {
            const payload = {
                workflowName: 'Payment Workflow',
                workflowType: 'payment',
                customerId: 'cust-789',
                stepName: 'Validate Card',
                executionTime: 1500,
                message: 'Validating payment method'
            };

            const event = new WorkflowEvent(
                'wf-456',
                'step-002',
                'cluster-xyz',
                WorkflowStatus.STARTED,
                WorkflowPriority.HIGH,
                0,
                payload
            );

            expect(event.workflowId).toBe('wf-456');
            expect(event.stepId).toBe('step-002');
            expect(event.dbClusterId).toBe('cluster-xyz');
            expect(event.status).toBe(WorkflowStatus.STARTED);
            expect(event.priority).toBe(WorkflowPriority.HIGH);
            expect(event.retryCount).toBe(0);
            expect(event.payload).toEqual(payload);
            expect(event.type).toBe(WORKFLOW_EVENT_TYPE);
        });
    });

    describe('getAdditionalFields', () => {
        it('should include workflow-specific fields in serialization', () => {
            const event = createWorkflowEvent({
                workflowId: 'wf-789',
                stepId: 'step-003',
                dbClusterId: 'cluster-def',
                priority: WorkflowPriority.LOW
            });

            const record = event.toRecord();

            expect(record.workflowId).toBe('wf-789');
            expect(record.stepId).toBe('step-003');
            expect(record.dbClusterId).toBe('cluster-def');
            expect(record.status).toBe(WorkflowStatus.IN_PROGRESS);
            expect(record.priority).toBe(WorkflowPriority.LOW);
            expect(record.retryCount).toBe(0);
        });
    });

    describe('fromRecord', () => {
        it('should deserialize a workflow event from record', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                type: WORKFLOW_EVENT_TYPE,
                timestamp: new Date().toISOString(),
                workflowId: 'wf-999',
                stepId: 'step-final',
                dbClusterId: 'cluster-prod',
                status: WorkflowStatus.COMPLETED,
                priority: WorkflowPriority.HIGH,
                retryCount: 2,
                payload: {
                    workflowName: 'Shipping Workflow',
                    workflowType: 'shipping',
                    customerId: 'cust-111',
                    stepName: 'Ship Package',
                    executionTime: 3000,
                    message: 'Package shipped successfully'
                }
            };

            const event = WorkflowEvent.fromRecord(record);

            expect(event.id).toBe(record.id);
            expect(event.workflowId).toBe('wf-999');
            expect(event.stepId).toBe('step-final');
            expect(event.dbClusterId).toBe('cluster-prod');
            expect(event.status).toBe(WorkflowStatus.COMPLETED);
            expect(event.priority).toBe(WorkflowPriority.HIGH);
            expect(event.retryCount).toBe(2);
            expect(event.payload.workflowName).toBe('Shipping Workflow');
            expect(event.payload.executionTime).toBe(3000);
        });

        it('should maintain data integrity through round-trip', () => {
            const original = createWorkflowEvent({
                workflowId: 'round-trip-wf',
                stepId: 'round-trip-step',
                status: WorkflowStatus.FAILED,
                retryCount: 3
            });

            const record = original.toRecord();
            const deserialized = WorkflowEvent.fromRecord(record);

            expect(deserialized.workflowId).toBe(original.workflowId);
            expect(deserialized.stepId).toBe(original.stepId);
            expect(deserialized.dbClusterId).toBe(original.dbClusterId);
            expect(deserialized.status).toBe(original.status);
            expect(deserialized.priority).toBe(original.priority);
            expect(deserialized.retryCount).toBe(original.retryCount);
        });
    });

    describe('isCompleted', () => {
        it('should return true when status is COMPLETED', () => {
            const event = createWorkflowEvent({
                status: WorkflowStatus.COMPLETED
            });
            expect(event.isCompleted()).toBe(true);
        });

        it('should return false when status is not COMPLETED', () => {
            expect(createWorkflowEvent({
                status: WorkflowStatus.STARTED
            }).isCompleted()).toBe(false);

            expect(createWorkflowEvent({
                status: WorkflowStatus.IN_PROGRESS
            }).isCompleted()).toBe(false);

            expect(createWorkflowEvent({
                status: WorkflowStatus.FAILED
            }).isCompleted()).toBe(false);
        });
    });

    describe('isFailed', () => {
        it('should return true when status is FAILED', () => {
            const event = createWorkflowEvent({
                status: WorkflowStatus.FAILED
            });
            expect(event.isFailed()).toBe(true);
        });

        it('should return false when status is not FAILED', () => {
            expect(createWorkflowEvent({
                status: WorkflowStatus.STARTED
            }).isFailed()).toBe(false);

            expect(createWorkflowEvent({
                status: WorkflowStatus.IN_PROGRESS
            }).isFailed()).toBe(false);

            expect(createWorkflowEvent({
                status: WorkflowStatus.COMPLETED
            }).isFailed()).toBe(false);
        });
    });

    describe('needsRetry', () => {
        it('should return true when status is FAILED', () => {
            const event = createWorkflowEvent({
                status: WorkflowStatus.FAILED
            });
            expect(event.needsRetry()).toBe(true);
        });

        it('should return false when status is not FAILED', () => {
            expect(createWorkflowEvent({
                status: WorkflowStatus.STARTED
            }).needsRetry()).toBe(false);

            expect(createWorkflowEvent({
                status: WorkflowStatus.IN_PROGRESS
            }).needsRetry()).toBe(false);

            expect(createWorkflowEvent({
                status: WorkflowStatus.COMPLETED
            }).needsRetry()).toBe(false);
        });
    });

    describe('isHighPriority', () => {
        it('should return true when priority is HIGH', () => {
            const event = createWorkflowEvent({
                priority: WorkflowPriority.HIGH
            });
            expect(event.isHighPriority()).toBe(true);
        });

        it('should return false when priority is not HIGH', () => {
            expect(createWorkflowEvent({
                priority: WorkflowPriority.MEDIUM
            }).isHighPriority()).toBe(false);

            expect(createWorkflowEvent({
                priority: WorkflowPriority.LOW
            }).isHighPriority()).toBe(false);
        });
    });

    describe('integration scenarios', () => {
        it('should handle workflow start event', () => {
            const event = createWorkflowEvent({
                workflowId: 'wf-start-001',
                stepId: 'step-init',
                status: WorkflowStatus.STARTED,
                priority: WorkflowPriority.MEDIUM,
                retryCount: 0,
                payload: {
                    workflowName: 'Order Fulfillment',
                    workflowType: 'fulfillment',
                    customerId: 'cust-001',
                    stepName: 'Initialize Order',
                    message: 'Starting order fulfillment workflow'
                }
            });

            expect(event.isCompleted()).toBe(false);
            expect(event.isFailed()).toBe(false);
            expect(event.needsRetry()).toBe(false);
            expect(event.isHighPriority()).toBe(false);
            expect(event.status).toBe(WorkflowStatus.STARTED);
        });

        it('should handle workflow in progress event', () => {
            const event = createWorkflowEvent({
                workflowId: 'wf-progress-001',
                stepId: 'step-processing',
                status: WorkflowStatus.IN_PROGRESS,
                priority: WorkflowPriority.HIGH,
                retryCount: 0,
                payload: {
                    workflowName: 'Payment Processing',
                    workflowType: 'payment',
                    customerId: 'cust-002',
                    stepName: 'Process Payment',
                    executionTime: 2500,
                    message: 'Processing credit card payment'
                }
            });

            expect(event.isCompleted()).toBe(false);
            expect(event.isFailed()).toBe(false);
            expect(event.needsRetry()).toBe(false);
            expect(event.isHighPriority()).toBe(true);
            expect(event.status).toBe(WorkflowStatus.IN_PROGRESS);
        });

        it('should handle workflow completion event', () => {
            const event = createWorkflowEvent({
                workflowId: 'wf-complete-001',
                stepId: 'step-finalize',
                status: WorkflowStatus.COMPLETED,
                priority: WorkflowPriority.LOW,
                retryCount: 0,
                payload: {
                    workflowName: 'Inventory Update',
                    workflowType: 'inventory',
                    customerId: 'cust-003',
                    stepName: 'Update Stock',
                    executionTime: 500,
                    message: 'Inventory updated successfully'
                }
            });

            expect(event.isCompleted()).toBe(true);
            expect(event.isFailed()).toBe(false);
            expect(event.needsRetry()).toBe(false);
            expect(event.isHighPriority()).toBe(false);
        });

        it('should handle workflow failure with retry', () => {
            const event = createWorkflowEvent({
                workflowId: 'wf-failed-001',
                stepId: 'step-payment',
                dbClusterId: 'cluster-prod-01',
                status: WorkflowStatus.FAILED,
                priority: WorkflowPriority.HIGH,
                retryCount: 2,
                payload: {
                    workflowName: 'Payment Gateway',
                    workflowType: 'payment',
                    customerId: 'cust-004',
                    stepName: 'Charge Card',
                    executionTime: 5000,
                    message: 'Payment gateway timeout',
                    metadata: {
                        errorCode: 'GATEWAY_TIMEOUT',
                        gatewayResponse: 'Connection timeout after 5s'
                    }
                }
            });

            expect(event.isCompleted()).toBe(false);
            expect(event.isFailed()).toBe(true);
            expect(event.needsRetry()).toBe(true);
            expect(event.isHighPriority()).toBe(true);
            expect(event.retryCount).toBe(2);
        });

        it('should handle multi-step workflow progression', () => {
            const steps = [
                { stepId: 'step-1', status: WorkflowStatus.COMPLETED },
                { stepId: 'step-2', status: WorkflowStatus.COMPLETED },
                { stepId: 'step-3', status: WorkflowStatus.IN_PROGRESS },
                { stepId: 'step-4', status: WorkflowStatus.STARTED }
            ];

            const workflowId = 'wf-multi-001';

            steps.forEach(({ stepId, status }) => {
                const event = createWorkflowEvent({
                    workflowId,
                    stepId,
                    status,
                    payload: {
                        workflowName: 'Multi-Step Process',
                        workflowType: 'complex',
                        customerId: 'cust-005',
                        stepName: stepId
                    }
                });

                expect(event.workflowId).toBe(workflowId);
                expect(event.stepId).toBe(stepId);
                expect(event.status).toBe(status);
            });
        });

        it('should handle different priority levels', () => {
            const priorities = [
                WorkflowPriority.LOW,
                WorkflowPriority.MEDIUM,
                WorkflowPriority.HIGH
            ];

            priorities.forEach(priority => {
                const event = createWorkflowEvent({ priority });
                expect(event.priority).toBe(priority);
                expect(event.isHighPriority()).toBe(priority === WorkflowPriority.HIGH);
            });
        });

        it('should track retry attempts on failures', () => {
            const retryAttempts = [0, 1, 2, 3, 5];

            retryAttempts.forEach(retryCount => {
                const event = createWorkflowEvent({
                    status: WorkflowStatus.FAILED,
                    retryCount,
                    payload: {
                        workflowName: 'Retry Test',
                        workflowType: 'test',
                        customerId: 'cust-retry',
                        message: `Retry attempt ${retryCount}`
                    }
                });

                expect(event.retryCount).toBe(retryCount);
                expect(event.needsRetry()).toBe(true);
            });
        });

        it('should handle workflow with metadata', () => {
            const event = createWorkflowEvent({
                status: WorkflowStatus.COMPLETED,
                payload: {
                    workflowName: 'Data Export',
                    workflowType: 'export',
                    customerId: 'cust-006',
                    stepName: 'Generate Report',
                    executionTime: 8000,
                    metadata: {
                        recordsProcessed: 10000,
                        fileSize: '5MB',
                        outputFormat: 'CSV',
                        s3Bucket: 'exports-bucket',
                        s3Key: 'reports/2024/export-001.csv'
                    }
                }
            });

            expect(event.isCompleted()).toBe(true);
            expect(event.payload.metadata).toBeDefined();
            expect(event.payload.metadata?.recordsProcessed).toBe(10000);
            expect(event.payload.metadata?.outputFormat).toBe('CSV');
        });
    });
});