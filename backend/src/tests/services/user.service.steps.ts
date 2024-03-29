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
import { HttpNotFoundError } from '../../src/utils/errors/http.error';
import Injector from "../../src/di/injector";
import { di } from "../../src/di/index";

const feature = loadFeature("tests/features/user-service.feature");

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

    test('obter usuário pelo email', ({ given, when, then }) => {
        let userEmail: string;
        let userEntity: UserEntity;
        let result: UserModel;

        given('existe um usuário de nome "Alfonso" e email "alfonso@gmail.com"', () => {
            userEmail = 'alfonso@gmail.com';
            userEntity = new UserEntity({ id:'1', name: 'Alfonso', email: userEmail, password:'123456', history_tracking: true });
            jest.spyOn(mockUserRepository, 'getUserByEmail').mockResolvedValueOnce(userEntity);
        });

        when(/^o método getUserByEmail é chamado com o email "(.*)"$/, async (email) => {
            result = await userService.getUserByEmail(userEmail);
        });

        then(/^o usuário retornado tem nome "(.*)"$/, (name) => {
            expect(result.name).toBe(name);
        });
    });

    test('obter todos os usuários', ({ given, when, then }) => {
        let usersEntity: UserEntity[];
        let result: UserModel[];

        given('existe um usuário de nome "Alfonso" cadastrado', () => {
            usersEntity = [new UserEntity({ id:'1', name: 'Alfonso', email: 'alfonso@gmail.com', password:'123456', history_tracking: true })];
            jest.spyOn(mockUserRepository, 'getUsers').mockResolvedValueOnce(usersEntity);
        });

        when('o método getUsers é chamado', async () => {
            result = await userService.getUsers();
        });

        then(/^o usuário de nome "(.*)" deve está na lista de usuários retornada$/, (name) => {
            const userNames = result.map(user => user.name);
            expect(userNames).toContain(name);
        });
    });

    test('excluir usuário', ({ given, when, then, and }) => {
        let userEmail: string;
        let userEntity: UserEntity;

        given('o método createUser foi chamado com o name "samanto" email "samanto@gmail.com" e senha "samanto123"', () => {
            userEmail = 'samanto@gmail.com';
            userEntity = new UserEntity({ id:'20', name: 'samanto', email: userEmail, password: 'samanto123', history_tracking: true });
            jest.spyOn(mockUserRepository, 'createUser').mockResolvedValueOnce(userEntity);
        });

        when(/^o método deleteUserWithEmailPassword é chamado com o email "(.*)" e senha "(.*)"$/, async () => {
            await userService.deleteUserWithEmailPassword(userEmail, 'samanto123');
        });

        then(/^o método getUserByEmail é chamado com o email "(.*)"$/, async (email) => {
            jest.spyOn(mockUserRepository, 'getUserByEmail').mockResolvedValueOnce(null);
            await expect(userService.getUserByEmail(email)).rejects.toThrow(HttpNotFoundError);
        });

        and('é retornada a mensagem "user_not_found"', () => {
            // Handled in previous step
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
        });
    
        then(/^the user returned must have id "(.*)", name "(.*)", email "(.*)" and history_tracking set to "(.*)"$/, async (expectedId, expectedName, expectedEmail, expectedHistoryTracking) => {
            const expectedUser = new UserModel({                
                id: expectedId,
                name: expectedName,
                email: expectedEmail,
                password:"caladothiago",
                history_tracking: expectedHistoryTracking === "true" ? true : false,
            })

            expect(user).toEqual(expectedUser);

        });
    });
});
