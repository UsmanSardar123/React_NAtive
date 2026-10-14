/* eslint-disable react-native/no-inline-styles */

import { FlatList, Text } from 'react-native';
import type { Post } from '../services/postsApi';
import PostCard from './PostCard.';

type PostListProps = {
  posts: Post[];
  emptyMessage: string;
};

export default function PostList({
  posts,
  emptyMessage,
}: PostListProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      renderItem={({ item }) => <PostCard post={item} />}
      ListEmptyComponent={


        <Text style={{ textAlign: 'center', marginTop: 24 }}>
          {emptyMessage}
        </Text>
      }
    />
  );
}
