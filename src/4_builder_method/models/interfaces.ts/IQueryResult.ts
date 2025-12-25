import type { INode } from './INode.js';
import type { IEdge } from './IEdge.js';

export interface IQueryResult {
    nodes: INode[];
    edges: IEdge[];

    readonly nodeCount: number;
    readonly edgeCount: number;

    isEmpty(): boolean;
    getNodesByLabel(label: string): INode[];
    getEdgesByType(type: string): IEdge[];
    getNodeById(id: string): INode | undefined;
    getEdgeById(id: string): IEdge | undefined;
    toString(): string;
}