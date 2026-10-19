export interface Post {
  _id: string;
  title: string;
  body: string;
}

export type PostInput = Pick<Post, 'title' | 'body'>;

import { request } from './client';

export function getPosts(): Promise<Post[]> {
  return request<Post[]>('/api/posts');
}

export function createPost(post: PostInput): Promise<Post> {
  return request<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
}

export function updatePost(id: string, post: PostInput): Promise<Post> {
  return request<Post>(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  });
}

export async function deletePost(id: string): Promise<void> {
  await request<{ message: string }>(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export const fetchPosts = getPosts;
