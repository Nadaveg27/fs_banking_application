const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user.model');
const { registerUser, verifyAccount, loginUser } = require('../src/auth/auth.service');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-for-auth-tests';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('registerUser', () => {
  it('rejects an invalid email format', async () => {
    await expect(
      registerUser({ name: 'Test', email: 'not-an-email', password: 'pw12345', phone: '0500000000' })
    ).rejects.toThrow('Invalid email format');
  });

  it('rejects an invalid phone format', async () => {
    await expect(
      registerUser({ name: 'Test', email: 'valid@example.com', password: 'pw12345', phone: '123' })
    ).rejects.toThrow('Invalid phone format: must be 7–15 digits');
  });

  it('rejects a duplicate email with code DUPLICATE_EMAIL, without creating a second user', async () => {
    await registerUser({ name: 'First', email: 'taken@example.com', password: 'pw12345', phone: '0500000001' });

    await expect(
      registerUser({ name: 'Second', email: 'taken@example.com', password: 'pw12345', phone: '0500000002' })
    ).rejects.toMatchObject({ code: 'DUPLICATE_EMAIL' });

    const count = await User.countDocuments({ email: 'taken@example.com' });
    expect(count).toBe(1);
  });

  it('on success: creates an unverified user with a hashed password and a signed verification token', async () => {
    const token = await registerUser({
      name: 'New User', email: 'newbie@example.com', password: 'pw12345', phone: '0500000003',
    });

    expect(typeof token).toBe('string');

    const saved = await User.findOne({ email: 'newbie@example.com' });
    expect(saved.isVerified).toBe(false);
    expect(saved.passwordHash).not.toBe('pw12345');
    expect(saved.verificationToken).toBe(token);
  });
});

describe('verifyAccount', () => {
  it('rejects a malformed/missing token', async () => {
    await expect(verifyAccount({ token: null })).rejects.toMatchObject({ code: 'INVALID_TOKEN' });
  });

  it('rejects an expired token', async () => {
    const expiredToken = jwt.sign({ email: 'x@example.com' }, process.env.JWT_SECRET, { expiresIn: '-1h' });

    await expect(verifyAccount({ token: expiredToken })).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
  });

  it('rejects a validly-signed token with no matching user (already used / unknown)', async () => {
    const orphanToken = jwt.sign({ email: 'nobody@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await expect(verifyAccount({ token: orphanToken })).rejects.toMatchObject({ code: 'TOKEN_NOT_FOUND' });
  });

  it('on success: marks the user verified and deletes the stored token (single-use)', async () => {
    const token = await registerUser({
      name: 'Verify Me', email: 'verifyme@example.com', password: 'pw12345', phone: '0500000004',
    });

    const result = await verifyAccount({ token });
    expect(result.user.email).toBe('verifyme@example.com');

    const updated = await User.findOne({ email: 'verifyme@example.com' });
    expect(updated.isVerified).toBe(true);
    expect(updated.verificationToken).toBeNull();

    await expect(verifyAccount({ token })).rejects.toMatchObject({ code: 'TOKEN_NOT_FOUND' });
  });
});

describe('loginUser', () => {
  it('rejects login for an unverified account, even with correct password', async () => {
    await registerUser({ name: 'Unverified', email: 'unverified@example.com', password: 'correct-pw', phone: '0500000005' });

    await expect(
      loginUser({ email: 'unverified@example.com', password: 'correct-pw' })
    ).rejects.toMatchObject({ code: 'NOT_VERIFIED' });
  });

  it('rejects an incorrect password for a verified account', async () => {
    const token = await registerUser({ name: 'Real User', email: 'real@example.com', password: 'correct-pw', phone: '0500000006' });
    await verifyAccount({ token });

    await expect(
      loginUser({ email: 'real@example.com', password: 'wrong-pw' })
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('rejects login for a nonexistent email with the SAME error code as wrong password', async () => {
    await expect(
      loginUser({ email: 'doesnotexist@example.com', password: 'whatever' })
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('on success: returns user info for a verified account with correct credentials', async () => {
    const token = await registerUser({ name: 'Success Case', email: 'success@example.com', password: 'correct-pw', phone: '0500000007' });
    await verifyAccount({ token });

    const result = await loginUser({ email: 'success@example.com', password: 'correct-pw' });
    expect(result.user.email).toBe('success@example.com');
    expect(result.userId).toBeDefined();
  });
});
