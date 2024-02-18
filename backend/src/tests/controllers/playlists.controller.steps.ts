import { loadFeature, defineFeature } from 'jest-cucumber';
import supertest from 'supertest';
import app from '../../src/app';
import PlaylistRepository from '../../src/repositories/playlist.repository';
import PlaylistEntity from '../../src/entities/playlist.entity';
import PlaylistService from '../../src/services/playlist.service';
import SongRepository from "../../src/repositories/song.repository";
import SongEntity from '../../src/entities/song.entity';
import SongService from '../../src/services/song.service';
import UserRepository from '../../src/repositories/user.repository';
import UserEntity from '../../src/entities/user.entity';
import UserModel from "../../src/models/user.model";
import UserService from '../../src/services/user.service';
import Injector from "../../src/di/injector";
import { di } from "../../src/di/index";
import { mock } from "node:test";


const feature = loadFeature('tests/features/playlist-route.feature');
const request = supertest(app);

defineFeature(feature, (test) => {
    // Mock do repositório
    let mockPlaylistRepository: PlaylistRepository;
    let mockSongRepository: SongRepository;
    let mockUserRepository: UserRepository;

    let playlistService: PlaylistService;
    let songService: SongService;
    let userService: UserService;

    let mockUserModel: UserModel;
    
    let mockPlaylistEntity: PlaylistEntity;
    let mockSongEntity: SongEntity;
    let mockUserEntity: UserEntity;

    let injector: Injector = di;

    beforeEach(() => {
        injector.registerRepository(PlaylistRepository, new PlaylistRepository());
        mockPlaylistRepository = injector.getRepository(PlaylistRepository);

        injector.registerRepository(SongRepository, new SongRepository());
        mockSongRepository = injector.getRepository(SongRepository);
    
        injector.registerRepository(UserRepository, new UserRepository());
        mockUserRepository = injector.getRepository(UserRepository);

        injector.registerService(
            PlaylistService,
            new PlaylistService(mockPlaylistRepository, mockSongRepository, mockUserRepository)
          );
          playlistService = injector.getService(PlaylistService);
      
        injector.registerService(SongService, new SongService(mockSongRepository));
        songService = injector.getService(SongService);
    
        injector.registerService(UserService, new UserService(mockUserRepository));
        userService = injector.getService(UserService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Create a New Playlist', ({ given, when, then, and }) => {
        let response: supertest.Response;
        given(
            /^a user with id "(.*)" is logged-in$/,
            async (userId) => {
                mockUserEntity = new UserEntity({ 
                    id: userId,
                    name: "Alfonso",
                    password: "12334",
                    email: "alfonso@gmail.com",
                    history_tracking: true,
                });

                jest.spyOn(mockUserRepository, "createUser");

                await userService.createUser(mockUserEntity);
            
                expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
            }
        );

        when(/^a POST request is sent to "(.*)" with the playlist name "(.*)" and user id "(.*)"$/, async (req_url, name, userId) => {
            response = await request.post(req_url).send({
                name: name,
                createdBy: userId,
              });
            }
        );

        then(
            /^the response status should be "(.*)"$/,
            async (status_code) => {
                expect(response.status).toBe(parseInt(status_code));
            }
        );

        and(
            /^the response JSON should contain the created playlist with name "(.*)"$/,
            async (playlistName) => {
                const responseBody = response.body.data;
                expect(responseBody.name).toBe(playlistName);
            }
        );
    });

    test('Add a Song to an Existing Playlist', ({ given, when, then, and }) => {
        let response: supertest.Response;
    
        given(
            /^a user with id "(.*)" is logged-in$/,
            async (userId) => {
                mockUserEntity = new UserEntity({ 
                    id: userId,
                    name: "Alfonso",
                    password: "12334",
                    email: "alfonso@gmail.com",
                    history_tracking: true,
                });
    
                jest.spyOn(mockUserRepository, "createUser");
    
                await userService.createUser(mockUserEntity);
            
                expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
            }
        );
    
        and(
            /^there is an existing playlist with id "(.*)" named "(.*)" created by user "(.*)" without songs in$/,
            async (playlistId, playlistName, createdBy) => {
                mockPlaylistEntity = new PlaylistEntity({ 
                    id: playlistId,
                    name: playlistName,
                    createdBy: createdBy,
                    songs: [],
                    private: false,
                    followers: [],
                    contributors: [], 
                });
    
                jest.spyOn(mockPlaylistRepository, "createPlaylist");
    
                await playlistService.createPlaylist(mockPlaylistEntity);
    
                expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);
            }
        );
    
        and(
            /^there is an existing song with id "(.*)" named "(.*)" by "(.*)"$/,
            async (songId, songName, artist) => {
                mockSongEntity = new SongEntity({ 
                    id: songId,
                    title: songName,
                    artist: artist,
                    duration: 180,
                    genre: "Pop", 
                    times_ever_played: 0
                });
    
                jest.spyOn(mockSongRepository, "createSong");
    
                await songService.createSong(mockSongEntity);
    
                expect(mockSongRepository.createSong).toHaveBeenCalledTimes(1);
            }
        );
    
        when(
            /^a PUT request is sent to "(.*)" with user id "(.*)"$/,
            async (req_url, userId) => {
                response = await request.put(req_url).send({
                    userId: userId,
                });
                ///console.log(response.body.data);
            }
        );
    
        then(
            /^the response status should be "(.*)"$/,
            async (status_code) => {
                expect(response.status).toBe(parseInt(status_code));
            }
        );
    
        and(
            /^the response JSON should contain the updated playlist with the added song id "(.*)" in the list of songs$/,
            async (addedSongId) => {
                const responseBody = response.body.data;
                expect(responseBody.songs).toContain(addedSongId);
            }
        );
    });

    test('Delete a Playlist', ({ given, when, then, and }) => {
        let response: supertest.Response;
    
        given(
            /^a user with id "(.*)" is logged-in$/,
            async (userId) => {
                mockUserEntity = new UserEntity({ 
                    id: userId,
                    name: "Alfonso",
                    password: "12334",
                    email: "alfonso@gmail.com",
                    history_tracking: true,
                });
    
                jest.spyOn(mockUserRepository, "createUser");
    
                await userService.createUser(mockUserEntity);
            
                expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
            }
        );
    
        and(
            /^there is an existing playlist with id "(.*)" named "(.*)" created by user "(.*)"$/,
            async (playlistId, playlistName, createdBy) => {
                mockPlaylistEntity = new PlaylistEntity({ 
                    id: playlistId,
                    name: playlistName,
                    createdBy: createdBy,
                    songs: [],
                    private: false,
                    followers: [], 
                    contributors: [],
                });
    
                jest.spyOn(mockPlaylistRepository, "createPlaylist");
    
                await playlistService.createPlaylist(mockPlaylistEntity);
    
                expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);
            }
        );
    
        when(
            /^a DELETE request is sent to "(.*)" with user id "(.*)"$/,
            async (req_url, userId) => {
                response = await request.delete(req_url).send({
                    userId: userId,
                });
            }
        );

        then(
            /^the response status should be "(.*)"$/,
            async (status_code) => {
                expect(response.status).toBe(parseInt(status_code));
            }
        );
    
        and(
            /^the playlist with id "(.*)" should no longer exist in the database$/,
            async (playlistId) => {
                const deletedPlaylistResponse = await request.get('/api/playlists/' + playlistId).send();
                const result = deletedPlaylistResponse.body.msgCode;
                
                expect(deletedPlaylistResponse.status).toBe(404);
                expect(result).toEqual('playlist_not_found');
            }
        );
    });

    test('Remove a Song from a Playlist', ({ given, when, then, and }) => {
        let response: supertest.Response;
    
        given(
            /^a user with id "(.*)" is logged-in$/,
            async (userId) => {
                mockUserEntity = new UserEntity({ 
                    id: userId,
                    name: "João",
                    password: "123456",
                    email: "joao@gmail.com",
                    history_tracking: true,
                });
    
                jest.spyOn(mockUserRepository, "createUser");
    
                await userService.createUser(mockUserEntity);
            
                expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
            }
        );
    
        and(
            /^there is an existing playlist with id "(.*)" named "(.*)" created by user "(.*)"$/,
            async (playlistId, playlistName, createdBy) => {
                mockPlaylistEntity = new PlaylistEntity({ 
                    id: playlistId,
                    name: playlistName,
                    createdBy: createdBy,
                    songs: [],
                    private: false,
                    followers: [], 
                    contributors: [],
                });
    
                jest.spyOn(mockPlaylistRepository, "createPlaylist");
    
                await playlistService.createPlaylist(mockPlaylistEntity);
    
                expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);
            }
        );
    
        and(
            /^there is an existing song with id "(.*)" named "(.*)" by "(.*)" in the playlist$/,
            async (songId, songTitle, artist) => {
                mockSongEntity = new SongEntity({ 
                    id: songId,
                    title: songTitle,
                    artist: artist,
                    duration: 0,
                    genre: "", 
                    times_ever_played: 90,
                });
    
                mockPlaylistEntity.songs.push(songId);
    
                jest.spyOn(mockSongRepository, "createSong");
    
                await songService.createSong(mockSongEntity);
    
                expect(mockSongRepository.createSong).toHaveBeenCalledTimes(1);
            }
        );
    
        when(
            /^a DELETE request is sent to "(.*)" with user id "(.*)"$/,
            async (req_url, userId) => {
                response = await request.delete(req_url).send({
                    userId: userId,
                });
            }
        );
  
        then(
            /^the response status should be "(.*)"$/,
            async (status_code) => {
                expect(response.status).toBe(parseInt(status_code));
            }
        );
    
        and(
            /^the response JSON should contain the updated playlist with the song id "(.*)" removed from the list of songs$/,
            async (songId) => {
                const updatedPlaylist = await request.get('/api/playlists/' + mockPlaylistEntity.id).send();
                //console.log(updatedPlaylist.body.data);
                expect(updatedPlaylist.body.data.songs).not.toContain(songId);
            }
        );
    });
    
    test('Update Playlist Name', ({ given, when, then, and }) => {
        let response: supertest.Response;
    
        given(
            /^a user with id "(.*)" is logged-in$/,
            async (userId) => {
                mockUserEntity = new UserEntity({ 
                    id: userId,
                    name: "João",
                    password: "123456",
                    email: "joao@gmail.com",
                    history_tracking: true,
                });
    
                jest.spyOn(mockUserRepository, "createUser");
    
                await userService.createUser(mockUserEntity);
            
                expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
            }
        );
    
        and(
            /^there is an existing playlist with id "(.*)" named "(.*)" created by user "(.*)"$/,
            async (playlistId, playlistName, createdBy) => {
                mockPlaylistEntity = new PlaylistEntity({ 
                    id: playlistId,
                    name: playlistName,
                    createdBy: createdBy,
                    songs: [],
                    private: false,
                    followers: [], 
                    contributors: [],
                });
    
                jest.spyOn(mockPlaylistRepository, "createPlaylist");
    
                await playlistService.createPlaylist(mockPlaylistEntity);
    
                expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);
            }
        );
    
        when(
            /^a PUT request is sent to "(.*)" with user id "(.*)" and the updated playlist name "(.*)"$/,
            async (req_url, userId, updatedPlaylistName) => {
                response = await request.put(req_url).send({
                    id: mockPlaylistEntity.id,
                    name: updatedPlaylistName,
                    createdBy: mockPlaylistEntity.createdBy,
                    songs: [],
                    private: false,
                    followers: [],
                    userId: userId,
                });
            }
        );
    
        then(
            /^the response status should be "(.*)"$/,
            async (status_code) => {
                expect(response.status).toBe(parseInt(status_code));
            }
        );
    
        and(
            /^the response JSON should contain the updated playlist with the name "(.*)"$/,
            async (updatedPlaylistName) => {
                const updatedPlaylist = await request.get('/api/playlists/' + mockPlaylistEntity.id).send();
                //console.log(updatedPlaylist.body.data);
                expect(updatedPlaylist.body.data.name).toBe(updatedPlaylistName);
            }
        );
    }); 

    test('Fail to Create Playlist with Empty Name', ({ given, when, then, and }) => {
        let response: supertest.Response;

        given(
            /^a user with id "(.*)" is logged-in$/,
            async (userId) => {
                mockUserEntity = new UserEntity({ 
                    id: userId,
                    name: "Alfonso",
                    password: "12334",
                    email: "alfonso@gmail.com",
                    history_tracking: true,
                });
    
                jest.spyOn(mockUserRepository, "createUser");
    
                await userService.createUser(mockUserEntity);
            
                expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
            }
        );

        when(
            /^a POST request is sent to "(.*)" with an empty playlist name and user id "(.*)"$/,
            async (req_url, userId) => {
                response = await request.post(req_url).send({
                    name: "",
                    createdBy: userId,
                });
            }
        );
    
        then(
            /^the response status should be "(.*)"$/,
            async (status_code) => {
                expect(response.status).toBe(parseInt(status_code));
            }
        );
    
        and(
            /^the response JSON should contain "(.*)" error message$/,
            async (errorMessage) => {
                expect(response.body.error).toBe(errorMessage);
            }
        );
    });    
});
