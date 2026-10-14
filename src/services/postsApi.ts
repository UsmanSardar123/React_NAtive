
export interface Post {
 // userId: number;
  id: number;
  title: string;
  body: string;
  userId: number;
  








}


const POSTS_API_URL = 'https://jsonplaceholder.typicode.com/posts';

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(POSTS_API_URL);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid API response: expected an array');
  }

  return data as Post[];
}
