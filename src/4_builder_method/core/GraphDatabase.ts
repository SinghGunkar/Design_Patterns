import { IGraphDatabase } from './IGraphDatabase';
import { INode, Properties } from '../models/interfaces/INode';
import { IEdge } from '../models/interfaces/IEdge';
import { Node } from '../models/Node';
import { Edge } from '../models/Edge';

export class GraphDatabase implements IGraphDatabase {
    private nodes: Map<string, INode> = new Map();
    private edges: Map<string, IEdge> = new Map();
    private nodeCounter = 0;
    private edgeCounter = 0;

    createNode(labels: string[], properties: Properties = {}): INode {
        const id = `n${this.nodeCounter++}`;
        const node = new Node(id, labels, properties);
        this.nodes.set(id, node);
        return node;
    }

    createEdge(type: string, from: string, to: string, properties: Properties = {}): IEdge {
        if (!this.nodes.has(from)) {
            throw new Error(`Source node ${from} does not exist`);
        }
        if (!this.nodes.has(to)) {
            throw new Error(`Target node ${to} does not exist`);
        }

        const id = `e${this.edgeCounter++}`;
        const edge = new Edge(id, type, from, to, properties);
        this.edges.set(id, edge);
        return edge;
    }

    getNode(id: string): INode | undefined {
        return this.nodes.get(id);
    }

    getEdge(id: string): IEdge | undefined {
        return this.edges.get(id);
    }

    getAllNodes(): INode[] {
        return Array.from(this.nodes.values());
    }

    getAllEdges(): IEdge[] {
        return Array.from(this.edges.values());
    }

    getEdgesFrom(nodeId: string): IEdge[] {
        return this.getAllEdges().filter(e => e.from === nodeId);
    }

    getEdgesTo(nodeId: string): IEdge[] {
        return this.getAllEdges().filter(e => e.to === nodeId);
    }

    getEdgesForNode(nodeId: string): IEdge[] {
        return this.getAllEdges().filter(e => e.involvesNode(nodeId));
    }

    deleteNode(nodeId: string): boolean {
        const node = this.nodes.get(nodeId);
        if (!node) return false;

        const connectedEdges = this.getEdgesForNode(nodeId);
        connectedEdges.forEach(edge => this.edges.delete(edge.id));

        this.nodes.delete(nodeId);
        return true;
    }

    deleteEdge(edgeId: string): boolean {
        return this.edges.delete(edgeId);
    }

    findNodesByLabel(label: string): INode[] {
        return this.getAllNodes().filter(node => node.hasLabel(label));
    }

    findNodesByProperty(key: string, value: unknown): INode[] {
        return this.getAllNodes().filter(node => node.getProperty(key) === value);
    }

    findEdgesByType(type: string): IEdge[] {
        return this.getAllEdges().filter(edge => edge.type === type);
    }

    getNeighbors(nodeId: string): INode[] {
        const edges = this.getEdgesFrom(nodeId);
        return edges
            .map(e => this.getNode(e.to))
            .filter(n => n !== undefined) as INode[];
    }

    followEdgeType(nodeId: string, edgeType: string): INode[] {
        const edges = this.getEdgesFrom(nodeId).filter(e => e.type === edgeType);
        return edges
            .map(e => this.getNode(e.to))
            .filter(n => n !== undefined) as INode[];
    }

    areConnected(fromId: string, toId: string, edgeType?: string): boolean {
        const edges = this.getEdgesFrom(fromId);
        return edges.some(e => e.to === toId && (!edgeType || e.type === edgeType));
    }

    clear(): void {
        this.nodes.clear();
        this.edges.clear();
        this.nodeCounter = 0;
        this.edgeCounter = 0;
    }
}