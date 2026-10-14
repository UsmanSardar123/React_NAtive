
import { Alert,Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../services/postsApi';

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <Pressable 
  onPress={() => Alert.alert(post.title, 'taped')}
      >
    <View style={styles.card}>
      {/* <Text style={styles.title}>{post.id}</Text> */}
      <Text style={styles.title}>{post.title}</Text>

      <Text style={styles.body}>{post.body}</Text>

      <Text style={styles.metadata}>
        User ID: {post.id} | Post ID: {post.id}
      </Text>
    </View>
  </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ead6ef',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172033',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
  },
  metadata: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
  } ,

  box: {
     fontSize: 12,
    color: '#6B7280',
    marginTop: 12,

    
  },


});






