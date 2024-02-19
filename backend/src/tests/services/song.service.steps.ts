import { loadFeature, defineFeature } from 'jest-cucumber';
import PlaylistRepository from '../../src/repositories/playlist.repository';
import PlaylistEntity from '../../src/entities/playlist.entity';
import PlaylistService from '../../src/services/playlist.service';
import SongRepository from "../../src/repositories/song.repository";
import SongEntity from '../../src/entities/song.entity';
import SongService from '../../src/services/song.service';
import SongModel from '../../src/models/song.model';
import UserRepository from '../../src/repositories/user.repository';
import UserEntity from '../../src/entities/user.entity';
import UserModel from "../../src/models/user.model";
import UserService from '../../src/services/user.service';
import Injector from "../../src/di/injector";
import { di } from "../../src/di/index";
import { mock } from "node:test";

const feature = loadFeature("tests/features/song-service.feature");

defineFeature(feature, (test) => {
    // Mock do repositório

    let mockSongRepository: SongRepository;
    let songService: SongService;
    let userService: UserService;
    let mockSongModel : SongModel;
    let mockSongEntity: SongEntity;

    let injector: Injector = di;

    beforeEach(() => {

        injector.registerRepository(SongRepository, new SongRepository());
        mockSongRepository = injector.getRepository(SongRepository);
    
        injector.registerService(SongService, new SongService(mockSongRepository));
        songService = injector.getService(SongService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("Searching for a song by a string that is contained in the title", ({ given, when, then }) => {
        let songs: SongModel[];
    
        given(/^there's a song with name "(.*)", artist "(.*)" in the database$/, async (songName, artistName) => {
            const mockSongEntity = new SongEntity({
                id: "1",
                title: songName,
                duration: 180,
                artist: artistName,
                genre: "Pop",
                times_ever_played: 0,
            });
            jest.spyOn(mockSongRepository, "searchSongs").mockResolvedValue([mockSongEntity]);
        });
    
        when(/^the searchSongs function is called with query word "(.*)"$/, async (queryWord) => {
            songs = await songService.searchSongs(queryWord);
        });
    
        then(/^the returned songs array must include a song with name "(.*)" and artist "(.*)"$/, async (expectedName, expectedArtist) => {
            const foundSong = songs.find(song => song.title === expectedName && song.artist === expectedArtist);
            expect(foundSong).toBeDefined();
        });
    });
    

    test('Search for a song with a genre filter', ({ given, when, then }) => {
        let songs: SongModel[];
        given(/^there's a song with name "(.*)", artist "(.*)" and genre "(.*)" in the database$/, async (songName, artistName, genreName) => {
            const mockSongEntity = new SongEntity({
                id: "1",
                title: songName,
                duration: 180,
                artist: artistName,
                genre: genreName,
                times_ever_played: 0,
            });
            jest.spyOn(mockSongRepository, "searchSongs").mockResolvedValue([mockSongEntity]);
        });
    
        when(/^the searchSongs function is called with query word "(.*)" and filter "(.*)"$/, async (queryWord, filterGenre) => {
            songs = await songService.searchSongs(queryWord, filterGenre);
        });
    
        then(/^the returned songs array must include a song with name "(.*)", artist "(.*)" and genre "(.*)"$/, async (expectedName, expectedArtist, expectedGenre) => {
            const foundSong = songs.find(song => song.title === expectedName && song.artist === expectedArtist && song.genre === expectedGenre);
            expect(foundSong).toBeDefined();
        });
    });
    



});