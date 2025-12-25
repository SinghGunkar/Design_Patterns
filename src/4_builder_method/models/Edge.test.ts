import { describe, it, expect } from 'vitest';
import { Edge } from './Edge.js';

describe('Edge', () => {
    it('should create an edge with id, type, from, to, and properties', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2', { since: 2020 });

        expect(edge.id).toBe('e1');
        expect(edge.type).toBe('FRIENDS_WITH');
        expect(edge.from).toBe('n1');
        expect(edge.to).toBe('n2');
        expect(edge.properties).toEqual({ since: 2020 });
    });

    it('should create an edge with empty properties', () => {
        const edge = new Edge('e1', 'KNOWS', 'n1', 'n2');

        expect(edge.properties).toEqual({});
    });

    it('should get property value', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2', { since: 2020, strength: 0.8 });

        expect(edge.getProperty('since')).toBe(2020);
        expect(edge.getProperty('strength')).toBe(0.8);
        expect(edge.getProperty('nonexistent')).toBeUndefined();
    });

    it('should set property value', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2');

        edge.setProperty('since', 2020);
        expect(edge.getProperty('since')).toBe(2020);

        edge.setProperty('strength', 0.9);
        expect(edge.getProperty('strength')).toBe(0.9);
    });

    it('should check if property exists', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2', { since: 2020 });

        expect(edge.hasProperty('since')).toBe(true);
        expect(edge.hasProperty('strength')).toBe(false);
    });

    it('should check if edge connects two nodes', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2');

        expect(edge.connects('n1', 'n2')).toBe(true);
        expect(edge.connects('n2', 'n1')).toBe(false);
        expect(edge.connects('n1', 'n3')).toBe(false);
    });

    it('should check if edge involves a node', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2');

        expect(edge.involvesNode('n1')).toBe(true);
        expect(edge.involvesNode('n2')).toBe(true);
        expect(edge.involvesNode('n3')).toBe(false);
    });

    it('should get other node', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2');

        expect(edge.getOtherNode('n1')).toBe('n2');
        expect(edge.getOtherNode('n2')).toBe('n1');
        expect(edge.getOtherNode('n3')).toBeNull();
    });

    it('should reverse edge direction', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2', { since: 2020 });
        const reversed = edge.reverse();

        expect(reversed.id).toBe('e1_reversed');
        expect(reversed.type).toBe('FRIENDS_WITH');
        expect(reversed.from).toBe('n2');
        expect(reversed.to).toBe('n1');
        expect(reversed.properties).toEqual({ since: 2020 });
    });

    it('should convert to string', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2', { since: 2020 });
        const str = edge.toString();

        expect(str).toBe('Edge(e1, n1-[FRIENDS_WITH]->n2, {"since":2020})');
    });

    it('should convert to string with empty properties', () => {
        const edge = new Edge('e1', 'KNOWS', 'n1', 'n2');
        const str = edge.toString();

        expect(str).toBe('Edge(e1, n1-[KNOWS]->n2, {})');
    });

    it('should clone an edge', () => {
        const edge = new Edge('e1', 'FRIENDS_WITH', 'n1', 'n2', { since: 2020 });
        const cloned = edge.clone();

        expect(cloned.id).toBe(edge.id);
        expect(cloned.type).toBe(edge.type);
        expect(cloned.from).toBe(edge.from);
        expect(cloned.to).toBe(edge.to);
        expect(cloned.properties).toEqual(edge.properties);
        expect(cloned).not.toBe(edge);
        expect(cloned.properties).not.toBe(edge.properties);
    });
});