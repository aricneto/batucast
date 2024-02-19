import PlaylistEntity from "../entities/playlist.entity";
import BaseRepository from "./base.repository";

class PlaylistRepository extends BaseRepository<PlaylistEntity> {
  constructor() {
    super("playlists");
  }

  public async getPlaylists(): Promise<PlaylistEntity[]> {
    return await this.findAll();
  }

  public async getUserPlaylists(userId: string): Promise<PlaylistEntity[]> {
    return await this.findAll((item) => item.createdBy === userId);
  }

  public async getPlaylist(id: string): Promise<PlaylistEntity | null> {
    return await this.findOne((item) => item.id === id);
  }

  public async createPlaylist(data: PlaylistEntity): Promise<PlaylistEntity> {
    return await this.add(data);
  }

  public async updatePlaylist(
    id: string,
    data: PlaylistEntity
  ): Promise<PlaylistEntity | null> {
    return await this.update((item) => item.id === id, data);
  }

  public async deletePlaylist(id: string): Promise<void> {
    await this.delete((item) => item.id !== id);
  }

  public async searchPlaylists(
    keyword: string,
    filter?: string
  ): Promise<PlaylistEntity[]> {
    return await this.findAll(
      (item) =>
        item.name.toLowerCase().includes(keyword.toLowerCase()) && !item.private
    );
  }

  public async followPlaylist(
    playlistId: string,
    userId: string
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId);
      if (playlist) {
        playlist.followers.push(userId);
        await this.updatePlaylist(playlistId, playlist);
      }
    } catch (error) {
      throw error;
    }
  }

  public async unfollowPlaylist(
    playlistId: string,
    userId: string
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId);
      if (playlist) {
        playlist.followers = playlist.followers.filter(
          (followerId) => followerId !== userId
        );
        await this.updatePlaylist(playlistId, playlist);
      }
    } catch (error) {
      throw error;
    }
  }

  public async addContributor(
    playlistId: string,
    contributorId: string
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId);
      if (playlist) {
        // Checa se o usuário já é um contribuidor
        if (playlist.contributors.indexOf(contributorId) > -1) {
          throw new Error("User is already a contributor to this playlist");
        }
        playlist.contributors.push(contributorId);
        await this.updatePlaylist(playlistId, playlist);
      }
    } catch (error) {
      throw error;
    }
  }

  public async removeContributor(
    playlistId: string,
    contributorId: string
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId);
      if (playlist) {
        const index = playlist.contributors.indexOf(contributorId);
        if (index > -1) {
          playlist.contributors.splice(index, 1);
          await this.updatePlaylist(playlistId, playlist);
        } else {
          throw new Error("User is not a contributor");
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

export default PlaylistRepository;
