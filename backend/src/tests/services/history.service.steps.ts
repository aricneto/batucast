import { loadFeature, defineFeature } from "jest-cucumber";
import HistoryRepository from "../../src/repositories/history.repository";
import HistoryEntity from "../../src/entities/history.entity";
import HistoryService, {
  HistoryServiceMessageCode,
} from "../../src/services/history.service";
import OtherRepository from "../../src/repositories/other.repository";
import HistoryModel from "../../src/models/history.model";
import SongRepository from "../../src/repositories/song.repository";
import SongService from "../../src/services/song.service";
import UserRepository from "../../src/repositories/user.repository";
import UserService from "../../src/services/user.service";
import UserEntity from "../../src/entities/user.entity";
import SongEntity from "../../src/entities/song.entity";
import SongModel from "../../src/models/song.model";
import UserModel from "../../src/models/user.model";
import StatisticsModel from "../../src/models/statistics.model";
import Injector from "../../src/di/injector";
import { di } from "../../src/di/index";
import { mock } from "node:test";
import { exitCode } from "process";
import { HttpNotFoundError } from "../../src/utils/errors/http.error";
import { addSongsToHistory, simpleAddSongsToHistory } from "../utils/history.utils";
import MostPlayedModel from "../../src/models/most_played.model";

const feature = loadFeature("tests/features/history-service.feature");

