import { loadFeature, defineFeature } from 'jest-cucumber';
import supertest from 'supertest';
import app from '../../src/app';
import PlaylistRepository from '../../src/repositories/playlist.repository';
import PlaylistEntity from '../../src/entities/playlist.entity';
import PlaylistService from '../../src/services/playlist.service';
import UserEntity from "../../src/entities/user.entity";
import SongRepository from "../../src/repositories/song.repository";
import SongService from '../../src/services/song.service';
import UserRepository from '../../src/repositories/user.repository';
import UserService from '../../src/services/user.service';
import UserModel from '../../src/models/user.model';
import Injector from "../../src/di/injector";
import { di } from "../../src/di/index";

const feature = loadFeature('tests/features/user-service.feature');
const request = supertest(app);

defineFeature(feature, (test) => {
    // Mock do repositório
    let mockPlaylistRepository: PlaylistRepository;
    let mockSongRepository: SongRepository;
    let songService: SongService;
    let mockUserRepository: UserRepository;
    let userService: UserService;
    let playlistService: PlaylistService;

    let mockPlaylistEntity: PlaylistEntity;
    let mockUserEntity: UserEntity;

    let response: supertest.Response;

    let mockUserModel: UserModel;

    let injector: Injector = di;

    beforeEach(() => {

    
        injector.registerRepository(SongRepository, new SongRepository());
        mockSongRepository = injector.getRepository(SongRepository);
    
        injector.registerRepository(UserRepository, new UserRepository());
        mockUserRepository = injector.getRepository(UserRepository);
       
        injector.registerService(SongService, new SongService(mockSongRepository));
        songService = injector.getService(SongService);
    
        injector.registerService(UserService, new UserService(mockUserRepository));
        userService = injector.getService(UserService);
      });
    
      afterEach(() => {
        jest.resetAllMocks();
      });

    test('Registration successful', ({ given, when, then }) => {
        given('the system does not have an account with the email “ze@gmail.com” registered', () => {
            
        });

        when(/^a "(.*)" request was sent to "(.*)" with the request body being a JSON with name "(.*)" email "(.*)" and password "(.*)"$/, (arg0, arg1, arg2, arg3, arg4) => {
        });

        then(/^the system registers the new email account “ze@gmail.com” and password “ze(\d+)”$/, (arg0) => {

        });
    });

    test('Login successful', ({ given, when, then, and }) => {
        given(/^the system has the account with email “ze@gmail.com” and password “ze(\d+)” registered$/, (arg0) => {

        });

        when(/^a GET request was sent to "(.*)" with the request body being a JSON with email "(.*)" and password "(.*)"$/, (arg0, arg1, arg2) => {

        });

        then(/^the response status should be "(.*)"$/, (arg0) => {

        });

        and(/^the user with email "(.*)" is logged in$/, (arg0) => {

        });
    });

    test('Delete user', ({ given, when, and, then }) => {
        given(/^the system has the account with email “ze@gmail.com” and password “ze(\d+)” registered$/, (arg0) => {

        });

        when(/^the system receives a request to delete the account with email "(.*)" and password "(.*)"$/, (arg0, arg1) => {

        });

        and(/^the system deletes the email account "(.*)"$/, (arg0) => {

        });

        then(/^the system does not have the email account "(.*)" registered$/, (arg0) => {

        });
    });

    test('Update user', ({ given, when, then }) => {
        given(/^the system has the account with email “ze@gmail.com” and password “ze(\d+)” registered$/, (arg0) => {

        });

        when(/^a PUT request is sent to "(.*)" with the request body being a JSON with email "(.*)" and password "(.*)"$/, (arg0, arg1, arg2) => {

        });

        then(/^the response status should be "(.*)"$/, (arg0) => {

        });
    });

    test('Unsuccessful registration', ({ given, when, then }) => {
        given('the system has an account with the email “ze@gmail.com” registered', () => {

        });

        when(/^a POST request was sent to "(.*)" with the request body being a JSON with name "(.*)" email "(.*)" and password "(.*)"$/, (arg0, arg1, arg2, arg3) => { 

        });

        then(/^the system registers the new email account “ze@gmail.com” and password “ze(\d+)”$/, (arg0) => {

        });
    });

    test('Unsuccessful login', ({ given, when, then, and }) => {
        given(/^the system has the account with email “ze@gmail.com” and password “ze(\d+)” registered$/, (arg0) => {

        });

        when(/^a GET request was sent to "(.*)" with the request body being a JSON with email "(.*)" and password "(.*)"$/, (arg0, arg1, arg2) => {

        });

        then(/^the response status should be "(.*)"$/, (arg0) => {

        });

        and(/^the user with email "(.*)" is logged in$/, (arg0) => {

        });
    });

    test('User Page - getUser function', ({ given, when, then }) => {
        let user: UserModel | null;
    
        given(/^the system has a user with id "(.*)", name "(.*)", email "(.*)" and history_tracking set to "(.*)"$/, async (userId, userName, userEmail, historyTracking) => {
            // Mock implementation of the UserRepository method
            mockUserModel = new UserModel({
                id: userId,
                name: userName,
                email: userEmail,
                history_tracking: historyTracking === "true" ? true : false,
                // Add any other necessary attributes
            });

            mockUserEntity = new UserEntity({
                id: userId,
                name: userName,
                email: userEmail,
                password:"caladothiago",
                history_tracking: historyTracking === "true" ? true : false,
            });
            /// ta dando problema aqui: diz que tá lendo um valor indefinido
            jest.spyOn(mockUserRepository, "getUser").mockResolvedValue(mockUserEntity);
            
        });
    
        when(/^the function getUser is called for id "(.*)"$/, async (userId) => {
            user = await userService.getUser(userId);
            console.log(user);
        });
    
        then(/^the user returned must have id "(.*)", name "(.*)", email "(.*)" and history_tracking set to "(.*)"$/, async (expectedId, expectedName, expectedEmail, expectedHistoryTracking) => {
            const expectedUser = new UserModel({                
                id: expectedId,
                name: expectedName,
                email: expectedEmail,
                history_tracking: expectedHistoryTracking === "true" ? true : false,
            })

            expect(user).toStrictEqual(expectedUser);

        });
    });
});