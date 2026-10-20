export interface Post {
  _id: string;
  title: string;
  body: string;
}

export type PostInput = Pick<Post, 'title' | 'body'>;

import { request } from './client';

function isPost(value: unknown): value is Post {
  return typeof value === 'object'
    && value !== null
    && '_id' in value
    && typeof value._id === 'string'
    && 'title' in value
    && typeof value.title === 'string'
    && 'body' in value
    && typeof value.body === 'string';
}

function requirePostId(id: string): string {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('A post ID is required.');
  }
  return encodeURIComponent(id);
}

export function getPosts(): Promise<Post[]> {
  return request<unknown>('/api/posts').then((response) => {
    if (!Array.isArray(response) || !response.every(isPost)) {
      throw new Error('The server returned an invalid posts response.');
    }
    return response;
  });
}

export async function createPost(post: PostInput): Promise<Post> {
  const response = await request<unknown>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
  if (!isPost(response)) {
    throw new Error('The server returned an invalid post response.');
  }
  return response;
}

export async function updatePost(id: string, post: PostInput): Promise<Post> {
  const response = await request<unknown>(`/api/posts/${requirePostId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  });
  if (!isPost(response)) {
    throw new Error('The server returned an invalid post response.');
  }
  return response;
}

export async function deletePost(id: string): Promise<void> {
  await request<{ message: string }>(`/api/posts/${requirePostId(id)}`, {
    method: 'DELETE',
  });
}

export const fetchPosts = getPosts;
