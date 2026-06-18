const mongoose = require('mongoose'); // for database connection lifecycle
const { MongoMemoryServer } = require('mongodb-memory-server'); // for a real, tmp, in-RAM MongoDB instance
const User = require('../src/models/user.model');
const Transaction = require('../src/models/transaction.model');
const { transferMoney } = require('../src/transactions/transactions.service');

const mockSocket = { //  make getIo() always return the same (fake) object every time it's called
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

jest.mock('../src/socket', () => ({
  getIo: jest.fn(() => mockSocket),
}));
const { getIo } = require('../src/socket'); // grabs the mocked getIo, for use in assertions below

let mongoServer;

beforeAll(async () => { // jest hook for "run this once, before any test in this file starts"
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri()); // .getUri() gives a string-like value pointing at the running instance (mongoServer)
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  mockSocket.to.mockClear();
  mockSocket.emit.mockClear();
});

async function createUser(overrides = {}) {
  return User.create({
    name: 'Test User',
    email: overrides.email || 'sender@example.com',
    passwordHash: 'irrelevant-for-this-test',
    phone: '0500000000',
    balance: overrides.balance ?? 500,
    isVerified: true,
    ...overrides,
  });
}

describe('transferMoney', () => {
  it('rejects self-transfer, leaving balance unchanged', async () => {
    const sender = await createUser({ email: 'emailfortest@something.com', balance: 500 });

    await expect(
      transferMoney({ senderId: sender._id, recipientEmail: 'emailfortest@something.com', amount: 100 })
    ).rejects.toMatchObject({ code: 'SELF_TRANSFER' }); // .rejects: "I'm asserting this Promise will end in rejection (an error), not success"

    const unchanged = await User.findById(sender._id);
    expect(unchanged.balance).toBe(500);
  });

  it('rejects transfer to a nonexistent recipient', async () => {
  const sender = await createUser({ email: 'sender@example.com', balance: 500 });

  await expect(
    transferMoney({ senderId: sender._id, recipientEmail: 'ghost@example.com', amount: 100 })
  ).rejects.toMatchObject({ code: 'RECIPIENT_NOT_FOUND' });

  const unchanged = await User.findById(sender._id);
  expect(unchanged.balance).toBe(500);
});

  it('rejects transfer exceeding balance, leaving both balances and transaction count unchanged', async () => {
    // Highest-value "sane state after rejection" test — insufficient balance
    // is the LAST check before any write, so this is most likely to catch a
    // future bug where someone reorders the validation chain.
    const sender = await createUser({ email: 'sender@example.com', balance: 50 });
    const recipient = await createUser({ email: 'recipient@example.com', balance: 200 });

    await expect(
      transferMoney({ senderId: sender._id, recipientEmail: 'recipient@example.com', amount: 100 })
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE' });

    const senderAfter = await User.findById(sender._id);
    const recipientAfter = await User.findById(recipient._id);
    expect(senderAfter.balance).toBe(50);
    expect(recipientAfter.balance).toBe(200);
    expect(await Transaction.countDocuments({})).toBe(0);
  });

  it('on success: creates two transaction records with correct sign and perspectiveUserId, updates both balances', async () => {
    // Regression test for the dual-record bug mentioned in the project notes
    // (old single-record design let both users see both records). We assert
    // the FULL shape per record, not just "two records exist."
    const sender = await createUser({ email: 'sender@example.com', balance: 500 });
    const recipient = await createUser({ email: 'recipient@example.com', balance: 200 });

    const result = await transferMoney({
      senderId: sender._id,
      recipientEmail: 'recipient@example.com',
      amount: 150,
      reason: 'Rent',
    });

    expect(result.newBalance).toBe(350); // 500 - 150

    const senderAfter = await User.findById(sender._id);
    const recipientAfter = await User.findById(recipient._id);
    expect(senderAfter.balance).toBe(350);
    expect(recipientAfter.balance).toBe(350); // 200 + 150

    const senderTx = await Transaction.findOne({ perspectiveUserId: sender._id });
    const recipientTx = await Transaction.findOne({ perspectiveUserId: recipient._id });

    expect(senderTx.amount).toBe(-150);
    expect(senderTx.counterpartyEmail).toBe('recipient@example.com');
    expect(recipientTx.amount).toBe(150);
    expect(recipientTx.counterpartyEmail).toBe('sender@example.com');

    expect(await Transaction.countDocuments({})).toBe(2);
  });

  it('emits transfer_received to the recipient room on success', async () => {
    // Strict MOCK assertion (not a stub) — we care that .to/.emit were
    // CALLED with the right arguments, not about any return value.
    const sender = await createUser({ email: 'sender@example.com', balance: 500 });
    const recipient = await createUser({ email: 'recipient@example.com', balance: 200 });

    await transferMoney({ senderId: sender._id, recipientEmail: 'recipient@example.com', amount: 75 });

    const ioInstance = getIo();
    expect(ioInstance.to).toHaveBeenCalledWith(recipient._id.toString());
    expect(ioInstance.emit).toHaveBeenCalledWith(
      'transfer_received',
      expect.objectContaining({ from: 'sender@example.com', amount: 75 })
    );
  });
});