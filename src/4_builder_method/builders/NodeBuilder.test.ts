import { describe, it, expect, beforeEach } from 'vitest';
import { NodeBuilder } from './NodeBuilder.js';
import { Node } from '../models/index.js';

describe('NodeBuilder', () => {
    let builder: NodeBuilder;

    beforeEach(() => {
        builder = new NodeBuilder();
    });

    describe('withId', () => {
        it('should set the node id', () => {
            const node = builder
                .withId('user_001')
                .build();

            expect(node.id).toBe('user_001');
        });

        it('should return this for chaining', () => {
            const result = builder.withId('user_001');
            expect(result).toBe(builder);
        });
    });

    describe('addLabel', () => {
        it('should add a single label', () => {
            const node = builder
                .withId('user_001')
                .addLabel('Person')
                .build();

            expect(node.labels).toContain('Person');
        });

        it('should not add duplicate labels', () => {
            const node = builder
                .withId('user_001')
                .addLabel('Person')
                .addLabel('Person')
                .build();

            expect(node.labels).toEqual(['Person']);
        });

        it('should return this for chaining', () => {
            const result = builder.addLabel('Person');
            expect(result).toBe(builder);
        });
    });

    describe('addLabels', () => {
        it('should add multiple labels at once', () => {
            const node = builder
                .withId('user_001')
                .addLabels('Person', 'Employee', 'Manager')
                .build();

            expect(node.labels).toEqual(['Person', 'Employee', 'Manager']);
        });

        it('should not add duplicate labels', () => {
            const node = builder
                .withId('user_001')
                .addLabels('Person', 'Person', 'Employee')
                .build();

            expect(node.labels).toEqual(['Person', 'Employee']);
        });

        it('should return this for chaining', () => {
            const result = builder.addLabels('Person', 'Employee');
            expect(result).toBe(builder);
        });
    });

    describe('withLabels', () => {
        it('should set all labels replacing existing ones', () => {
            const node = builder
                .withId('user_001')
                .addLabel('OldLabel')
                .withLabels(['Person', 'Employee'])
                .build();

            expect(node.labels).toEqual(['Person', 'Employee']);
            expect(node.labels).not.toContain('OldLabel');
        });

        it('should return this for chaining', () => {
            const result = builder.withLabels(['Person']);
            expect(result).toBe(builder);
        });
    });

    describe('addProperty', () => {
        it('should add a single property', () => {
            const node = builder
                .withId('user_001')
                .addProperty('name', 'Sarah')
                .build();

            expect(node.getProperty('name')).toBe('Sarah');
        });

        it('should add multiple properties via chaining', () => {
            const node = builder
                .withId('user_001')
                .addProperty('name', 'Sarah')
                .addProperty('age', 28)
                .addProperty('email', 'sarah@example.com')
                .build();

            expect(node.getProperty('name')).toBe('Sarah');
            expect(node.getProperty('age')).toBe(28);
            expect(node.getProperty('email')).toBe('sarah@example.com');
        });

        it('should overwrite existing property with same key', () => {
            const node = builder
                .withId('user_001')
                .addProperty('name', 'Sarah')
                .addProperty('name', 'John')
                .build();

            expect(node.getProperty('name')).toBe('John');
        });

        it('should return this for chaining', () => {
            const result = builder.addProperty('name', 'Sarah');
            expect(result).toBe(builder);
        });
    });

    describe('addProperties', () => {
        it('should add multiple properties at once', () => {
            const node = builder
                .withId('user_001')
                .addProperties({
                    name: 'Sarah',
                    age: 28,
                    email: 'sarah@example.com'
                })
                .build();

            expect(node.getProperty('name')).toBe('Sarah');
            expect(node.getProperty('age')).toBe(28);
            expect(node.getProperty('email')).toBe('sarah@example.com');
        });

        it('should merge with existing properties', () => {
            const node = builder
                .withId('user_001')
                .addProperty('name', 'Sarah')
                .addProperties({ age: 28, city: 'NYC' })
                .build();

            expect(node.getProperty('name')).toBe('Sarah');
            expect(node.getProperty('age')).toBe(28);
            expect(node.getProperty('city')).toBe('NYC');
        });

        it('should return this for chaining', () => {
            const result = builder.addProperties({ name: 'Sarah' });
            expect(result).toBe(builder);
        });
    });

    describe('withProperties', () => {
        it('should replace all existing properties', () => {
            const node = builder
                .withId('user_001')
                .addProperty('oldProp', 'old')
                .withProperties({
                    name: 'Sarah',
                    age: 28
                })
                .build();

            expect(node.getProperty('name')).toBe('Sarah');
            expect(node.getProperty('age')).toBe(28);
            expect(node.hasProperty('oldProp')).toBe(false);
        });

        it('should return this for chaining', () => {
            const result = builder.withProperties({ name: 'Sarah' });
            expect(result).toBe(builder);
        });
    });

    describe('build', () => {
        it('should create a valid node with all properties', () => {
            const node = builder
                .withId('user_001')
                .addLabels('Person', 'Employee')
                .addProperties({
                    name: 'Sarah',
                    age: 28
                })
                .build();

            expect(node).toBeInstanceOf(Node);
            expect(node.id).toBe('user_001');
            expect(node.labels).toEqual(['Person', 'Employee']);
            expect(node.getProperty('name')).toBe('Sarah');
            expect(node.getProperty('age')).toBe(28);
        });

        it('should throw error when id is missing', () => {
            expect(() => {
                builder.build();
            }).toThrow('Node ID is required');
        });

        it('should create node with empty labels and properties', () => {
            const node = builder
                .withId('user_001')
                .build();

            expect(node.id).toBe('user_001');
            expect(node.labels).toEqual([]);
            expect(Object.keys(node.properties)).toHaveLength(0);
        });
    });

    describe('reset', () => {
        it('should clear all builder state', () => {
            builder
                .withId('user_001')
                .addLabel('Person')
                .addProperty('name', 'Sarah');

            builder.reset();

            expect(() => builder.build()).toThrow('Node ID is required');
        });

        it('should allow building new node after reset', () => {
            const node1 = builder
                .withId('user_001')
                .addLabel('Person')
                .build();

            const node2 = builder.reset()
                .withId('user_002')
                .addLabel('Company')
                .build();

            expect(node1.id).toBe('user_001');
            expect(node1.labels).toEqual(['Person']);
            expect(node2.id).toBe('user_002');
            expect(node2.labels).toEqual(['Company']);
        });

        it('should return this for chaining', () => {
            const result = builder.reset();
            expect(result).toBe(builder);
        });
    });

    describe('fromNode', () => {
        it('should create builder from existing node', () => {
            const original = new Node('user_001', ['Person'], { name: 'Sarah', age: 28 });
            const newBuilder = NodeBuilder.fromNode(original);
            const clone = newBuilder.build();

            expect(clone.id).toBe(original.id);
            expect(clone.labels).toEqual(original.labels);
            expect(clone.getProperty('name')).toBe(original.getProperty('name'));
            expect(clone.getProperty('age')).toBe(original.getProperty('age'));
        });

        it('should create independent copy', () => {
            const original = new Node('user_001', ['Person'], { name: 'Sarah' });
            const modified = NodeBuilder.fromNode(original)
                .addLabel('Employee')
                .addProperty('age', 28)
                .build();

            expect(original.labels).toEqual(['Person']);
            expect(original.hasProperty('age')).toBe(false);
            expect(modified.labels).toEqual(['Person', 'Employee']);
            expect(modified.getProperty('age')).toBe(28);
        });
    });

    describe('fluent interface', () => {
        it('should support complex chaining', () => {
            const node = builder
                .withId('user_001')
                .addLabel('Person')
                .addLabel('Employee')
                .addProperty('name', 'Sarah')
                .addProperty('age', 28)
                .addProperties({ email: 'sarah@example.com', city: 'NYC' })
                .addLabel('Manager')
                .build();

            expect(node.id).toBe('user_001');
            expect(node.labels).toEqual(['Person', 'Employee', 'Manager']);
            expect(node.getProperty('name')).toBe('Sarah');
            expect(node.getProperty('age')).toBe(28);
            expect(node.getProperty('email')).toBe('sarah@example.com');
            expect(node.getProperty('city')).toBe('NYC');
        });
    });
});