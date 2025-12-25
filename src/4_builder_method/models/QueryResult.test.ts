import { describe, it, expect, beforeEach } from 'vitest';
import { QueryResult } from './QueryResult.js';
import type { INode, IEdge } from './interfaces.ts/index.js';

class MockNode implements INode {
    constructor(
        public id: string,
        public labels: string[],
        public properties: Record<string, any> = {}
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
        this.labels = this.labels.filter(l => l !== label);
    }

    toString(): string {
        return `Node(${this.id}, [${this.labels.join(', ')}])`;
    }

    clone(): INode {
        return new MockNode(
            this.id,
            [...this.labels],
            { ...this.properties }
        );
    }
}

class MockEdge implements IEdge {
    constructor(
        public id: string,
        public type: string,
        private sourceId: string,
        private targetId: string,
        public properties: Record<string, any> = {}
    ) { }

    get from(): string {
        return this.sourceId;
    }

    get to(): string {
        return this.targetId;
    }

    connects(fromId: string, toId: string): boolean {
        return (this.sourceId === fromId && this.targetId === toId) ||
            (this.sourceId === toId && this.targetId === fromId);
    }

    involvesNode(nodeId: string): boolean {
        return this.sourceId === nodeId || this.targetId === nodeId;
    }

    getOtherNode(nodeId: string): string | null {
        if (this.sourceId === nodeId) {
            return this.targetId;
        }
        if (this.targetId === nodeId) {
            return this.sourceId;
        }
        return null;
    }

