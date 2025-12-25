import type { IEdge, INode, Properties, IQueryResult } from '../models/index.js';

export interface IGraphDatabase {
    createNode(labels: string[], properties?: Properties): INode;
    createEdge(type: string, from: string, to: string, properties?: Properties): IEdge;

    getNode(id: string): INode | undefined;
    getEdge(id: string): IEdge | undefined;

    getAllNodes(): INode[];
    getAllEdges(): IEdge[];

    getEdgesFrom(nodeId: string): IEdge[];
    getEdgesTo(nodeId: string): IEdge[];
    getEdgesForNode(nodeId: string): IEdge[];

    deleteNode(nodeId: string): boolean;
    deleteEdge(edgeId: string): boolean;

    findNodesByLabel(label: string): IQueryResult;
    findNodesByProperty(key: string, value: unknown): IQueryResult;
    findEdgesByType(type: string): IQueryResult;

    getNeighbors(nodeId: string): IQueryResult;
    followEdgeType(nodeId: string, edgeType: string): IQueryResult;
    areConnected(fromId: string, toId: string, edgeType?: string): boolean;

    clear(): void;
}