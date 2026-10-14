import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPosts, type Post } from './src/services/postsApi';
import PostList from './src/components/PostList';
import Pagination from './src/components/Pagination';

const POSTS_PER_PAGE = 10;

export default function App() {
  const [started, setStarted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch posts after the user starts, and again on retry.
  useEffect(() => {
    if (!started) {
      return;
    }

    let isActive = true;

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPosts();

        if (isActive) {
          setPosts(data);
          setCurrentPage(1);
        }
      } catch {
        if (isActive) {
          setError('Unable to load posts. Please try again.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      isActive = false;
    };
  }, [retryCount, started]);

  // Ignore Retry taps while a request is already running.
  function handleRetry() {
    if (loading) {
      return;
    }
    setRetryCount((count) => count + 1);
  }

  // Search post titles, ignoring letter case.
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // Calculate the number of pages after searching.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  );

  // Keep only the posts for the current page.
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  if (!started) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.heading}>API Explorer</Text>
        <Button title="Load Posts" onPress={() => setStarted(true)} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading posts...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  if (posts.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.message}>No posts available.</Text>
        <Button title="Retry" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>API Explorer</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search post titles..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setCurrentPage(1);
        }}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      <PostList
        posts={visiblePosts}
        emptyMessage="No matching posts found."
      />

      {filteredPosts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() =>
            setCurrentPage((page) => Math.max(1, page - 1))
          }
          onNext={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    padding: 20,
    color: '#172033',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  message: {
    fontSize: 16,
    color: '#374151',
  },
  error: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});
