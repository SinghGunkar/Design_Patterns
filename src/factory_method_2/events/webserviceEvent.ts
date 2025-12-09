import { Event } from "./event.js";

const EVENT_TYPE = 'webservice' as const;

enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    OPTIONS = 'OPTIONS',
    HEAD = 'HEAD'
}

enum WebserviceStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    TIMEOUT = 'timeout',
    RETRY = 'retry'
}

enum ResponseType {
    JSON = 'json',
    XML = 'xml',
    TEXT = 'text',
    BINARY = 'binary'
}

interface WebservicePayload extends Record<string, unknown> {
    endpoint: string;
    requestBody?: unknown;
    responseBody?: unknown;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}

class WebserviceEvent extends Event<WebservicePayload> {
    requestId: string;
    method: HttpMethod;
    statusCode: number;
    responseTime: number;
    status: WebserviceStatus;
    responseType: ResponseType;
    retryAttempt: number;

    constructor(
        requestId: string,
        method: HttpMethod,
        statusCode: number,
        responseTime: number,
        status: WebserviceStatus,
        responseType: ResponseType,
        retryAttempt: number,
        payload: WebservicePayload
    ) {
        super(EVENT_TYPE, payload);
        this.requestId = requestId;
        this.method = method;
        this.statusCode = statusCode;
        this.responseTime = responseTime;
        this.status = status;
        this.responseType = responseType;
        this.retryAttempt = retryAttempt;
    }

    protected override getAdditionalFields(): Record<string, unknown> {
        return {
            requestId: this.requestId,
            method: this.method,
            statusCode: this.statusCode,
            responseTime: this.responseTime,
            status: this.status,
            responseType: this.responseType,
            retryAttempt: this.retryAttempt
        };
    }

    static override fromRecord(record: Record<string, unknown>): WebserviceEvent {
        const event = new WebserviceEvent(
            record.requestId as string,
            record.method as HttpMethod,
            record.statusCode as number,
            record.responseTime as number,
            record.status as WebserviceStatus,
            record.responseType as ResponseType,
            record.retryAttempt as number,
            record.payload as WebservicePayload
        );
        event.id = record.id as string;
        event.timestamp = new Date(record.timestamp as string);
        return event;
    }

    isSuccessful(): boolean {
        return this.status === WebserviceStatus.SUCCESS && this.statusCode >= 200 && this.statusCode < 300;
    }

    isClientError(): boolean {
        return this.statusCode >= 400 && this.statusCode < 500;
    }

    isServerError(): boolean {
        return this.statusCode >= 500 && this.statusCode < 600;
    }

    hasTimedOut(): boolean {
        return this.status === WebserviceStatus.TIMEOUT;
    }

    needsRetry(): boolean {
        return this.status === WebserviceStatus.RETRY || this.status === WebserviceStatus.TIMEOUT;
    }

    isSlowResponse(): boolean {
        const SLOW_THRESHOLD_MS = 1000;
        return this.responseTime > SLOW_THRESHOLD_MS;
    }
}

export { WebserviceEvent, HttpMethod, WebserviceStatus, ResponseType, EVENT_TYPE as WEBSERVICE_EVENT_TYPE };
