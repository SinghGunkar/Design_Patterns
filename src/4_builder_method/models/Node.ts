import type { INode, Properties } from './interfaces.ts/index.js';

export class Node implements INode {
    constructor(
        public id: string,
        public labels: string[],
        public properties: Properties
    ) { }

    hasLabel(label: string): boolean {
        return this.labels.includes(label);
    }

    getProperty(key: string): unknown {
        return this.properties[key];
    }

    setProperty(key: string, value: unknown): void {
        this.properties[key] = value;
    }

    hasProperty(key: string): boolean {
        return key in this.properties;
    }

    addLabel(label: string): void {
        if (!this.labels.includes(label)) {
            this.labels.push(label);
        }
    }

    removeLabel(label: string): void {
        const index = this.labels.indexOf(label);
        if (index > -1) {
            this.labels.splice(index, 1);
        }
    }

    toString(): string {
        return `Node(${this.id}, [${this.labels.join(', ')}], ${JSON.stringify(this.properties)})`;
    }

    clone(): INode {
        return new Node(
            this.id,
            [...this.labels],
            { ...this.properties }
        );
    }
}
