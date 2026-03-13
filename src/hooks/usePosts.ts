/**
 * usePosts Hook
 * Hook React Query pour récupérer les posts/actualités
 */

import { useQuery } from '@tanstack/react-query';
import { postsApi, Post } from '@/api';

const POSTS_QUERY_KEY = ['posts'];

export function usePosts(limit = 10) {
  return useQuery({
    queryKey: [...POSTS_QUERY_KEY, limit],
    queryFn: () => postsApi.getAll({ limit }),
  });
}

export function usePostsByType(type: Post['type'], limit = 10) {
  return useQuery({
    queryKey: [...POSTS_QUERY_KEY, 'type', type, limit],
    queryFn: () => postsApi.getAll({ limit, type }),
  });
}
