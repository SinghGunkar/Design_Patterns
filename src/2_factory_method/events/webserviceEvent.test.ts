import { describe, it, expect } from 'vitest';
import { WebserviceEvent, HttpMethod, WebserviceStatus, ResponseType, WEBSERVICE_EVENT_TYPE, type WebservicePayload } from './webserviceEvent.js'

describe('WebserviceEvent', () => {
    const createWebserviceEvent = (overrides: Partial<{
        requestId: string;
        method: HttpMethod;
        statusCode: number;
        responseTime: number;
        status: WebserviceStatus;
        responseType: ResponseType;
        retryAttempt: number;
        payload: WebservicePayload;
    }> = {}) => {
        return new WebserviceEvent(
            overrides.requestId ?? 'req-123',
            overrides.method ?? HttpMethod.GET,
            overrides.statusCode ?? 200,
            overrides.responseTime ?? 150,
            overrides.status ?? WebserviceStatus.SUCCESS,
            overrides.responseType ?? ResponseType.JSON,
            overrides.retryAttempt ?? 0,
            overrides.payload ?? {
                endpoint: '/api/users',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    };

    describe('constructor', () => {
        it('should create a webservice event with all required fields', () => {
            const payload = {
                endpoint: '/api/orders',
                requestBody: { orderId: 123 },
                responseBody: { status: 'completed' },
                headers: { 'Authorization': 'Bearer token' },
                queryParams: { page: '1' }
            };

            const event = new WebserviceEvent(
                'req-456',
                HttpMethod.POST,
                201,
                250,
                WebserviceStatus.SUCCESS,
                ResponseType.JSON,
                0,
                payload
            );

            expect(event.requestId).toBe('req-456');
            expect(event.method).toBe(HttpMethod.POST);
            expect(event.statusCode).toBe(201);
            expect(event.responseTime).toBe(250);
            expect(event.status).toBe(WebserviceStatus.SUCCESS);
            expect(event.responseType).toBe(ResponseType.JSON);
            expect(event.retryAttempt).toBe(0);
            expect(event.payload).toEqual(payload);
            expect(event.type).toBe(WEBSERVICE_EVENT_TYPE);
        });
    });

    describe('getAdditionalFields', () => {
        it('should include webservice-specific fields in serialization', () => {
            const event = createWebserviceEvent({
                requestId: 'req-789',
                method: HttpMethod.PUT,
                statusCode: 204
            });

            const record = event.toRecord();

            expect(record.requestId).toBe('req-789');
            expect(record.method).toBe(HttpMethod.PUT);
            expect(record.statusCode).toBe(204);
            expect(record.responseTime).toBe(150);
            expect(record.status).toBe(WebserviceStatus.SUCCESS);
            expect(record.responseType).toBe(ResponseType.JSON);
            expect(record.retryAttempt).toBe(0);
        });
    });

    describe('fromRecord', () => {
        it('should deserialize a webservice event from record', () => {
            const record = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                type: WEBSERVICE_EVENT_TYPE,
                timestamp: new Date().toISOString(),
                requestId: 'req-999',
                method: HttpMethod.DELETE,
                statusCode: 404,
                responseTime: 500,
                status: WebserviceStatus.ERROR,
                responseType: ResponseType.JSON,
                retryAttempt: 2,
                payload: {
                    endpoint: '/api/products/999',
                    errorMessage: 'Not found'
                }
            };

            const event = WebserviceEvent.fromRecord(record);

            expect(event.id).toBe(record.id);
            expect(event.requestId).toBe('req-999');
            expect(event.method).toBe(HttpMethod.DELETE);
            expect(event.statusCode).toBe(404);
            expect(event.responseTime).toBe(500);
            expect(event.status).toBe(WebserviceStatus.ERROR);
            expect(event.retryAttempt).toBe(2);
            expect(event.payload.errorMessage).toBe('Not found');
        });

        it('should maintain data integrity through round-trip', () => {
            const original = createWebserviceEvent({
                requestId: 'round-trip',
                method: HttpMethod.PATCH,
                statusCode: 200
            });

            const record = original.toRecord();
            const deserialized = WebserviceEvent.fromRecord(record);

            expect(deserialized.requestId).toBe(original.requestId);
            expect(deserialized.method).toBe(original.method);
            expect(deserialized.statusCode).toBe(original.statusCode);
            expect(deserialized.responseTime).toBe(original.responseTime);
            expect(deserialized.status).toBe(original.status);
        });
    });

    describe('isSuccessful', () => {
        it('should return true for SUCCESS status with 2xx status codes', () => {
            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 200
            }).isSuccessful()).toBe(true);

            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 201
            }).isSuccessful()).toBe(true);

            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 204
            }).isSuccessful()).toBe(true);

            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 299
            }).isSuccessful()).toBe(true);
        });

        it('should return false when status is not SUCCESS', () => {
            expect(createWebserviceEvent({
                status: WebserviceStatus.ERROR,
                statusCode: 200
            }).isSuccessful()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.TIMEOUT,
                statusCode: 200
            }).isSuccessful()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.RETRY,
                statusCode: 200
            }).isSuccessful()).toBe(false);
        });

        it('should return false when statusCode is not 2xx', () => {
            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 199
            }).isSuccessful()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 300
            }).isSuccessful()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 404
            }).isSuccessful()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS,
                statusCode: 500
            }).isSuccessful()).toBe(false);
        });
    });

    describe('isClientError', () => {
        it('should return true for 4xx status codes', () => {
            expect(createWebserviceEvent({ statusCode: 400 }).isClientError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 401 }).isClientError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 403 }).isClientError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 404 }).isClientError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 422 }).isClientError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 429 }).isClientError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 499 }).isClientError()).toBe(true);
        });

        it('should return false for non-4xx status codes', () => {
            expect(createWebserviceEvent({ statusCode: 200 }).isClientError()).toBe(false);
            expect(createWebserviceEvent({ statusCode: 399 }).isClientError()).toBe(false);
            expect(createWebserviceEvent({ statusCode: 500 }).isClientError()).toBe(false);
            expect(createWebserviceEvent({ statusCode: 301 }).isClientError()).toBe(false);
        });
    });

    describe('isServerError', () => {
        it('should return true for 5xx status codes', () => {
            expect(createWebserviceEvent({ statusCode: 500 }).isServerError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 501 }).isServerError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 502 }).isServerError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 503 }).isServerError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 504 }).isServerError()).toBe(true);
            expect(createWebserviceEvent({ statusCode: 599 }).isServerError()).toBe(true);
        });

        it('should return false for non-5xx status codes', () => {
            expect(createWebserviceEvent({ statusCode: 200 }).isServerError()).toBe(false);
            expect(createWebserviceEvent({ statusCode: 404 }).isServerError()).toBe(false);
            expect(createWebserviceEvent({ statusCode: 499 }).isServerError()).toBe(false);
            expect(createWebserviceEvent({ statusCode: 600 }).isServerError()).toBe(false);
        });
    });

    describe('hasTimedOut', () => {
        it('should return true when status is TIMEOUT', () => {
            const event = createWebserviceEvent({
                status: WebserviceStatus.TIMEOUT
            });
            expect(event.hasTimedOut()).toBe(true);
        });

        it('should return false when status is not TIMEOUT', () => {
            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS
            }).hasTimedOut()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.ERROR
            }).hasTimedOut()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.RETRY
            }).hasTimedOut()).toBe(false);
        });
    });

    describe('needsRetry', () => {
        it('should return true when status is RETRY', () => {
            const event = createWebserviceEvent({
                status: WebserviceStatus.RETRY
            });
            expect(event.needsRetry()).toBe(true);
        });

        it('should return true when status is TIMEOUT', () => {
            const event = createWebserviceEvent({
                status: WebserviceStatus.TIMEOUT
            });
            expect(event.needsRetry()).toBe(true);
        });

        it('should return false when status is SUCCESS or ERROR', () => {
            expect(createWebserviceEvent({
                status: WebserviceStatus.SUCCESS
            }).needsRetry()).toBe(false);

            expect(createWebserviceEvent({
                status: WebserviceStatus.ERROR
            }).needsRetry()).toBe(false);
        });
    });

    describe('isSlowResponse', () => {
        it('should return true when responseTime exceeds 1000ms', () => {
            expect(createWebserviceEvent({ responseTime: 1001 }).isSlowResponse()).toBe(true);
            expect(createWebserviceEvent({ responseTime: 2000 }).isSlowResponse()).toBe(true);
            expect(createWebserviceEvent({ responseTime: 5000 }).isSlowResponse()).toBe(true);
        });

        it('should return false when responseTime is exactly 1000ms', () => {
            expect(createWebserviceEvent({ responseTime: 1000 }).isSlowResponse()).toBe(false);
        });

        it('should return false when responseTime is below 1000ms', () => {
            expect(createWebserviceEvent({ responseTime: 999 }).isSlowResponse()).toBe(false);
            expect(createWebserviceEvent({ responseTime: 500 }).isSlowResponse()).toBe(false);
            expect(createWebserviceEvent({ responseTime: 100 }).isSlowResponse()).toBe(false);
            expect(createWebserviceEvent({ responseTime: 0 }).isSlowResponse()).toBe(false);
        });
    });

    describe('integration scenarios', () => {
        it('should handle successful GET request', () => {
            const event = createWebserviceEvent({
                method: HttpMethod.GET,
                statusCode: 200,
                status: WebserviceStatus.SUCCESS,
                responseTime: 150,
                payload: {
                    endpoint: '/api/users/123',
                    responseBody: { id: 123, name: 'John' }
                }
            });

            expect(event.isSuccessful()).toBe(true);
            expect(event.isClientError()).toBe(false);
            expect(event.isServerError()).toBe(false);
            expect(event.hasTimedOut()).toBe(false);
            expect(event.needsRetry()).toBe(false);
            expect(event.isSlowResponse()).toBe(false);
        });

        it('should handle client error with retry', () => {
            const event = createWebserviceEvent({
                method: HttpMethod.POST,
                statusCode: 429,
                status: WebserviceStatus.RETRY,
                responseTime: 200,
                retryAttempt: 1,
                payload: {
                    endpoint: '/api/orders',
                    errorMessage: 'Rate limit exceeded'
                }
            });

            expect(event.isSuccessful()).toBe(false);
            expect(event.isClientError()).toBe(true);
            expect(event.isServerError()).toBe(false);
            expect(event.needsRetry()).toBe(true);
            expect(event.retryAttempt).toBe(1);
        });

        it('should handle server error', () => {
            const event = createWebserviceEvent({
                method: HttpMethod.PUT,
                statusCode: 500,
                status: WebserviceStatus.ERROR,
                responseTime: 3000,
                payload: {
                    endpoint: '/api/products/456',
                    errorMessage: 'Internal server error'
                }
            });

            expect(event.isSuccessful()).toBe(false);
            expect(event.isClientError()).toBe(false);
            expect(event.isServerError()).toBe(true);
            expect(event.isSlowResponse()).toBe(true);
        });

        it('should handle timeout scenario', () => {
            const event = createWebserviceEvent({
                method: HttpMethod.GET,
                statusCode: 504,
                status: WebserviceStatus.TIMEOUT,
                responseTime: 30000,
                retryAttempt: 2,
                payload: {
                    endpoint: '/api/slow-endpoint',
                    errorMessage: 'Gateway timeout'
                }
            });

            expect(event.hasTimedOut()).toBe(true);
            expect(event.needsRetry()).toBe(true);
            expect(event.isServerError()).toBe(true);
            expect(event.isSlowResponse()).toBe(true);
            expect(event.retryAttempt).toBe(2);
        });

        it('should handle different HTTP methods', () => {
            const methods = [
                HttpMethod.GET,
                HttpMethod.POST,
                HttpMethod.PUT,
                HttpMethod.DELETE,
                HttpMethod.PATCH,
                HttpMethod.OPTIONS,
                HttpMethod.HEAD
            ];

            methods.forEach(method => {
                const event = createWebserviceEvent({ method });
                expect(event.method).toBe(method);
            });
        });

        it('should handle different response types', () => {
            const types = [
                ResponseType.JSON,
                ResponseType.XML,
                ResponseType.TEXT,
                ResponseType.BINARY
            ];

            types.forEach(responseType => {
                const event = createWebserviceEvent({ responseType });
                expect(event.responseType).toBe(responseType);
            });
        });
    });
});