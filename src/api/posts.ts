/**
 * Posts API
 * API pour récupérer les actualités/news
 */

import { apiClient } from './client';

export interface Post {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  imageUrl?: string | null;
  type: 'update' | 'promo' | 'feature' | 'news';
  publishedAt: string;
}

export const postsApi = {
  /**
   * Récupère les posts publiés
   */
  async getAll(params?: { limit?: number; type?: string }): Promise<Post[]> {
    const response = await apiClient.get<{ success: true; data: Post[] }>('/api/posts', {
      params,
    });
    return response.data.data;
  },
};
