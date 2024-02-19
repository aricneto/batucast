import { loadFeature, defineFeature } from 'jest-cucumber';
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

const feature = loadFeature("tests/features/playlist-service.feature");

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

    test('Get playlists by user id', ({ given, when, then }) => {
        let playlists: PlaylistEntity[];
        let response: PlaylistEntity[];

        given(/^the method getPlaylists was called with the user_id "(.*)" from PlaylistService returns playlists with ids "(.*)", "(.*)", and "(.*)"$/, async (userId, Id_1, Id_2, Id_3) => {
            const idsArray = [Id_1, Id_2, Id_3];
            playlists = idsArray.map(id => new PlaylistEntity({ 
                id, 
                createdBy: userId, 
                name: `Playlist ${id}`,
                songs: [],
                private: false,
                followers: [],
                contributors: [], 
            }));
            jest.spyOn(mockPlaylistRepository, "getPlaylists").mockResolvedValue(playlists);
        });

        when(/^the method getPlaylists from PlaylistService is called with the id "(.*)"$/, async (userId) => {
            response = await playlistService.getPlaylists();
            //console.log(response);
        });

        then(/^the playlists returned must have ids "(.*)", "(.*)", and "(.*)"$/, async (expectedId_1, expectedId_2, expectedId_3) => {
            const expectedIdsArray = [expectedId_1, expectedId_2, expectedId_3];
            const returnedIdsArray = response.map(response => response.id);

            expect(returnedIdsArray).toEqual(expectedIdsArray);
        });
    });

    test('Create a new playlist', ({ given, when, then }) => {
        let response: PlaylistEntity[];

        given(/^the function createPlaylist was called with the user_id "(.*)" and the playlist name "(.*)"$/, async (userId, playlistName) => {
            // Mock implementation of the PlaylistRepository method
            mockPlaylistEntity = new PlaylistEntity({ 
                id: "1233445", 
                createdBy: userId, 
                name: playlistName,
                songs: [],
                private: false,
                followers: [],
                contributors: [],
            });
            jest.spyOn(mockPlaylistRepository, "createPlaylist");

            await playlistService.createPlaylist(mockPlaylistEntity);
    
            expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);
        });

        when(/^the function getUserPlaylists is called with the user_id "(.*)"$/, async (userId) => {
            response = await playlistService.getUserPlaylists(userId);
            //console.log(response);
        });

        then(/^the playlists returned must include "(.*)"$/, async (expectedPlaylistName) => {
            const playlistNames = response.map(response => response.name);

            expect(playlistNames).toContain(expectedPlaylistName);
        });
    });


    test('Update playlist name', ({ given, when, then, and }) => {
        let updatePlaylist: PlaylistEntity;
        let response: PlaylistEntity;

        given(/^a user with id "(.*)" has a playlist named "(.*)"$/, async (userId, playlistName) => {
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

            mockPlaylistEntity = new PlaylistEntity({ 
                id: "1",
                name: playlistName,
                createdBy: userId,
                songs: [],
                private: false,
                followers: [],
                contributors: [], 
            });

            jest.spyOn(mockPlaylistRepository, "createPlaylist");

            await playlistService.createPlaylist(mockPlaylistEntity);

            expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);
        });

        when(/^the function updatePlaylist is called with the playlist id "(.*)", user_id "(.*)", and the updated playlist name "(.*)"$/, async (playlistId, userId, updatedPlaylistName) => {
            updatePlaylist = new PlaylistEntity({ 
                id: mockPlaylistEntity.id,
                name: updatedPlaylistName,
                createdBy: mockPlaylistEntity.createdBy,
                songs: mockPlaylistEntity.songs,
                private: mockPlaylistEntity.private,
                followers: mockPlaylistEntity.followers,
                contributors: mockPlaylistEntity.contributors, 
            });
            jest.spyOn(mockPlaylistRepository, "updatePlaylist");
            
            await playlistService.updatePlaylist(playlistId, updatePlaylist, userId);
            
            expect(mockPlaylistRepository.updatePlaylist).toHaveBeenCalledTimes(1);
        });
        
        and(/^the function getPlaylist is called with the playlist id "(.*)"$/, async (playlistId) => {
            response = await playlistService.getPlaylist(playlistId);
            //console.log(response);
        });

        then(/^the playlist returned must have the name "(.*)"$/, async (expectedPlaylistName) => {
            expect(response.name).toBe(expectedPlaylistName);
        });
    });

    test('Delete a playlist', ({ given, when, then, and }) => {
        let playlists: PlaylistEntity[];
        let response: PlaylistEntity[];

        given(/^a user with id "(.*)" has playlists with ids "(.*)", "(.*)", and "(.*)"$/, async (userId, Id_1, Id_2, Id_3) => {
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

            const idsArray = [Id_1, Id_2, Id_3];
            playlists = idsArray.map(id => new PlaylistEntity({ 
                id, 
                createdBy: userId, 
                name: `Playlist ${id}`,
                songs: [],
                private: false,
                followers: [],
                contributors: [], 
            }));
            jest.spyOn(mockPlaylistRepository, "createPlaylist");

            for (const playlist of playlists) {
                await playlistService.createPlaylist(playlist);
            }
            
            // Verificando se o método foi chamado três vezes
            expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(3);
        });
        
        when(/^the function deletePlaylist is called with the playlist id "(.*)" and user_id "(.*)"$/, async (playlistId, userId) => {
            jest.spyOn(mockPlaylistRepository, "deletePlaylist");
            
            await playlistService.deletePlaylist(playlistId, userId);
            
            expect(mockPlaylistRepository.deletePlaylist).toHaveBeenCalledTimes(1);
        });

        and(/^the function getPlaylists is called with the user_id "(.*)"$/, async (userId) => {
            // Call the service method
            response = await playlistService.getUserPlaylists(userId);
            //console.log(response);
        });

        then(/^the playlists returned must not include the playlist with id "(.*)"$/, async (deletedPlaylistId) => {
            // Verify if the deleted playlist is not included in the returned playlists
            expect(response.some((playlist) => playlist.id === deletedPlaylistId)).toBe(false);
        });

        and(/^the user playlists must have (\d+) items$/, async (expectedPlaylistCount) => {
            // Verify if the user playlists have the expected number of items
            expect(response.length).toBe(parseInt(expectedPlaylistCount, 10));
        });
    });

    test('Add a song to a playlist', ({ given, when, then, and}) => {
        let response: PlaylistEntity;
        
        given(/^a user with id "(.*)" has a playlist with id "(.*)"$/, async (userId, playlistId) => {
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

            mockPlaylistEntity = new PlaylistEntity({ 
                id: playlistId,
                name: "playlistName",
                createdBy: userId,
                songs: [],
                private: false,
                followers: [],
                contributors: [], 
            });

            jest.spyOn(mockPlaylistRepository, "createPlaylist");

            await playlistService.createPlaylist(mockPlaylistEntity);

            expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);
        });

        and(/^there is a song with id "(.*)"$/, async (songId) => {
            mockSongEntity = new SongEntity({ 
                id: songId,
                title: "songTitle",
                artist: "artist",
                duration: 0,
                genre: "", 
                times_ever_played: 90,
            });

            jest.spyOn(mockSongRepository, "createSong");

            await songService.createSong(mockSongEntity);

            expect(mockSongRepository.createSong).toHaveBeenCalledTimes(1);
        });

        when(/^the function addSongToPlaylist is called with the playlist id "(.*)", song id "(.*)", and user_id "(.*)"$/, async (playlistId, songId, userId) => {
            jest.spyOn(mockPlaylistRepository, "updatePlaylist");
            
            await playlistService.addSongToPlaylist(playlistId, songId, userId);
            
            expect(mockPlaylistRepository.updatePlaylist).toHaveBeenCalledTimes(1);
        });

        and(/^the function getPlaylist is called with the playlist id "(.*)"$/, async (playlistId) => {
            response = await playlistService.getPlaylist(playlistId);
        });

        then(/^the playlist returned must have the song with id "(.*)"$/, async (songId) => {
            expect(response.songs).toContain(songId);
        });
    });

    test('Remove a song from a playlist', ({ given, when, then, and }) => {
        let response: PlaylistEntity;
        let songs: SongEntity[];
    
        given(/^a user with id "(.*)" has a playlist with id "(.*)" containing songs with ids "(.*)", "(.*)", and "(.*)"$/, async (userId, playlistId, songId1, songId2, songId3) => {
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
    
            mockPlaylistEntity = new PlaylistEntity({
                id: playlistId,
                name: "playlistName",
                createdBy: userId,
                songs: [songId1, songId2, songId3],
                private: false,
                followers: [],
                contributors: [],
            });
    
            jest.spyOn(mockPlaylistRepository, "createPlaylist");
    
            await playlistService.createPlaylist(mockPlaylistEntity);
    
            expect(mockPlaylistRepository.createPlaylist).toHaveBeenCalledTimes(1);

            const idsArray = [songId1, songId2, songId3];
            songs = idsArray.map(id => new SongEntity({ 
                id, 
                title: `Song ${id}`,
                artist: `Artist ${id}`,
                duration: 0,
                genre: "", 
                times_ever_played: 90,
            }));
            jest.spyOn(mockSongRepository, "createSong");

            for (const song of songs) {
                await songService.createSong(song);
            }
            
            // Verificando se o método foi chamado três vezes
            expect(mockSongRepository.createSong).toHaveBeenCalledTimes(3);
        });
    
        when(/^the function removeSongToPlaylist is called with the playlist id "(.*)", song id "(.*)", and user_id "(.*)"$/, async (playlistId, songIdToRemove, userId) => {
            jest.spyOn(mockPlaylistRepository, "updatePlaylist");
    
            await playlistService.removeSongToPlaylist(playlistId, songIdToRemove, userId);
    
            expect(mockPlaylistRepository.updatePlaylist).toHaveBeenCalledTimes(1);
        });
    
        and(/^the function getPlaylist is called with the playlist id "(.*)"$/, async (playlistId) => {
            response = await playlistService.getPlaylist(playlistId);
        });
    
        then(/^the playlist returned must not have the song with id "(.*)"$/, async (songId) => {
            expect(response.songs).not.toContain(songId);
        });
    
        and(/^the playlist must have songs with ids "(.*)" and "(.*)"$/, async (songId1, songId2) => {
            expect(response.songs).toContain(songId1);
            expect(response.songs).toContain(songId2);
        });
    });

    test("Searching for a public playlist", ({ given, when, then }) => {
        let playlists: PlaylistEntity[];
      
        given(/^there's a playlist named "(.*)" and id "(.*)", that has the private atribute set to "(.*)" in the database$/, async (playlistName, playlistId, isPrivate) => {
          const mockPlaylistEntity = new PlaylistEntity({
            id: playlistId,
            name: playlistName,
            private: isPrivate === "true" ? true : false,
            songs: [], 
            createdBy: "3",
            followers: [], 
            contributors: [], 
          });
          jest.spyOn(mockPlaylistRepository, "searchPlaylists").mockResolvedValue([mockPlaylistEntity]);
        });
      
        when(/^the searchPlaylists function is called with query word "(.*)"$/, async (queryWord) => {
          playlists = await playlistService.searchPlaylists(queryWord);
        });
      
        then(/^the returned playlists array must include a playlist with name "(.*)" and id "(.*)"$/, async (expectedName, expectedId) => {
          const foundPlaylist = playlists.find(playlist => playlist.name === expectedName && playlist.id === expectedId);
          expect(foundPlaylist).toBeDefined();
        });
      });

    test("Searching for a private playlist", ({ given, when, then }) => {
        let playlists: PlaylistEntity[];
      
        given(/^there's a playlist named "(.*)" and id "(.*)", that has the private atribute set to "(.*)" in the database$/, async (playlistName, playlistId, isPrivate) => {
            const mockPlaylistEntity = new PlaylistEntity({
                id: playlistId,
                name: playlistName,
                private: isPrivate === "true" ? true : false,
                songs: [], 
                createdBy: "3",
                followers: [], 
                contributors: [], 
            });
            jest.spyOn(mockPlaylistRepository, "searchPlaylists").mockResolvedValue([]);
        });
      
        when(/^the searchPlaylists function is called with query word "(.*)"$/, async (queryWord) => {
            playlists = await playlistService.searchPlaylists(queryWord);
            console.log(playlists)
        });
      
        then(/^the returned playlists array must not include a playlist with name "(.*)" and id "(.*)"$/, async (expectedName, expectedId) => {
            const foundPlaylist = playlists.find(playlist => playlist.name === expectedName && playlist.id === expectedId);
            expect(foundPlaylist).toBeUndefined();
        });
    });
    
      
});
