abstract class Event<T = Record<string, any>> {
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

    protected getAdditionalFields(): Record<string, any> {
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

    toRecord(): Record<string, any> {
        return {
            id: this.id,
            type: this.type,
            timestamp: this.timestamp,
            payload: this.payload,
            ...this.getAdditionalFields()
        };
    }

    static fromRecord(_record: Record<string, any>): Event {
        throw new Error('fromRecord must be implemented by subclasses');
    }
}

export { Event };