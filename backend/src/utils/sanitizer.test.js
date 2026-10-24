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
test('New Feature: Exclude Keys from Sanitization', async (t) => {
  await t.test('should exclude specified keys from sanitization', () => {
    const input = {
      id: 1,
      name: "Test",
      description: "",
      details: {
        version: null,
        status: "active"
      },
      secret: "keep_this_value"
    };
    const result = sanitizePayload(input, { excludeKeys: ["secret"] });
    assert.deepStrictEqual(result, {
      id: 1,
      name: "Test",
      details: {
        status: "active"
      },
      secret: "keep_this_value"
    });
  });

  await t.test('should exclude specified keys from sanitization even if nested', () => {
    const input = {
      user: {
        id: 123,
        name: "John Doe",
        email: "",
        settings: {
          theme: "dark",
          notifications: null,
          apiKey: "super_secret_key"
        }
      }
    };
    const result = sanitizePayload(input, { excludeKeys: ["apiKey"] });
    assert.deepStrictEqual(result, {
      user: {
        id: 123,
        name: "John Doe",
        settings: {
          theme: "dark",
          apiKey: "super_secret_key"
        }
      }
    });
  });

  await t.test('should work with flattening and excluded keys', () => {
    const input = {
      user: {
        id: 123,
        name: "John Doe",
        email: "",
        settings: {
          theme: "dark",
          notifications: null,
          apiKey: "super_secret_key"
        }
      },
      system: {
        version: "1.0",
        debugInfo: null
      }
    };
    const result = sanitizePayload(input, { flatten: true, excludeKeys: ["apiKey"] });
    assert.deepStrictEqual(result, {
      user_id: 123,
      user_name: "John Doe",
      user_settings_theme: "dark",
      user_settings_apiKey: "super_secret_key",
      system_version: "1.0"
    });
  });

  await t.test('should handle multiple excluded keys', () => {
    const input = {
      a: 1,
      b: null,
      c: "",
      d: "value",
      e: {
        f: null,
        g: "nested_value",
        h: ""
      },
      i: "protected_i",
      j: "protected_j"
    };
    const result = sanitizePayload(input, { excludeKeys: ["i", "j", "h"] });
    assert.deepStrictEqual(result, {
      a: 1,
      d: "value",
      e: {
        g: "nested_value",
        h: ""
      },
      i: "protected_i",
      j: "protected_j"
    });
  });
});
