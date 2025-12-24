export interface Properties {
    [key: string]: unknown;
}

export interface INode {
    id: string;
    labels: string[];
    properties: Properties;

    hasLabel(label: string): boolean;
    getProperty(key: string): unknown;
    setProperty(key: string, value: unknown): void;
    hasProperty(key: string): boolean;
    addLabel(label: string): void;
    removeLabel(label: string): void;
    toString(): string;
    clone(): INode;
}