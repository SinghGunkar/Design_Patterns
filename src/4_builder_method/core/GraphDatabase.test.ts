import { describe, it, expect, beforeEach } from 'vitest';
import { GraphDatabase } from './index.js'
import type { Node, Edge } from '../models/index.js';

describe('GraphDatabase', () => {
    let db: GraphDatabase;

    beforeEach(() => {
        db = new GraphDatabase();
    });

    describe('Node Operations', () => {
        it('should create a node with auto-generated id', () => {
            const node = db.createNode(['Person'], { name: 'Alice', age: 30 });

            expect(node.id).toBe('n0');
            expect(node.labels).toEqual(['Person']);
            expect(node.properties).toEqual({ name: 'Alice', age: 30 });
        });

        it('should create multiple nodes with incrementing ids', () => {
            const node1 = db.createNode(['Person'], { name: 'Alice' });
            const node2 = db.createNode(['Person'], { name: 'Bob' });
            const node3 = db.createNode(['Product'], { name: 'Mouse' });

            expect(node1.id).toBe('n0');
            expect(node2.id).toBe('n1');
            expect(node3.id).toBe('n2');
        });

        it('should get node by id', () => {
            const created = db.createNode(['Person'], { name: 'Alice' });
            const retrieved = db.getNode(created.id);

            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe(created.id);
            expect(retrieved?.properties).toEqual({ name: 'Alice' });
        });

        it('should return undefined for non-existent node', () => {
            const node = db.getNode('nonexistent');

            expect(node).toBeUndefined();
        });

        it('should get all nodes', () => {
            db.createNode(['Person'], { name: 'Alice' });
            db.createNode(['Person'], { name: 'Bob' });
            db.createNode(['Product'], { name: 'Mouse' });

            const nodes = db.getAllNodes();

            expect(nodes).toHaveLength(3);
        });

        it('should delete a node', () => {
            const node = db.createNode(['Person'], { name: 'Alice' });

            const deleted = db.deleteNode(node.id);

            expect(deleted).toBe(true);
            expect(db.getNode(node.id)).toBeUndefined();
            expect(db.getAllNodes()).toHaveLength(0);
        });

        it('should return false when deleting non-existent node', () => {
            const deleted = db.deleteNode('nonexistent');

            expect(deleted).toBe(false);
        });

        it('should delete connected edges when deleting a node', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            db.createEdge('FRIENDS_WITH', alice.id, bob.id);

            db.deleteNode(alice.id);

            expect(db.getAllEdges()).toHaveLength(0);
        });
    });

    describe('Edge Operations', () => {
        it('should create an edge with auto-generated id', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });

            const edge = db.createEdge('FRIENDS_WITH', alice.id, bob.id, { since: 2020 });

            expect(edge.id).toBe('e0');
            expect(edge.type).toBe('FRIENDS_WITH');
            expect(edge.from).toBe(alice.id);
            expect(edge.to).toBe(bob.id);
            expect(edge.properties).toEqual({ since: 2020 });
        });

        it('should create multiple edges with incrementing ids', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            const edge1 = db.createEdge('FRIENDS_WITH', alice.id, bob.id);
            const edge2 = db.createEdge('FRIENDS_WITH', bob.id, charlie.id);
            const edge3 = db.createEdge('KNOWS', alice.id, charlie.id);

            expect(edge1.id).toBe('e0');
            expect(edge2.id).toBe('e1');
            expect(edge3.id).toBe('e2');
        });

        it('should throw error when creating edge with non-existent source node', () => {
            const bob = db.createNode(['Person'], { name: 'Bob' });

            expect(() => {
                db.createEdge('FRIENDS_WITH', 'nonexistent', bob.id);
            }).toThrow('Source node nonexistent does not exist');
        });

        it('should throw error when creating edge with non-existent target node', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });

            expect(() => {
                db.createEdge('FRIENDS_WITH', alice.id, 'nonexistent');
            }).toThrow('Target node nonexistent does not exist');
        });

        it('should get edge by id', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const created = db.createEdge('FRIENDS_WITH', alice.id, bob.id);

            const retrieved = db.getEdge(created.id);

            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe(created.id);
        });

        it('should return undefined for non-existent edge', () => {
            const edge = db.getEdge('nonexistent');

            expect(edge).toBeUndefined();
        });

        it('should get all edges', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);
            db.createEdge('FRIENDS_WITH', bob.id, charlie.id);
            db.createEdge('KNOWS', alice.id, charlie.id);

            const edges = db.getAllEdges();

            expect(edges).toHaveLength(3);
        });

        it('should delete an edge', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const edge = db.createEdge('FRIENDS_WITH', alice.id, bob.id);

            const deleted = db.deleteEdge(edge.id);

            expect(deleted).toBe(true);
            expect(db.getEdge(edge.id)).toBeUndefined();
            expect(db.getAllEdges()).toHaveLength(0);
        });

        it('should return false when deleting non-existent edge', () => {
            const deleted = db.deleteEdge('nonexistent');

            expect(deleted).toBe(false);
        });

        it('should get edges from a node', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);
            db.createEdge('KNOWS', alice.id, charlie.id);
            db.createEdge('FRIENDS_WITH', bob.id, charlie.id);

            const edges = db.getEdgesFrom(alice.id);

            expect(edges).toHaveLength(2);
            expect(edges.every((e: Edge) => e.from === alice.id)).toBe(true);
        });

        it('should get edges to a node', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, charlie.id);
            db.createEdge('KNOWS', bob.id, charlie.id);

            const edges = db.getEdgesTo(charlie.id);

            expect(edges).toHaveLength(2);
            expect(edges.every((e: Edge) => e.to === charlie.id)).toBe(true);
        });

        it('should get all edges for a node', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);
            db.createEdge('KNOWS', charlie.id, bob.id);
            db.createEdge('FRIENDS_WITH', bob.id, charlie.id);

            const edges = db.getEdgesForNode(bob.id);

            expect(edges).toHaveLength(3);
        });
    });

    describe('Query Operations', () => {
        it('should find nodes by label', () => {
            db.createNode(['Person'], { name: 'Alice' });
            db.createNode(['Person'], { name: 'Bob' });
            db.createNode(['Product'], { name: 'Mouse' });

            const result = db.findNodesByLabel('Person');

            expect(result.nodeCount).toBe(2);
            expect(result.nodes.every((n: Node) => n.hasLabel('Person'))).toBe(true);
        });

        it('should return empty result when no nodes match label', () => {
            db.createNode(['Person'], { name: 'Alice' });

            const result = db.findNodesByLabel('NonExistent');

            expect(result.isEmpty()).toBe(true);
        });

        it('should find nodes by property', () => {
            db.createNode(['Person'], { name: 'Alice', age: 30 });
            db.createNode(['Person'], { name: 'Bob', age: 25 });
            db.createNode(['Person'], { name: 'Charlie', age: 30 });

            const result = db.findNodesByProperty('age', 30);

            expect(result.nodeCount).toBe(2);
        });

        it('should find edges by type', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);
            db.createEdge('KNOWS', bob.id, charlie.id);
            db.createEdge('FRIENDS_WITH', alice.id, charlie.id);

            const result = db.findEdgesByType('FRIENDS_WITH');

            expect(result.edgeCount).toBe(2);
        });

        it('should get neighbors of a node', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);
            db.createEdge('KNOWS', alice.id, charlie.id);

            const result = db.getNeighbors(alice.id);

            expect(result.nodeCount).toBe(2);
            expect(result.edgeCount).toBe(2);
        });

        it('should follow edges of specific type', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);
            db.createEdge('KNOWS', alice.id, charlie.id);

            const result = db.followEdgeType(alice.id, 'FRIENDS_WITH');

            expect(result.nodeCount).toBe(1);
            const [firstNode] = result.nodes;
            expect(firstNode?.properties.name).toBe('Bob');
        });

        it('should check if nodes are connected', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            const charlie = db.createNode(['Person'], { name: 'Charlie' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);

            expect(db.areConnected(alice.id, bob.id)).toBe(true);
            expect(db.areConnected(bob.id, alice.id)).toBe(false);
            expect(db.areConnected(alice.id, charlie.id)).toBe(false);
        });

        it('should check if nodes are connected with specific edge type', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });

            db.createEdge('FRIENDS_WITH', alice.id, bob.id);

            expect(db.areConnected(alice.id, bob.id, 'FRIENDS_WITH')).toBe(true);
            expect(db.areConnected(alice.id, bob.id, 'KNOWS')).toBe(false);
        });
    });

    describe('Clear Operation', () => {
        it('should clear all nodes and edges', () => {
            const alice = db.createNode(['Person'], { name: 'Alice' });
            const bob = db.createNode(['Person'], { name: 'Bob' });
            db.createEdge('FRIENDS_WITH', alice.id, bob.id);

            db.clear();

            expect(db.getAllNodes()).toHaveLength(0);
            expect(db.getAllEdges()).toHaveLength(0);
        });

        it('should reset counters after clear', () => {
            db.createNode(['Person'], { name: 'Alice' });
            db.createNode(['Person'], { name: 'Bob' });

            db.clear();

            const node = db.createNode(['Person'], { name: 'Charlie' });
            expect(node.id).toBe('n0');
        });
    });
});