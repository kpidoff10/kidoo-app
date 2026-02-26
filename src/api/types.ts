/**
 * Types partagés entre les modules API
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
