import { INode, Properties } from '../models/interfaces/INode';
import { IEdge } from '../models/interfaces/IEdge';

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

    findNodesByLabel(label: string): INode[];
    findNodesByProperty(key: string, value: unknown): INode[];
    findEdgesByType(type: string): IEdge[];

    getNeighbors(nodeId: string): INode[];
    followEdgeType(nodeId: string, edgeType: string): INode[];
    areConnected(fromId: string, toId: string, edgeType?: string): boolean;

    clear(): void;
}