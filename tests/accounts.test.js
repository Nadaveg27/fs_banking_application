const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/user.model');
const Transaction = require('../src/models/transaction.model');
const { getAccountData } = require('../src/accounts/accounts.service');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
});

describe('getAccountData', () => {
  it('rejects a nonexistent userId with code USER_NOT_FOUND', async () => {
    // Regression test for the bug just fixed: confirms err.code is now
    // actually set, so the route's 404 branch will correctly trigger.
    const fakeId = new mongoose.Types.ObjectId(); // a syntactically valid ObjectId that matches no real user

    await expect(
      getAccountData({ userId: fakeId })
    ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });

  it('on success: returns balance and paginated transactions for the user', async () => {
    const user = await User.create({
      name: 'Test User', email: 'accountholder@example.com', passwordHash: 'irrelevant',
      phone: '0500000000', balance: 750, isVerified: true,
    });

    // Seed 3 transactions belonging to this user, to verify pagination math.
    await Transaction.insertMany([
      { perspectiveUserId: user._id, counterpartyEmail: 'a@example.com', amount: -50, date: new Date('2026-01-01') },
      { perspectiveUserId: user._id, counterpartyEmail: 'b@example.com', amount: 100, date: new Date('2026-01-02') },
      { perspectiveUserId: user._id, counterpartyEmail: 'c@example.com', amount: -25, date: new Date('2026-01-03') },
    ]);

    const result = await getAccountData({ userId: user._id, page: 1, limit: 2 });

    expect(result.balance).toBe(750);
    expect(result.transactions).toHaveLength(2); // limit: 2, so only 2 of the 3 come back
    expect(result.pagination).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
    // Most recent first (date: -1 sort) — confirms ordering, not just count.
    expect(result.transactions[0].counterpartyEmail).toBe('c@example.com');
  });

  it('caps limit at 50 even if a larger value is requested', async () => {
    // Tests the Math.min(limit, 50) guard directly — a boundary condition worth checking explicitly
    const user = await User.create({
      name: 'Test User', email: 'capuser@example.com', passwordHash: 'irrelevant',
      phone: '0500000000', balance: 100, isVerified: true,
    });

    const result = await getAccountData({ userId: user._id, page: 1, limit: 9999 });
    expect(result.pagination.limit).toBe(50);
  });
});