import type { MixtapeResponse, MixtapeVideo } from '../types/mixtape';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/mixtape${path}`, { credentials: 'same-origin', ...init });
  const body = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || 'Could not reach the mixtape. Please try again.');
  return body;
}
export const getMixtape = (signal?: AbortSignal) => request<MixtapeResponse>('', { signal });
export const searchMixtape = (query: string, signal?: AbortSignal) => request<{ results: MixtapeVideo[] }>(`?q=${encodeURIComponent(query)}`, { signal });
export const submitMixtape = (body: { action: 'add'; videoId: string; nickname: string } | { action: 'like'; trackId: string }) => request<MixtapeResponse>('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const trackArtwork = (videoId: string) => `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`;
