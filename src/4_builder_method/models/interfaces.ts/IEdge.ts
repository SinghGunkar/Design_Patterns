import { type Properties } from './INode.js';

export interface IEdge {
    id: string;
    type: string;
    from: string;
    to: string;
    properties: Properties;

    getProperty(key: string): unknown;
    setProperty(key: string, value: unknown): void;
    hasProperty(key: string): boolean;
    connects(fromId: string, toId: string): boolean;
    involvesNode(nodeId: string): boolean;
    getOtherNode(nodeId: string): string | null;
    reverse(): IEdge;
    toString(): string;
    clone(): IEdge;
}