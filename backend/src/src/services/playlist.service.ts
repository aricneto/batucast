import PlaylistRepository from "../repositories/playlist.repository";
import PlaylistModel from "../models/playlist.model";
import SongRepository from "../repositories/song.repository";
import {
  HttpNotFoundError,
  HttpUnauthorizedError,
} from "../utils/errors/http.error";
import PlaylistEntity from "../entities/playlist.entity";
import { validate } from "class-validator";
import UserRepository from "../repositories/user.repository";

class PlaylistServiceMessageCode {
  public static readonly playlist_not_found = "playlist_not_found";
  public static readonly song_not_found = "song_not_found";
  public static readonly user_not_found = "user_not_found";
}

class PlaylistService {
  private playlistRepository: PlaylistRepository;
  private songRepository: SongRepository;
  private userRepository: UserRepository;

  constructor(
    playlistRepository: PlaylistRepository,
    songRepository: SongRepository,
    userRepository: UserRepository
  ) {
    this.playlistRepository = playlistRepository;
    this.songRepository = songRepository;
    this.userRepository = userRepository;
  }

  public async getPlaylists(): Promise<PlaylistModel[]> {
    const playlistsEntity = await this.playlistRepository.getPlaylists();

    const playlistsModel = playlistsEntity.map(
      (playlist) => new PlaylistModel(playlist)
    );

    return playlistsModel;
  }

  public async getUserPlaylists(userId: string): Promise<PlaylistModel[]> {
    const playlistsEntity = await this.playlistRepository.getUserPlaylists(
      userId
    );

    const playlistsModel = playlistsEntity.map(
      (playlist) => new PlaylistModel(playlist)
    );

    return playlistsModel;
  }

  public async getPlaylist(id: string): Promise<PlaylistModel> {
    const playlistEntity = await this.playlistRepository.getPlaylist(id);

    if (!playlistEntity) {
      throw new HttpNotFoundError({
        msg: "Playlist not found",
        msgCode: PlaylistServiceMessageCode.playlist_not_found,
      });
    }

    const playlistModel = new PlaylistModel(playlistEntity);

    return playlistModel;
  }

  public async createPlaylist(data: PlaylistEntity): Promise<PlaylistModel> {
    // Validate the playlist data using class-validator
    const errors = await validate(data);

    if (errors.length > 0) {
      // Handle validation errors
      throw new TypeError(
        "Playlist data is incomplete or not of the correct type"
      );
    }

    const playlistEntity = await this.playlistRepository.createPlaylist(data);
    const playlistModel = new PlaylistModel(playlistEntity);

    return playlistModel;
  }

  public async updatePlaylist(
    id: string,
    data: PlaylistEntity,
    userId: string
  ): Promise<PlaylistModel> {
    const playlistEntity = await this.playlistRepository.updatePlaylist(
      id,
      data
    );

    if (!playlistEntity) {
      throw new HttpNotFoundError({
        msg: "Playlist not found to Update",
        msgCode: PlaylistServiceMessageCode.playlist_not_found,
      });
    }

    if (playlistEntity.createdBy !== userId) {
      // O usuário autenticado não é o criador da playlist
      throw new HttpUnauthorizedError({
        msg: "Unauthorized: Only the owner can update the playlist",
      });
    }

    const playlistModel = new PlaylistModel(playlistEntity);

    return playlistModel;
  }

  public async deletePlaylist(id: string, userId: string): Promise<void> {
    const playlist = await this.playlistRepository.getPlaylist(id);

    if (!playlist) {
      // Trate o caso em que a playlist não existe
      throw new HttpNotFoundError({
        msg: "Playlist not found to Delete",
        msgCode: PlaylistServiceMessageCode.playlist_not_found,
      });
    }

    if (playlist.createdBy !== userId) {
      // O usuário autenticado não é o criador da playlist
      throw new HttpUnauthorizedError({
        msg: "Unauthorized: Only the owner can delete the playlist",
      });
    }

    await this.playlistRepository.deletePlaylist(id);
  }

  async followPlaylist(playlistId: string, userId: string): Promise<void> {
    const playlistEntity: PlaylistEntity = await this.getPlaylist(playlistId);
    const playlistRepository: PlaylistRepository = new PlaylistRepository();

    if (!(playlistEntity.followers.indexOf(userId) > -1)) {
      playlistEntity.followers.push(userId);
      await playlistRepository.updatePlaylist(playlistId, playlistEntity);
    }
  }

  async unfollowPlaylist(playlistId: string, userId: string): Promise<void> {
    const playlistEntity: PlaylistEntity = await this.getPlaylist(playlistId);
    const playlistRepository: PlaylistRepository = new PlaylistRepository();

    const index: number = playlistEntity.followers.indexOf(userId);
    if (index !== -1) {
      playlistEntity.followers.splice(index, 1);
      await playlistRepository.updatePlaylist(playlistId, playlistEntity);
    }
  }

