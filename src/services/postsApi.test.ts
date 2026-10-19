import { createPost, deletePost, getPosts, updatePost, type Post } from './postsApi';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: '192.168.18.63:8083' } },
}));

const post: Post = {
  _id: '507f1f77bcf86cd799439011',
  title: 'A title',
  body: 'A body',
};

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('posts API client', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('reads the posts collection from the Android emulator host', async () => {
    fetchMock.mockResolvedValue(response([post]));

    await expect(getPosts()).resolves.toEqual([post]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://192.168.18.63:5000/api/posts',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('creates a post with the title and body expected by Express', async () => {
    fetchMock.mockResolvedValue(response(post, 201));

    await expect(createPost({ title: post.title, body: post.body })).resolves.toEqual(post);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://192.168.18.63:5000/api/posts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: post.title, body: post.body }),
      }),
    );
  });

  it('updates a post with PUT and its MongoDB ID', async () => {
    fetchMock.mockResolvedValue(response(post));

    await expect(updatePost(post._id, { title: post.title, body: post.body })).resolves.toEqual(post);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://192.168.18.63:5000/api/posts/${post._id}`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ title: post.title, body: post.body }),
      }),
    );
  });

  it('deletes a post with its MongoDB ID', async () => {
    fetchMock.mockResolvedValue(response({ message: 'Post deleted' }));

    await expect(deletePost(post._id)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      `http://192.168.18.63:5000/api/posts/${post._id}`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('shows backend validation errors and HTTP status to the user', async () => {
    fetchMock.mockResolvedValue(response({ message: 'Title is required.' }, 400));

    await expect(createPost({ title: '', body: post.body })).rejects.toThrow(
      'Title is required. (HTTP 400)',
    );
  });

  it('identifies the API URL when a network request cannot connect', async () => {
    fetchMock.mockRejectedValue(new Error('Network request failed'));

    await expect(getPosts()).rejects.toThrow(
      'Unable to reach http://192.168.18.63:5000/api/posts: Network request failed',
    );
  });
});
