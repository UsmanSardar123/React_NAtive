import { createUser, deleteUser, getUsers, updateUser, type User } from './usersApi';

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: '192.168.18.63:8083' } },
}));

const user: User = {
  _id: '507f1f77bcf86cd799439011',
  fullName: 'Maya Chen',
  email: 'maya@example.com',
  status: 'Active',
  role: 'Manager',
  createdAt: '2026-10-20T00:00:00.000Z',
  updatedAt: '2026-10-20T00:00:00.000Z',
};

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

function response(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

describe('users API client', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('reads the user collection and supplies defaults for older records', async () => {
    const oldUser = { _id: user._id, fullName: 'Maya Chen', email: 'maya@example.com' };
    fetchMock.mockResolvedValue(response([oldUser]));

    await expect(getUsers()).resolves.toEqual([{ ...oldUser, status: 'Active', role: 'User' }]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://192.168.18.63:5000/api/users',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
  });

  it('creates a user using the agreed profile fields', async () => {
    fetchMock.mockResolvedValue(response(user, 201));

    await expect(createUser({ fullName: user.fullName, email: user.email, status: user.status, role: user.role }))
      .resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://192.168.18.63:5000/api/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ fullName: user.fullName, email: user.email, status: user.status, role: user.role }),
      }),
    );
  });

  it('updates a subset of fields using PUT without altering the request body', async () => {
    fetchMock.mockResolvedValue(response(user));

    await expect(updateUser(user._id, { city: 'London' })).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://192.168.18.63:5000/api/users/${user._id}`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ city: 'London' }) }),
    );
  });

  it('deletes a user by ID', async () => {
    fetchMock.mockResolvedValue(response({ message: 'User deleted' }));

    await expect(deleteUser(user._id)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      `http://192.168.18.63:5000/api/users/${user._id}`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('rejects malformed collection and mutation responses', async () => {
    fetchMock.mockResolvedValueOnce(response({ users: [] }));
    await expect(getUsers()).rejects.toThrow('The server returned an invalid users response.');

    fetchMock.mockResolvedValueOnce(response({ message: 'updated' }));
    await expect(updateUser(user._id, { city: 'London' }))
      .rejects.toThrow('The server returned an invalid user response.');

    fetchMock.mockResolvedValueOnce(response([{ ...user, age: { years: 30 } }]));
    await expect(getUsers()).rejects.toThrow('The server returned an invalid users response.');
  });

  it('rejects updates and deletes without an ID before sending a request', async () => {
    await expect(updateUser('', { city: 'London' })).rejects.toThrow('A user ID is required.');
    await expect(deleteUser(' ')).rejects.toThrow('A user ID is required.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
