/**
 * API - Export principal
 */

export { apiClient, getErrorMessage } from './client';
export { authApi } from './auth';
export type { LoginRequest, RegisterRequest, AuthResponse, User } from './auth';
export { kidoosApi } from './kidoos';
export type { Kidoo, CreateKidooRequest, UpdateKidooRequest, KidooEnvResponse } from './kidoos';
export { firmwareApi, isNewerFirmwareVersion } from './firmware';