    reverse(): IEdge {
        return new MockEdge(
            this.id,
            this.type,
            this.targetId,
            this.sourceId,
            { ...this.properties }
        );
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

    toString(): string {
        return `Edge(${this.id}, ${this.type}, ${this.sourceId} -> ${this.targetId})`;
    }

    clone(): IEdge {
        return new MockEdge(
            this.id,
            this.type,
            this.sourceId,
            this.targetId,
            { ...this.properties }
        );
    }
}

describe('QueryResult', () => {
    let nodes: INode[];
    let edges: IEdge[];

    beforeEach(() => {
        nodes = [
            new MockNode('n1', ['Person', 'Employee'], { name: 'Alice' }),
            new MockNode('n2', ['Person'], { name: 'Bob' }),
            new MockNode('n3', ['Company'], { name: 'Acme Corp' }),
            new MockNode('n4', ['Person', 'Manager'], { name: 'Charlie' })
        ];

        edges = [
            new MockEdge('e1', 'WORKS_FOR', 'n1', 'n3'),
            new MockEdge('e2', 'WORKS_FOR', 'n2', 'n3'),
            new MockEdge('e3', 'MANAGES', 'n4', 'n1'),
            new MockEdge('e4', 'KNOWS', 'n1', 'n2')
        ];
    });

    describe('constructor', () => {
        it('should create a QueryResult with nodes and edges', () => {
            const result = new QueryResult(nodes, edges);
            expect(result.nodes).toBe(nodes);
            expect(result.edges).toBe(edges);
        });

        it('should create a QueryResult with only nodes (empty edges)', () => {
            const result = new QueryResult(nodes);
            expect(result.nodes).toBe(nodes);
            expect(result.edges).toEqual([]);
        });

        it('should create an empty QueryResult', () => {
            const result = new QueryResult([]);
            expect(result.nodes).toEqual([]);
            expect(result.edges).toEqual([]);
        });
    });

    describe('nodeCount', () => {
        it('should return the correct number of nodes', () => {
            const result = new QueryResult(nodes, edges);
            expect(result.nodeCount).toBe(4);
        });

        it('should return 0 for empty nodes', () => {
            const result = new QueryResult([]);
            expect(result.nodeCount).toBe(0);
        });
    });

    describe('edgeCount', () => {
        it('should return the correct number of edges', () => {
            const result = new QueryResult(nodes, edges);
            expect(result.edgeCount).toBe(4);
        });

        it('should return 0 for empty edges', () => {
            const result = new QueryResult(nodes);
            expect(result.edgeCount).toBe(0);
        });
    });

    describe('isEmpty', () => {
        it('should return false when nodes exist', () => {
            const result = new QueryResult(nodes, edges);
            expect(result.isEmpty()).toBe(false);
        });

        it('should return true when no nodes exist', () => {
            const result = new QueryResult([]);
            expect(result.isEmpty()).toBe(true);
        });

        it('should return true even if edges exist but no nodes', () => {
            const result = new QueryResult([], edges);
            expect(result.isEmpty()).toBe(true);
        });
    });

    describe('getNodesByLabel', () => {
        it('should return all nodes with a specific label', () => {
            const result = new QueryResult(nodes, edges);
            const personNodes = result.getNodesByLabel('Person');
            expect(personNodes).toHaveLength(3);
            expect(personNodes.map(n => n.id)).toEqual(['n1', 'n2', 'n4']);
        });

        it('should return nodes with multiple labels', () => {
            const result = new QueryResult(nodes, edges);
            const employeeNodes = result.getNodesByLabel('Employee');
            expect(employeeNodes).toHaveLength(1);
            const [firstNode] = employeeNodes;
            expect(firstNode?.id).toBe('n1');
        });

        it('should return empty array when label does not exist', () => {
            const result = new QueryResult(nodes, edges);
            const adminNodes = result.getNodesByLabel('Admin');
            expect(adminNodes).toEqual([]);
        });

        it('should return empty array for empty result', () => {
            const result = new QueryResult([]);
            const personNodes = result.getNodesByLabel('Person');
            expect(personNodes).toEqual([]);
        });
    });

    describe('getEdgesByType', () => {
        it('should return all edges with a specific type', () => {
            const result = new QueryResult(nodes, edges);
            const worksForEdges = result.getEdgesByType('WORKS_FOR');
            expect(worksForEdges).toHaveLength(2);
            expect(worksForEdges.map(e => e.id)).toEqual(['e1', 'e2']);
        });

        it('should return single edge when only one matches', () => {
            const result = new QueryResult(nodes, edges);
            const managesEdges = result.getEdgesByType('MANAGES');
            expect(managesEdges).toHaveLength(1);
            const [firstEdge] = managesEdges;
            expect(firstEdge?.id).toBe('e3');
        });

        it('should return empty array when type does not exist', () => {
            const result = new QueryResult(nodes, edges);
            const reportingEdges = result.getEdgesByType('REPORTS_TO');
            expect(reportingEdges).toEqual([]);
        });

        it('should return empty array for empty edges', () => {
            const result = new QueryResult(nodes);
            const worksForEdges = result.getEdgesByType('WORKS_FOR');
            expect(worksForEdges).toEqual([]);
        });
    });

    describe('getNodeById', () => {
        it('should return the node with matching id', () => {
            const result = new QueryResult(nodes, edges);
            const node = result.getNodeById('n2');
            expect(node).toBeDefined();
            expect(node?.id).toBe('n2');
            expect(node?.getProperty('name')).toBe('Bob');
        });

        it('should return undefined when id does not exist', () => {
            const result = new QueryResult(nodes, edges);
            const node = result.getNodeById('n999');
            expect(node).toBeUndefined();
        });

        it('should return undefined for empty result', () => {
            const result = new QueryResult([]);
            const node = result.getNodeById('n1');
            expect(node).toBeUndefined();
        });
    });

    describe('getEdgeById', () => {
        it('should return the edge with matching id', () => {
            const result = new QueryResult(nodes, edges);
            const edge = result.getEdgeById('e3');
            expect(edge).toBeDefined();
            expect(edge?.id).toBe('e3');
            expect(edge?.type).toBe('MANAGES');
        });

        it('should return undefined when id does not exist', () => {
            const result = new QueryResult(nodes, edges);
            const edge = result.getEdgeById('e999');
            expect(edge).toBeUndefined();
        });

        it('should return undefined for empty edges', () => {
            const result = new QueryResult(nodes);
            const edge = result.getEdgeById('e1');
            expect(edge).toBeUndefined();
        });
    });

    describe('toString', () => {
        it('should return formatted string with all information', () => {
            const result = new QueryResult(nodes, edges);
            const str = result.toString();

            expect(str).toContain('QueryResult');
            expect(str).toContain('Nodes: 4');
            expect(str).toContain('Edges: 4');
            expect(str).toContain('Person');
            expect(str).toContain('Company');
            expect(str).toContain('WORKS_FOR');
            expect(str).toContain('MANAGES');
        });

        it('should handle empty result', () => {
            const result = new QueryResult([]);
            const str = result.toString();

            expect(str).toContain('Nodes: 0');
            expect(str).toContain('Edges: 0');
            expect(str).toContain('Node Labels: []');
            expect(str).toContain('Edge Types: []');
        });

        it('should show unique labels only', () => {
            const result = new QueryResult(nodes, edges);
            const str = result.toString();

            // Count occurrences - each label should appear only once in the labels section
            const personMatches = str.match(/Person/g);
            expect(personMatches?.length).toBeLessThanOrEqual(2); // Once in label, maybe in description
        });

        it('should handle nodes without edges', () => {
            const result = new QueryResult(nodes);
            const str = result.toString();

            expect(str).toContain('Nodes: 4');
            expect(str).toContain('Edges: 0');
            expect(str).toContain('Edge Types: []');
        });
    });
});