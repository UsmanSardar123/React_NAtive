import { request } from './client';

export type UserStatus = 'Active' | 'Inactive' | 'Pending';
export type UserRole = 'User' | 'Admin' | 'Manager';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  age?: number | null;
  gender?: string;
  profileImageUrl?: string;
  jobTitle?: string;
  department?: string;
  city?: string;
  country?: string;
  address?: string;
  bio?: string;
  status: UserStatus;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type UserInput = Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'age'> & { age?: number | null };

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const user = value as Partial<User>;
  const optionalStringFields = [
    'phoneNumber', 'gender', 'profileImageUrl', 'jobTitle', 'department',
    'city', 'country', 'address', 'bio', 'createdAt', 'updatedAt',
  ] as const;
  return typeof user._id === 'string'
    && !!user._id.trim()
    && typeof user.fullName === 'string'
    && !!user.fullName.trim()
    && typeof user.email === 'string'
    && !!user.email.trim()
    && (user.age === undefined || user.age === null || (typeof user.age === 'number' && Number.isFinite(user.age)))
    && optionalStringFields.every((field) => user[field] === undefined || typeof user[field] === 'string')
    && (user.status === undefined || ['Active', 'Inactive', 'Pending'].includes(user.status))
    && (user.role === undefined || ['User', 'Admin', 'Manager'].includes(user.role));
}

function requireUserId(id: string): string {
  if (typeof id !== 'string' || !id.trim()) throw new Error('A user ID is required.');
  return encodeURIComponent(id);
}

function validateUserResponse(value: unknown): User {
  if (!isUser(value)) throw new Error('The server returned an invalid user response.');
  return { ...value, status: value.status ?? 'Active', role: value.role ?? 'User' };
}

export async function getUsers(): Promise<User[]> {
  const response = await request<unknown>('/api/users');
  if (!Array.isArray(response) || !response.every(isUser)) {
    throw new Error('The server returned an invalid users response.');
  }
  return response.map((user) => ({ ...user, status: user.status ?? 'Active', role: user.role ?? 'User' }));
}

export async function createUser(user: UserInput): Promise<User> {
  return validateUserResponse(await request<unknown>('/api/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }));
}

export async function updateUser(id: string, user: Partial<UserInput>): Promise<User> {
  return validateUserResponse(await request<unknown>(`/api/users/${requireUserId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  }));
}

export async function deleteUser(id: string): Promise<void> {
  await request<{ message: string }>(`/api/users/${requireUserId(id)}`, { method: 'DELETE' });
}
