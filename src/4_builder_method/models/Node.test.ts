import { describe, it, expect } from 'vitest';
import { Node } from './Node.js';

describe('Node', () => {
    it('should create a node with id, labels, and properties', () => {
        const node = new Node('n1', ['Person'], { name: 'Alice', age: 30 });

        expect(node.id).toBe('n1');
        expect(node.labels).toEqual(['Person']);
        expect(node.properties).toEqual({ name: 'Alice', age: 30 });
    });

    it('should check if node has a label', () => {
        const node = new Node('n1', ['Person', 'Employee'], {});

        expect(node.hasLabel('Person')).toBe(true);
        expect(node.hasLabel('Employee')).toBe(true);
        expect(node.hasLabel('Admin')).toBe(false);
    });

    it('should get property value', () => {
        const node = new Node('n1', ['Person'], { name: 'Alice', age: 30 });

        expect(node.getProperty('name')).toBe('Alice');
        expect(node.getProperty('age')).toBe(30);
        expect(node.getProperty('nonexistent')).toBeUndefined();
    });

    it('should set property value', () => {
        const node = new Node('n1', ['Person'], { name: 'Alice' });

        node.setProperty('age', 30);
        expect(node.getProperty('age')).toBe(30);

        node.setProperty('name', 'Bob');
        expect(node.getProperty('name')).toBe('Bob');
    });

    it('should check if property exists', () => {
        const node = new Node('n1', ['Person'], { name: 'Alice', age: 30 });

        expect(node.hasProperty('name')).toBe(true);
        expect(node.hasProperty('age')).toBe(true);
        expect(node.hasProperty('email')).toBe(false);
    });

    it('should add a label', () => {
        const node = new Node('n1', ['Person'], {});

        node.addLabel('Employee');
        expect(node.labels).toEqual(['Person', 'Employee']);

        node.addLabel('Person');
        expect(node.labels).toEqual(['Person', 'Employee']);
    });

    it('should remove a label', () => {
        const node = new Node('n1', ['Person', 'Employee'], {});

        node.removeLabel('Employee');
        expect(node.labels).toEqual(['Person']);

        node.removeLabel('NonExistent');
        expect(node.labels).toEqual(['Person']);
    });

    it('should convert to string', () => {
        const node = new Node('n1', ['Person'], { name: 'Alice' });
        const str = node.toString();

        expect(str).toContain('n1');
        expect(str).toContain('Person');
        expect(str).toContain('Alice');
    });

    it('should clone a node', () => {
        const node = new Node('n1', ['Person'], { name: 'Alice', age: 30 });
        const cloned = node.clone();

        expect(cloned.id).toBe(node.id);
        expect(cloned.labels).toEqual(node.labels);
        expect(cloned.properties).toEqual(node.properties);
        expect(cloned).not.toBe(node);
        expect(cloned.labels).not.toBe(node.labels);
        expect(cloned.properties).not.toBe(node.properties);
    });
});