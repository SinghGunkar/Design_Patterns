abstract class Event<T = Record<string, unknown>> {
    id: string;
    type: string;
    timestamp: Date;
    payload: T;

    constructor(type: string, payload: T) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.timestamp = new Date();
        this.payload = payload;
    }

    protected getAdditionalFields(): Record<string, unknown> {
        return {};
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            type: this.type,
            timestamp: this.timestamp.toISOString(),
            payload: this.payload,
            ...this.getAdditionalFields()
        });
    }

    static fromJSON(json: string): Event {
        const data = JSON.parse(json);
        return this.fromRecord(data);
    }

    toRecord(): Record<string, unknown> {
        return {
            id: this.id,
            type: this.type,
            timestamp: this.timestamp,
            payload: this.payload,
            ...this.getAdditionalFields()
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static fromRecord(_record: Record<string, unknown>): Event {
        throw new Error('fromRecord must be implemented by subclasses');
    }
}

export { Event };
