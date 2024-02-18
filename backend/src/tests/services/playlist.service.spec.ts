import PlaylistRepository from "../../src/repositories/playlist.repository"
import SongRepository from "../../src/repositories/song.repository"
import UserRepository from "../../src/repositories/user.repository"
import PlaylistService from "../../src/services/playlist.service" 
import PlaylistEntity from "../../src/entities/playlist.entity"
import SongEntity from "../../src/entities/song.entity"
import PlaylistModel from "../../src/models/playlist.model"
import { HttpNotFoundError, HttpUnauthorizedError } from '../../src/utils/errors/http.error';

describe('PlaylistService', () => {
  let mockPlaylistRepository: PlaylistRepository;
  let mockSongRepository: SongRepository;
  let mockUserRepository: UserRepository;
  let playlistService: PlaylistService;

  const mockSongEntity = new SongEntity({
    id: 'song3',
    title: 'Song Title',
    duration: 300,
    artist: 'Artist Name',
    genre: 'Rock',
    times_ever_played: 0,
  });

  const mockPlaylistEntity = new PlaylistEntity({
    id: '1',
    name: 'My Playlist',
    createdBy: 'user1',
    songs: ['song1', 'song2'],
    private: false,
    followers: ['follower1', 'follower2'],
    contributors: ['contributor1', 'contributor2']
  });

  beforeEach(() => {
    mockPlaylistRepository = {
      getPlaylists: jest.fn(),
      getPlaylist: jest.fn(),
      createPlaylist: jest.fn(),
      updatePlaylist: jest.fn(),
      deletePlaylist: jest.fn(),
      searchPlaylists: jest.fn(),
      addSongToPlaylist: jest.fn(),
      removeSongToPlaylist: jest.fn(),
    } as any;

    mockSongRepository = {
      getSong: jest.fn(),
    } as any;

    mockUserRepository = {
      getUser: jest.fn(),
    } as any;

    playlistService = new PlaylistService(
      mockPlaylistRepository,
      mockSongRepository,
      mockUserRepository
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

    it('should return playlists', async () => {
    jest.spyOn(mockPlaylistRepository, 'getPlaylists').mockResolvedValue([mockPlaylistEntity]);

    const playlists = await playlistService.getPlaylists();

    expect(playlists).toEqual([new PlaylistModel(mockPlaylistEntity)]);
    expect(mockPlaylistRepository.getPlaylists).toBeCalledTimes(1);
    });

  it('should return a playlist by id', async () => {
      const playlistId = '1';
      jest.spyOn(mockPlaylistRepository, 'getPlaylist').mockResolvedValue(mockPlaylistEntity);

      const playlist = await playlistService.getPlaylist(playlistId);

      expect(playlist).toEqual(new PlaylistModel(mockPlaylistEntity));
      expect(mockPlaylistRepository.getPlaylist).toHaveBeenCalledWith(playlistId);
    });

    it('should throw HttpNotFoundError if playlist is not found', async () => {
        const playlistId = '000';
        jest.spyOn(mockPlaylistRepository, 'getPlaylist').mockResolvedValue(null);
  
        await expect(playlistService.getPlaylist(playlistId)).rejects.toThrow(HttpNotFoundError);
        expect(mockPlaylistRepository.getPlaylist).toHaveBeenCalledWith(playlistId);
    });

    it('should create a new playlist', async () => {
        const playlistData: PlaylistEntity = {
            id: '9897',
            name: 'New Playlist',
            createdBy: 'user1',
            songs: [],
            private: false,
            followers: [],
            contributors: []
        };
        jest.spyOn(mockPlaylistRepository, 'createPlaylist').mockResolvedValue(playlistData);
  
        const createdPlaylist = await playlistService.createPlaylist(playlistData);
  
        expect(createdPlaylist).toEqual(playlistData);
        expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledWith(playlistData);
      });
    
      it('should delete a playlist by id', async () => {
        const playlistId = '1';
        const userId = 'user1';
        jest.spyOn(mockPlaylistRepository, 'getPlaylist').mockResolvedValue(mockPlaylistEntity);
  
        await playlistService.deletePlaylist(playlistId, userId);
  
        expect(mockPlaylistRepository.getPlaylist).toHaveBeenCalledWith(playlistId);
        expect(mockPlaylistRepository.deletePlaylist).toHaveBeenCalledWith(playlistId);
      });

      it('should throw HttpNotFoundError if playlist is not found', async () => {
        const playlistId = '1';
        const userId = 'user1';
        jest.spyOn(mockPlaylistRepository, 'getPlaylist').mockResolvedValue(null);
  
        await expect(playlistService.deletePlaylist(playlistId, userId)).rejects.toThrow(HttpNotFoundError);
        expect(mockPlaylistRepository.getPlaylist).toHaveBeenCalledWith(playlistId);
        expect(mockPlaylistRepository.deletePlaylist).not.toHaveBeenCalled();
      });

      it('should update a playlist by id', async () => {
        const playlistId = '1';
        const userId = 'user1';
        const updatedData: PlaylistEntity = {
            id: '1',
            name: 'Update Playlist',
            createdBy: 'user1',
            songs: ['song1', 'song2'],
            private: false,
            followers: ['follower1', 'follower2'],
            contributors: ['contributor1', 'contributor2']
        };
        jest.spyOn(mockPlaylistRepository, 'updatePlaylist').mockResolvedValue(updatedData);
  
        const updatedPlaylist = await playlistService.updatePlaylist(playlistId, updatedData, userId);
       // console.log(updatedPlaylist);
  
        expect(updatedPlaylist).toEqual(updatedData);
        expect(mockPlaylistRepository.updatePlaylist).toHaveBeenCalledWith(playlistId, updatedData);
      });

      it('should add a song to a playlist', async () => {
        const playlistId = '1';
        const songId = 'song3';
        const userId = 'user1';
        jest.spyOn(mockPlaylistRepository, 'getPlaylist').mockResolvedValue(mockPlaylistEntity);
        jest.spyOn(mockSongRepository, 'getSong').mockResolvedValue(mockSongEntity);
  
        const updatedPlaylist = await playlistService.addSongToPlaylist(playlistId, songId, userId);
        //console.log(updatedPlaylist);
  
        expect(updatedPlaylist).toEqual(new PlaylistModel(mockPlaylistEntity));
        expect(mockPlaylistRepository.getPlaylist).toHaveBeenCalledWith(playlistId);
        expect(mockSongRepository.getSong).toHaveBeenCalledWith(songId);
        expect(mockPlaylistRepository.updatePlaylist).toHaveBeenCalledWith(playlistId, mockPlaylistEntity);
      });
    
      it('should remove a song from a playlist', async () => {
        const playlistId = '1';
        const songIdToRemove = 'song1';
        const userId = 'user1';
        jest.spyOn(mockPlaylistRepository, 'getPlaylist').mockResolvedValue(mockPlaylistEntity);
        jest.spyOn(mockSongRepository, 'getSong').mockResolvedValue(mockSongEntity);
  
        const updatedPlaylist = await playlistService.removeSongToPlaylist(playlistId, songIdToRemove, userId);
        //console.log(updatedPlaylist);
  
        expect(updatedPlaylist).toEqual(new PlaylistModel(mockPlaylistEntity));
        expect(mockPlaylistRepository.getPlaylist).toHaveBeenCalledWith(playlistId);
        expect(mockSongRepository.getSong).toHaveBeenCalledWith(songIdToRemove);
        expect(mockPlaylistRepository.updatePlaylist).toHaveBeenCalledWith(playlistId, mockPlaylistEntity);
      });
});