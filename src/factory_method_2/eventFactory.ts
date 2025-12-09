import { Event } from "./events/event.js";
import { WorkflowEvent } from "./events/workflowEvent.js";
import { WebserviceEvent } from "./events/webserviceEvent.js";
import { TestEvent } from "./events/testEvent.js";
import { WORKFLOW_EVENT_TYPE } from "./events/workflowEvent.js";
import { WEBSERVICE_EVENT_TYPE } from "./events/webserviceEvent.js";
import { TEST_EVENT_TYPE } from "./events/testEvent.js";

// Event type constants
const EVENT_TYPES = {
    WORKFLOW: WORKFLOW_EVENT_TYPE,
    WEBSERVICE: WEBSERVICE_EVENT_TYPE,
    TEST: TEST_EVENT_TYPE
} as const;

type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

/**
 * EventFactory - Factory Method Pattern Implementation
 * 
 * This factory creates concrete Event instances based on the event type.
 * It encapsulates the creation logic and delegates to the appropriate
 * concrete class's fromRecord method.
 */
class EventFactory {
    /**
     * Creates an Event instance from a record object
     * 
     * @param record - The record containing event data with a 'type' field
     * @returns An instance of the appropriate concrete Event class
     * @throws Error if the event type is unknown
     */
    static createEvent(record: Record<string, any>): Event {
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

    /**
     * Creates an Event instance from a JSON string
     * 
     * @param json - The JSON string containing event data
     * @returns An instance of the appropriate concrete Event class
     */
    static createEventFromJSON(json: string): Event {
        const record = JSON.parse(json);
        return this.createEvent(record);
    }

    /**
     * Creates multiple Event instances from an array of records
     * 
     * @param records - Array of record objects
     * @returns Array of Event instances
     */
    static createEvents(records: Record<string, any>[]): Event[] {
        return records.map(record => this.createEvent(record));
    }

    /**
     * Checks if a given event type is supported by the factory
     * 
     * @param eventType - The event type to check
     * @returns True if the event type is supported
     */
    static isEventTypeSupported(eventType: string): boolean {
        return Object.values(EVENT_TYPES).includes(eventType as EventType);
    }

    /**
     * Gets all supported event types
     * 
     * @returns Array of supported event type strings
     */
    static getSupportedEventTypes(): string[] {
        return Object.values(EVENT_TYPES);
    }
}

export { EventFactory, EVENT_TYPES, type EventType };
