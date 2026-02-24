/**
 * Hooks de lecture : liste des Kidoos et Kidoo par ID
 */

import { useQuery } from '@tanstack/react-query';
import { kidoosApi } from '@/api';
import { KIDOOS_KEY } from './keys';

export function useKidoos() {
  return useQuery({
    queryKey: KIDOOS_KEY,
    queryFn: kidoosApi.getAll,
  });
}

export function useKidoo(id: string) {
  return useQuery({
    queryKey: [...KIDOOS_KEY, id],
    queryFn: () => kidoosApi.getById(id),
    enabled: !!id,
  });
}
