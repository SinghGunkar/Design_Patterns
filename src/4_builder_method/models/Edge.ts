import { IEdge } from './interfaces/IEdge';
import { Properties } from './interfaces/INode';

export class Edge implements IEdge {
    constructor(
        public id: string,
        public type: string,
        public from: string,
        public to: string,
        public properties: Properties = {}
    ) { }

    getProperty(key: string): unknown {
        return this.properties[key];
    }

    setProperty(key: string, value: unknown): void {
        this.properties[key] = value;
    }

    hasProperty(key: string): boolean {
        return key in this.properties;
    }

    connects(fromId: string, toId: string): boolean {
        return this.from === fromId && this.to === toId;
    }

    involvesNode(nodeId: string): boolean {
        return this.from === nodeId || this.to === nodeId;
    }

    getOtherNode(nodeId: string): string | null {
        if (this.from === nodeId) return this.to;
        if (this.to === nodeId) return this.from;
        return null;
    }

    reverse(): IEdge {
        return new Edge(
            `${this.id}_rev`,
            this.type,
            this.to,
            this.from,
            { ...this.properties }
        );
    }

    toString(): string {
        return `Edge(${this.id}, ${this.from}-[${this.type}]->${this.to}, ${JSON.stringify(this.properties)})`;
    }

    clone(): IEdge {
        return new Edge(
            this.id,
            this.type,
            this.from,
            this.to,
            { ...this.properties }
        );
    }
}