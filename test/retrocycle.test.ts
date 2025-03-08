import { describe, test, expect } from 'vitest';
import retrocycle from '../src/retrocycle';

describe("retrocycle", () => {
	test("should resolve when no references", () => {
		let obj = retrocycle({ a: 1, b: { x: 2, y: [] } });
		expect(obj.a).toEqual(1);
		expect(obj.b.x).toEqual(2);
		expect(obj.b.y.length).toEqual(0);
	});

	test("should resolve object with cyclic references", () => {
		let obj = retrocycle({ $id: '1', prop: { $id: '2', subprop: { $ref: '1' } } });
		expect(obj.prop).toBeDefined();
		expect(obj.prop.subprop).toBe(obj);
	});

	test("should resolve $values array with cyclic references", () => {
		let obj = retrocycle({ $id: '1', main: { $id: '2', $values: [{ $ref: '2' }] } });
		expect(obj.main).toBeDefined();
		expect(obj.main.length).toEqual(1);
	});

	test("should resolve array and $values array with cyclic references", () => {
		let obj = retrocycle({ $id: '1', main: { $id: '2', $values: [{ $ref: '2' }] }, arr: [null, {}, { $ref: '1' }] });
		expect(obj.main).toBeDefined();
		expect(obj.main.length).toEqual(1);
		expect(obj.arr.length).toEqual(3);
		expect(obj.arr[0]).toBeNull();
		expect(obj.arr[1]).toBeDefined();
		expect(obj.arr[2]).toBeDefined();
	});
});
