import { Node, type Properties, type INode } from '../models/index.js';

export class NodeBuilder {
    private id: string | undefined = undefined;
    private labels: string[] = [];
    private properties: Properties = {};

    withId(id: string): this {
        this.id = id;
        return this;
    }

    addLabel(label: string): this {
        if (!this.labels.includes(label)) {
            this.labels.push(label);
        }
        return this;
    }

    addLabels(...labels: string[]): this {
        labels.forEach(label => this.addLabel(label));
        return this;
    }

    withLabels(labels: string[]): this {
        this.labels = [...labels];
        return this;
    }

    addProperty(key: string, value: unknown): this {
        this.properties[key] = value;
        return this;
    }

    addProperties(properties: Properties): this {
        this.properties = { ...this.properties, ...properties };
        return this;
    }

    withProperties(properties: Properties): this {
        this.properties = { ...properties };
        return this;
    }

    build(): INode {
        if (!this.id) {
            throw new Error('Node ID is required');
        }

        return new Node(this.id, this.labels, this.properties);
    }

    reset(): this {
        this.id = undefined;
        this.labels = [];
        this.properties = {};
        return this;
    }

    static fromNode(node: INode): NodeBuilder {
        return new NodeBuilder()
            .withId(node.id)
            .withLabels([...node.labels])
            .withProperties({ ...node.properties });
    }
}