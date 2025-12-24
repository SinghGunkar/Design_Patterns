import { INode } from './interfaces/INode';
import { IEdge } from './interfaces/IEdge';
import { IQueryResult } from './interfaces/IQueryResult';

export class QueryResult implements IQueryResult {
    constructor(
        public nodes: INode[],
        public edges: IEdge[] = []
    ) { }

    get nodeCount(): number {
        return this.nodes.length;
    }

    get edgeCount(): number {
        return this.edges.length;
    }

    isEmpty(): boolean {
        return this.nodes.length === 0;
    }

    getNodesByLabel(label: string): INode[] {
        return this.nodes.filter(node => node.hasLabel(label));
    }

    getEdgesByType(type: string): IEdge[] {
        return this.edges.filter(edge => edge.type === type);
    }

    getNodeById(id: string): INode | undefined {
        return this.nodes.find(node => node.id === id);
    }

    getEdgeById(id: string): IEdge | undefined {
        return this.edges.find(edge => edge.id === id);
    }

    toString(): string {
        const nodeLabels = new Set(this.nodes.flatMap(n => n.labels));
        const edgeTypes = new Set(this.edges.map(e => e.type));

        return `QueryResult(
  Nodes: ${this.nodeCount}
  Node Labels: [${Array.from(nodeLabels).join(', ')}]
  Edges: ${this.edgeCount}
  Edge Types: [${Array.from(edgeTypes).join(', ')}]
)`;
    }
}