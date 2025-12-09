import { Event } from "./events/event.js";
import { WorkflowEvent } from "./events/workflowEvent.js";
import { WebserviceEvent } from "./events/webserviceEvent.js";
import { TestEvent } from "./events/testEvent.js";
import { WORKFLOW_EVENT_TYPE } from "./events/workflowEvent.js";
import { WEBSERVICE_EVENT_TYPE } from "./events/webserviceEvent.js";
import { TEST_EVENT_TYPE } from "./events/testEvent.js";

const EVENT_TYPES = {
    WORKFLOW: WORKFLOW_EVENT_TYPE,
    WEBSERVICE: WEBSERVICE_EVENT_TYPE,
    TEST: TEST_EVENT_TYPE
} as const;

type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];


class EventFactory {
    static createEvent(record: Record<string, unknown>): Event {
        const eventType = record.type as EventType;

        switch (eventType) {
            case EVENT_TYPES.WORKFLOW:
                return WorkflowEvent.fromRecord(record);

            case EVENT_TYPES.WEBSERVICE:
                return WebserviceEvent.fromRecord(record);

            case EVENT_TYPES.TEST:
                return TestEvent.fromRecord(record);

            default:
                throw new Error(`Unknown event type: ${eventType}`);
        }
    }

    static createEventFromJSON(json: string): Event {
        const record = JSON.parse(json);
        return this.createEvent(record);
    }

    static createEvents(records: Record<string, unknown>[]): Event[] {
        return records.map(record => this.createEvent(record));
    }

    static isEventTypeSupported(eventType: string): boolean {
        return Object.values(EVENT_TYPES).includes(eventType as EventType);
    }

    static getSupportedEventTypes(): string[] {
        return Object.values(EVENT_TYPES);
    }
}

export { EventFactory, EVENT_TYPES, type EventType };
