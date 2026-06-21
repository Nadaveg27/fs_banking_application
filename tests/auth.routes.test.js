const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');

jest.mock('../src/assistant/graph', () => ({
  runGraph: jest.fn(),
}));

jest.mock('../src/email/email.service', () => ({
  sendVerificationEmail: jest.fn(),
  sendAlreadyRegisteredEmail: jest.fn(),
}));
const { sendVerificationEmail, sendAlreadyRegisteredEmail } = require('../src/email/email.service');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-for-route-tests';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});

describe('POST /api/auth/register — email enumeration protection', () => {
  it('returns the SAME response shape whether the email is new or already registered', async () => {
    const payload = { name: 'Test', email: 'existing@example.com', password: 'pw12345', phone: '0500000000' };

    const firstResponse = await request(app).post('/api/auth/register').send(payload);
    const secondResponse = await request(app).post('/api/auth/register').send(payload);

    expect(firstResponse.status).toBe(secondResponse.status);
    expect(firstResponse.body).toEqual(secondResponse.body);

    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(sendAlreadyRegisteredEmail).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the auth cookie and returns a success message', async () => {
    const response = await request(app).post('/api/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Logged out successfully' });

    const setCookieHeader = response.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader[0]).toMatch(/token=;/);
  });
});