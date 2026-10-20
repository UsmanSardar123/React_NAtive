const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../models/User');
const { validateUserInput } = require('../validation/userInput');

test('accepts required fields, normalizes email, and preserves optional omissions', () => {
  const result = validateUserInput({ fullName: ' Ada Lovelace ', email: ' ADA@EXAMPLE.COM ' });

  assert.deepEqual(result, { value: { fullName: 'Ada Lovelace', email: 'ada@example.com' } });
});

test('validates optional fields, age limits, status, role, and field lengths', () => {
  assert.equal(validateUserInput({ fullName: 'Ada', email: 'ada@example.com', age: 37 }).error, undefined);
  assert.match(validateUserInput({ fullName: 'Ada', email: 'ada@example.com', age: 0 }).error, /age/);
  assert.match(validateUserInput({ fullName: 'Ada', email: 'ada@example.com', age: 37.5 }).error, /age/);
  assert.match(validateUserInput({ fullName: 'Ada', email: 'ada@example.com', status: 'Unknown' }).error, /status/);
  assert.match(validateUserInput({ fullName: 'Ada', email: 'ada@example.com', role: 'Owner' }).error, /role/);
  assert.match(validateUserInput({ fullName: 'A'.repeat(101), email: 'ada@example.com' }).error, /fullName/);
});

test('requires a valid email and both required fields', () => {
  assert.match(validateUserInput({ email: 'ada@example.com' }).error, /fullName/);
  assert.match(validateUserInput({ fullName: 'Ada', email: 'not-an-email' }).error, /valid email/);
});

test('validates image URLs and rejects unsupported fields', () => {
  assert.match(validateUserInput({ fullName: 'Ada', email: 'ada@example.com', profileImageUrl: 'ftp://example.com/avatar.png' }).error, /HTTP or HTTPS/);
  assert.match(validateUserInput({ fullName: 'Ada', email: 'ada@example.com', password: 'secret' }).error, /Unknown user field/);
});

test('accepts partial updates without requiring or overwriting omitted fields', () => {
  const result = validateUserInput({ city: 'London' }, { partial: true });

  assert.deepEqual(result, { value: { city: 'London' } });
  assert.match(validateUserInput({}, { partial: true }).error, /at least one/);
  assert.deepEqual(validateUserInput({ age: null }, { partial: true }), { value: { age: null } });
});

test('defines backend timestamps, default enums, and a unique email index', async () => {
  const user = new User({ fullName: 'Ada', email: 'ADA@example.com' });

  assert.equal(User.schema.options.timestamps, true);
  assert.equal(user.status, 'Active');
  assert.equal(user.role, 'User');
  assert.equal(user.email, 'ada@example.com');
  user.age = null;
  await assert.doesNotReject(() => user.validate());
  assert.equal(User.schema.indexes().some(([keys, options]) => keys.email === 1 && options.unique), true);
  assert.equal(mongoose.isValidObjectId('507f1f77bcf86cd799439011'), true);
});
