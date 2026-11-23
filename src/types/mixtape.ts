export interface MixtapeVideo { videoId: string; title: string; artist: string }
export interface MixtapeTrack extends MixtapeVideo {
  id: string; nickname: string; createdAt: string; likes: number; liked: boolean;
}
export interface MixtapeResponse { tracks: MixtapeTrack[]; searchEnabled: boolean }