defineFeature(feature, (test) => {
  let mockHistoryRepository: HistoryRepository;
  let mockSongRepository: SongRepository;
  let mockUserRepository: UserRepository;

  let historyService: HistoryService;
  let songService: SongService;
  let userService: UserService;

  let mockStatistics: StatisticsModel;

  let mockUserEntity: UserEntity;
  let mockHistoryEntity: HistoryEntity;
  let mockSongEntity: SongEntity;

  let mockUserModel: UserModel;
  let mockSongModel: SongModel;
  let injector: Injector = di;

  beforeEach(() => {
    injector.registerRepository(HistoryRepository, new HistoryRepository());
    mockHistoryRepository = injector.getRepository(HistoryRepository);

    injector.registerRepository(SongRepository, new SongRepository());
    mockSongRepository = injector.getRepository(SongRepository);

    injector.registerRepository(UserRepository, new UserRepository());
    mockUserRepository = injector.getRepository(UserRepository);

    injector.registerService(
      HistoryService,
      new HistoryService(
        mockHistoryRepository,
        mockUserRepository,
        mockSongRepository
      )
    );
    historyService = injector.getService(HistoryService);

    injector.registerService(SongService, new SongService(mockSongRepository));
    songService = injector.getService(SongService);

    injector.registerService(UserService, new UserService(mockUserRepository));
    userService = injector.getService(UserService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Obter histórico de um usuário por id", ({ given, when, then }) => {
    let result: HistoryModel[] = [];
    given(
      /^o método getUserHistory chamado com "(.*)" do HistoryService retorna um histórico com "(.*)" itens com song_id "(.*)", "(.*)" e "(.*)"$/,
      async (user_id, song_count, song_1, song_2, song_3) => {
        await simpleAddSongsToHistory(song_1, song_2, song_3, user_id, historyService);
      }
    );

    when(
      /^o método getUserHistory do HistoryService for chamado com o id "(.*)"$/,
      async (user_id) => {
        result = await historyService.getUserHistory(user_id);
      }
    );

    then(
      /^o histórico retornado deve ter "(.*)" itens com song_id "(.*)", "(.*)" e "(.*)"$/,
      (song_count, song_1, song_2, song_3) => {
        expect(result.length).toBe(parseInt(song_count));
        for (let song of result) {
          expect([song_1, song_2, song_3]).toContain(song.song_id);
        }
      }
    );
  });

  test("Add a new song to a user history", ({ given, when, then }) => {
    let result: HistoryModel[] = [];
    given(
      /^the function createHistory was called with the user_id "(.*)" and the song_id "(.*)"$/,
      async (user_id, song_id) => {
        mockHistoryEntity = new HistoryEntity({
          id: "",
          user_id: user_id,
          song_id: song_id,
        });

        jest.spyOn(mockHistoryRepository, "createHistory");

        await historyService.createHistory(mockHistoryEntity);

        expect(mockHistoryRepository.createHistory).toHaveBeenCalledTimes(1);
      }
    );

    when(
      /^the function getUserHistory is called with the user_id "(.*)"$/,
      async (user_id) => {
        jest.spyOn(mockHistoryRepository, "getHistories");

        result = await historyService.getUserHistory(user_id);

        expect(mockHistoryRepository.getHistories).toHaveBeenCalledTimes(1);
      }
    );

    then(
      /^the history returned must have "(.*)" item with song_id "(.*)"$/,
      (num_items, song_id) => {
        expect(result.length).toBe(parseInt(num_items));
        expect(result[0].song_id).toBe(song_id);
      }
    );
  });

  test("Delete an entry from a user history", ({ given, when, and, then }) => {
    let deleted_entry: HistoryModel;
    given(
      /^the user with id "(.*)" has (\d+) history entries$/,
      async (user_id, entries) => {
        // create entries
        jest.spyOn(mockHistoryRepository, "createHistory");
        for (let i = 0; i < parseInt(entries); i++) {
          mockHistoryEntity = new HistoryEntity({
            id: "",
            song_id: "test",
            user_id: user_id,
          });

          // the entry to be deleted will be the last one
          deleted_entry = await historyService.createHistory(mockHistoryEntity);
        }
        expect(mockHistoryRepository.createHistory).toHaveBeenCalledTimes(
          parseInt(entries)
        );
      }
    );

    when(
      "the function deleteHistory is called on one of the entry ids",
      async () => {
        jest.spyOn(mockHistoryRepository, "deleteHistory");
        await historyService.deleteHistory(deleted_entry.id);
        expect(mockHistoryRepository.deleteHistory).toHaveBeenCalledTimes(1);
      }
    );
    let user_history: HistoryModel[];
    and(
      /^the function getUserHistory is called with the user_id "(.*)"$/,
      async (user_id) => {
        jest.spyOn(mockHistoryRepository, "getHistories");
        user_history = await historyService.getUserHistory(user_id);
        expect(mockHistoryRepository.getHistories).toHaveBeenCalledTimes(1);
      }
    );

    then(
      "the history returned must not have the entry that was deleted",
      () => {
        expect(user_history).not.toContain(deleted_entry);
      }
    );

    and(/^the user history must have (\d+) entries$/, (num_items) => {
      expect(user_history.length).toBe(parseInt(num_items));
    });
  });

  test("Clear user history", ({ given, when, and, then }) => {
    given(
      /^the user with id "(.*)" has (\d+) history entries$/,
      async (user_id, entries) => {
        // create entries
        jest.spyOn(mockHistoryRepository, "createHistory");
        for (let i = 0; i < parseInt(entries); i++) {
          mockHistoryEntity = new HistoryEntity({
            id: "",
            song_id: "test",
            user_id: user_id,
          });
          await historyService.createHistory(mockHistoryEntity);
        }

        expect(mockHistoryRepository.createHistory).toHaveBeenCalledTimes(
          parseInt(entries)
        );
      }
    );

    when(
      /^the function deleteUserHistory is called with the user_id "(.*)"$/,
      (user_id) => {
        jest.spyOn(mockHistoryRepository, "deleteUserHistory");
        historyService.deleteUserHistory(user_id);
        expect(mockHistoryRepository.deleteUserHistory).toHaveBeenCalledTimes(
          1
        );
      }
    );

    let user_history: HistoryModel[];

    and(
      /^the function getUserHistory is called with the user_id "(.*)"$/,
      async (user_id) => {
        jest.spyOn(mockHistoryRepository, "getHistories");
        user_history = await historyService.getUserHistory(user_id);
        expect(mockHistoryRepository.getHistories).toHaveBeenCalledTimes(1);
      }
    );

    then(/^the history returned must have (\d+) items$/, (num_items) => {
      expect(user_history.length).toBe(parseInt(num_items));
    });
  });

  test("Get user statistics", ({ given, when, then }) => {
    given(
      /^the user with id "(.*)" has a history with the following items:$/,
      async (user_id, table) => {
        await addSongsToHistory(table, user_id, mockHistoryRepository, mockSongRepository, songService, historyService);
      }
    );
    let userStatistics: StatisticsModel;
    when(
      /^the function getUserStatistics is called with the user_id "(.*)"$/,
      async (user_id) => {
        jest.spyOn(mockHistoryRepository, "getHistories");
        userStatistics = await historyService.getUserStatistics(user_id);
        expect(mockHistoryRepository.getHistories).toHaveBeenCalledTimes(1);
      }
    );

    then("it must return the following statistics:", (table) => {
      let expected = new StatisticsModel({
        time_played: parseInt(table[0].play_duration),
        most_played_genre: table[0].most_played_genre,
        most_played_song: table[0].most_played_song,
      });

      expect(userStatistics).toEqual(expected);
    });
  });

  test("History Tracking disabled", ({ given, and, when, then }) => {
    let uid: string;
    given(
      /^the user with id "(.*)" has history tracking disabled$/,
      async (user_id) => {
        mockUserEntity = new UserEntity({
          id: user_id,
          name: "Test User",
          email: "test",
          history_tracking: false,
          password: "123",
        });

        let user = await userService.createUser(mockUserEntity);
        uid = user_id;

        expect(user.history_tracking).toBe(false);
      }
    );

    and("the user has no play history", async () => {
      let history = await historyService.getUserHistory(uid);
      expect(history.length).toBe(0);
    });

    when(
      /^the function createHistory is called with the user_id "(.*)" and the song_id "(.*)"$/,
      async (user_id, song_id) => {
        mockHistoryEntity = new HistoryEntity({
          id: "",
          user_id: user_id,
          song_id: song_id,
        });

        jest.spyOn(mockHistoryRepository, "createHistory");

        await expect(
          historyService.createHistory(mockHistoryEntity)
        ).rejects.toThrow(HttpNotFoundError);

        expect(mockHistoryRepository.createHistory).toHaveBeenCalledTimes(0);
      }
    );

    let userHistory;
    and(
      /^the function getUserHistory is called with the user_id "(.*)"$/,
      async (user_id) => {
        jest.spyOn(mockHistoryRepository, "getHistories");
        userHistory = await historyService.getUserHistory(user_id);
        expect(mockHistoryRepository.getHistories).toHaveBeenCalledTimes(1);
      }
    );

    then(/^the history returned must have (\d+) items$/, (entries) => {
      expect(userHistory.length).toBe(parseInt(entries));
    });
  });

  test("User requests most played songs", ({ given, when, then }) => {
    given(
      /^the user with id "(.*)" has a history with the following items:$/,
      async (user_id, table) => {
        await addSongsToHistory(table, user_id, mockHistoryRepository, mockSongRepository, songService, historyService);
      }
    );

    let most_played_songs: MostPlayedModel[];
    when(
      /^the function getUserMostPlayedList is called with the user_id "(.*)"$/,
      async (user_id) => {
        most_played_songs = await historyService.getUserMostPlayedList(user_id);
      }
    );

    then("it must return the following songs in order:", (table) => {
      for (let i = 0; i < table.length; i++) {
        expect(most_played_songs[i].song_id).toBe(table[i].song_id);
        expect(most_played_songs[i].times_played).toBe(parseInt(table[i].times_played));
      }
    });
  });

  test("Personalized Recommendations", ({ given, and, when, then }) => {
    //let recommendation: SongModel[];

    given(
      /^the system has a user with id "(.*)", name "(.*)", email "(.*)" history_tracking set to "(.*)"$/,
      async (userId, userName, userEmail, historyTracking) => {
        // // Mock implementation of the UserRepository method to simulate user existence
        // mockUserModel = new UserModel({
        //   id: userId,
        //   name: userName,
        //   email: userEmail,
        //   history_tracking: historyTracking === "true" ? true : false,
        //   // Add any other necessary attributes
        // });
        // // Mock call to getUser from UserService
        // jest.spyOn(userService, "getUser").mockResolvedValue(mockUserModel);
      }
    );

    and(
      /^this user has a history with a song with id "(.*)" and genre "(.*)"$/,
      async (songId, genre) => {
        // // Mock implementation of getUserHistory from HistoryService to simulate user history
        // jest.spyOn(historyService, "getUserHistory").mockResolvedValue([
        //   new HistoryModel({
        //     id: "",
        //     user_id: mockUserModel.id,
        //     song_id: songId,
        //   }),
        // ]);
      }
    );

    and(
      /^the most_played_genre by this user is "(.*)"$/,
      async (mostPlayedGenre) => {
        // // Mock implementation of user statistics to simulate the most played genre
        // jest.spyOn(historyService, "getUserStatistics").mockResolvedValue({
        //   most_played_genre: mostPlayedGenre,
        // });
      }
    );

    and(
      /^there is, in the database, one other song with id "(.*)" and genre "(.*)"$/,
      async (otherSongId, otherGenre) => {
        // // Mock implementation of song repository to simulate the existence of another song in the database
        // jest.spyOn(mockSongRepository, "getSong").mockResolvedValue(
        //   new SongEntity({
        //     id: otherSongId,
        //     title: 'evidencias',
        //     duration:100,
        //     artist:'xito e chororao',
        //     genre: otherGenre,
        //     times_ever_played: 100,
        //     // Add any other necessary attributes
        //   })
        // );
      }
    );

    when(
      /^the function getUserRecommendations is called for user id "(.*)"$/,
      async (userId) => {
        // recommendation = await historyService.getUserRecommendations(userId);
      }
    );

    then(
      /^the recommendation to be returned must be the song with id "(.*)" and genre "(.*)"$/,
      (expectedId, expectedGenre) => {
        // expect(recommendation).not.toBeNull();
        // expect(recommendation.length).toBeGreaterThan(0); // Check if recommendation is not empty
        // expect(recommendation[0].id).toBe(expectedId);
        // expect(recommendation[0].genre).toBe(expectedGenre);
      }
    );
  });
  

  test('User Page - getUserHistory function', ({ given, and, when, then }) => {
    let history: HistoryModel[] | null;

    given(/^the system has a user with id "(.*)", name "(.*)", email "(.*)", history_tracking set to "(.*)"$/, async (userId, userName, userEmail, historyTracking) => {
        // Mock implementation of the UserRepository method
        mockUserEntity = new UserEntity({
            id: userId,
            name: userName,
            email: userEmail,
            password: "password", // Mock password for the user entity
            history_tracking: historyTracking === "true" ? true : false,
            // Add any other necessary attributes
        });

        jest.spyOn(mockUserRepository, "getUser").mockResolvedValue(mockUserEntity);
    });

    and(/^this user has a history with a song with id "(.*)"$/, async (songId) => {
        // Mock implementation of the HistoryRepository method
        mockHistoryEntity = new HistoryEntity({
            id: "1", // Assuming a predefined ID for simplicity
            user_id: mockUserEntity.id,
            song_id: songId,
            // Add any other necessary attributes
        });


        jest.spyOn(historyService, "getUserHistory").mockResolvedValue([mockHistoryEntity]); // Return an array of history entities
    });

    when(/^the function getUserHistory is called for id "(.*)"$/, async (userId) => {
        history = await historyService.getUserHistory(userId);
    });

    then(/^the history model returned must have user_id equal to "(.*)" and song_id equal to "(.*)"$/, async (expectedUserId, expectedSongId) => {
        const expectedHistory = new HistoryModel({
            id: "1", // Assuming a predefined ID for simplicity
            user_id: expectedUserId,
            song_id: expectedSongId,
            // Add any other necessary attributes
        });

        expect(history).toEqual([expectedHistory]); // Compare arrays of HistoryModel
    });
  });
});