  async addContributor(
    playlistId: string,
    contributorId: string,
    userId: string
  ): Promise<void> {
    // Checa se a playlist existe
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    //Checa se a requisição está sendo feita pelo dono da playlist
    if (userId !== playlist.createdBy) {
      throw new Error(
        "Only the playlist's owner has permission to add contributors"
      );
    }

    // Checa se o usuário adicionado como contribuidor não é o próprio dono
    if (contributorId === userId) {
      throw new Error("User cannot add itself as a contributor");
    }

    // Checa se o usuário já é um contribuidor
    if (playlist.contributors.includes(contributorId)) {
      throw new Error("User is already a contributor to this playlist");
    }

    //Checa se o usuário existe
    const user = await this.userRepository.getUser(contributorId);
    if (!user) {
      throw new Error("User not found");
    }

    playlist.contributors.push(contributorId);
    await this.updatePlaylist(playlistId, playlist, userId);
  }

  async removeContributor(
    playlistId: string,
    contributorId: string,
    userId: string
  ): Promise<void> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    // Checa se o usuário é o dono
    if (contributorId === userId) {
      throw new Error("Owner cannot be removed as a contributor");
    }

    const index = playlist.contributors.indexOf(contributorId);
    if (index !== -1) {
      playlist.contributors.splice(index, 1);
      await this.updatePlaylist(playlistId, playlist, userId);
    }
  }

  public async searchPlaylists(
    keyword: string,
    filter?: string
  ): Promise<PlaylistModel[]> {
    let playlistsEntity;
    if (filter) {
      playlistsEntity = await this.playlistRepository.searchPlaylists(
        keyword,
        filter
      );
    } else {
      playlistsEntity = await this.playlistRepository.searchPlaylists(keyword);
    }

    const playlistsModel = playlistsEntity.map(
      (playlist) => new PlaylistModel(playlist)
    );
    return playlistsModel;
  }

  public async addSongToPlaylist(
    playlistId: string,
    songId: string,
    userId: string
  ): Promise<PlaylistModel> {
    const playlistEntity = await this.playlistRepository.getPlaylist(
      playlistId
    );
    const songEntity = await this.songRepository.getSong(songId);

    if (!playlistEntity) {
      throw new HttpNotFoundError({
        msg: "Playlist not found",
        msgCode: PlaylistServiceMessageCode.playlist_not_found,
      });
    }

    if (!songEntity) {
      throw new HttpNotFoundError({
        msg: "Song not found",
        msgCode: PlaylistServiceMessageCode.song_not_found,
      });
    }

    if (playlistEntity.createdBy !== userId) {
      // O usuário autenticado não é o criador da playlist
      throw new HttpUnauthorizedError({
        msg: "Unauthorized: Only the owner can update the playlist",
      });
    }

    // Verifique se a música já está na playlist
    if (playlistEntity.songs.includes(songId)) {
      throw new Error("Song is already in the playlist");
    } else {
      // Adiciona a música à playlist
      playlistEntity.songs.push(songId);
      await this.playlistRepository.updatePlaylist(playlistId, playlistEntity);
    }

    const updatedPlaylistEntity = playlistEntity;

    if (!updatedPlaylistEntity) {
      throw new HttpNotFoundError({
        msg: "Playlist fail to add song",
        msgCode: PlaylistServiceMessageCode.playlist_not_found,
      });
    }

    const playlistModel = new PlaylistModel(updatedPlaylistEntity);

    return playlistModel;
  }

  public async removeSongToPlaylist(
    playlistId: string,
    songIdToRemove: string,
    userId: string
  ): Promise<PlaylistModel> {
    const playlistEntity = await this.playlistRepository.getPlaylist(
      playlistId
    );
    const songEntity = await this.songRepository.getSong(songIdToRemove);

    if (!playlistEntity) {
      throw new HttpNotFoundError({
        msg: "Playlist not found",
        msgCode: PlaylistServiceMessageCode.playlist_not_found,
      });
    }

    if (!songEntity) {
      throw new HttpNotFoundError({
        msg: "Song not found",
        msgCode: PlaylistServiceMessageCode.song_not_found,
      });
    }

    if (playlistEntity.createdBy !== userId) {
      // O usuário autenticado não é o criador da playlist
      throw new HttpUnauthorizedError({
        msg: "Unauthorized: Only the owner can update the playlist",
      });
    }

    // Verifique se a música está na playlist
    if (!playlistEntity.songs.includes(songIdToRemove)) {
      throw new Error("Song does not exist in the playlist");
    } else {
      // Remove a música da playlist
      playlistEntity.songs = playlistEntity.songs.filter(
        (songId) => songId !== songIdToRemove
      );
      await this.playlistRepository.updatePlaylist(playlistId, playlistEntity);
    }

    // Atualiza a playlist no repositório
    const updatedPlaylistEntity = playlistEntity;

    if (!updatedPlaylistEntity) {
      throw new HttpNotFoundError({
        msg: "Playlist fail to remove song",
        msgCode: PlaylistServiceMessageCode.playlist_not_found,
      });
    }

    const playlistModel = new PlaylistModel(updatedPlaylistEntity);

    return playlistModel;
  }
}

export default PlaylistService;
