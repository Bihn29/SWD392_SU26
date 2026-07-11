const test = require('node:test');
const assert = require('node:assert/strict');
const { requirePermission, requireRole } = require('../src/middlewares/roleMiddleware');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

const runMiddleware = (middleware, req) => new Promise((resolve) => {
  const response = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; resolve({ statusCode: this.statusCode, body }); },
  };
  middleware(req, response, () => resolve({ next: true }));
});

test('Admin wildcard permission is accepted', async () => {
  const result = await runMiddleware(requirePermission('subjects:publish'), {
    user: { role: 'Admin' },
  });
  assert.deepEqual(result, { next: true });
});

test('permission middleware rejects missing permission', async () => {
  const result = await runMiddleware(requirePermission('subjects:publish'), {
    user: { role: 'Student' },
  });
  assert.equal(result.statusCode, 403);
});

test('database permissions are used when available', async () => {
  const result = await runMiddleware(requirePermission('subjects:publish'), {
    user: { role: 'Custom' },
    userPermissions: ['subjects:view'],
  });
  assert.equal(result.statusCode, 403);
});

test('role middleware rejects an unauthorised role', async () => {
  const result = await runMiddleware(requireRole('Admin'), {
    user: { role: 'Manager' },
  });
  assert.equal(result.statusCode, 403);
});

test('User.comparePassword supports bcrypt hashes', async () => {
  const user = new User({ name: 'Test', email: 'test@example.com', password: await bcrypt.hash('correct-password', 4) });
  assert.equal(await user.comparePassword('correct-password'), true);
  assert.equal(await user.comparePassword('wrong-password'), false);
});
