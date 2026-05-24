import test from 'node:test';
import assert from 'node:assert';
import { sanitizePayload } from './sanitizer.js';

test('Optimization A: Array Hydration Gaps', async (t) => {
  await t.test('should filter out empty elements by default', () => {
    const input = ["valid", null, "", undefined, "another"];
    const result = sanitizePayload(input);
    assert.deepStrictEqual(result, ["valid", "another"]);
  });

  await t.test('should preserve empty elements as null to align indices when preserveArrayNulls is true', () => {
    const input = ["valid", null, "", undefined, "another"];
    const result = sanitizePayload(input, { preserveArrayNulls: true });
    assert.deepStrictEqual(result, ["valid", null, null, null, "another"]);
  });

  await t.test('should recursively sanitize items inside preserved arrays', () => {
    const input = [
      { name: "John", age: null, bio: "" },
      null,
      { name: "Jane", age: 30 }
    ];
    const result = sanitizePayload(input, { preserveArrayNulls: true });
    assert.deepStrictEqual(result, [
      { name: "John" },
      null,
      { name: "Jane", age: 30 }
    ]);
  });
});

test('Optimization B: True Recursive Flattening', async (t) => {
  await t.test('should flatten nested objects recursively when flatten is true', () => {
    const input = {
      user: {
        meta: {
          location: "Toronto",
          age: null
        },
        profile: {
          name: {
            first: "John",
            last: "Doe"
          }
        }
      },
      id: 123
    };
    const result = sanitizePayload(input, { flatten: true });
    assert.deepStrictEqual(result, {
      user_meta_location: "Toronto",
      user_profile_name_first: "John",
      user_profile_name_last: "Doe",
      id: 123
    });
  });

  await t.test('should keep arrays intact but sanitize their items when flattening is true', () => {
    const input = {
      user: {
        tags: ["admin", "", null, "staff"]
      }
    };
    const result = sanitizePayload(input, { flatten: true });
    assert.deepStrictEqual(result, {
      user_tags: ["admin", "staff"]
    });
  });
});

test('Optimization C: Hardening Object Validations', async (t) => {
  await t.test('should not treat Date and RegExp as plain objects to sanitize', () => {
    const date = new Date('2026-05-24T12:00:00.000Z');
    const regex = /abc/gi;
    const input = {
      timestamp: date,
      pattern: regex,
      plain: { key: "value" }
    };
    const result = sanitizePayload(input);
    assert.ok(result.timestamp instanceof Date);
    assert.strictEqual(result.timestamp.getTime(), date.getTime());
    assert.ok(result.pattern instanceof RegExp);
    assert.strictEqual(result.plain.key, "value");
  });
});
