import HistoryEntity from '../../src/entities/history.entity';
import HistoryModel from '../../src/models/history.model';
import MostPlayedModel from '../../src/models/most_played.model';
import HistoryRepository from '../../src/repositories/history.repository';
import SongRepository from '../../src/repositories/song.repository';
import SongEntity from '../../src/entities/song.entity';
import HistoryService from '../../src/services/history.service';
import { HttpNotFoundError } from '../../src/utils/errors/http.error';
import UserRepository from '../../src/repositories/user.repository';

describe('HistoryService', () => {
  let mockHistoryRepository: HistoryRepository;
  let mockUserRepository: UserRepository;
  let mockSongRepository: SongRepository;
  let service: HistoryService;

  let mockHistoryEntity: HistoryEntity = new HistoryEntity({
    id: '123',
    user_id: '456',
    song_id: '789',
  });

  let mockHistoryModel: HistoryModel = new HistoryModel(mockHistoryEntity);

  beforeEach(() => {
    mockHistoryRepository = {
      getHistories: jest.fn(),
      getHistory: jest.fn(),
      createHistory: jest.fn(),
      updateHistory: jest.fn(),
      deleteHistory: jest.fn(),
      deleteUserHistory: jest.fn(),
    } as any;

    mockUserRepository = {
      getUser: jest.fn(),
    } as any;

    mockSongRepository = {
      getSong: jest.fn(),
    } as any;

    service = new HistoryService(mockHistoryRepository, mockUserRepository, mockSongRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return all histories', async () => {
    jest
      .spyOn(mockHistoryRepository, 'getHistories')
      .mockResolvedValue([mockHistoryEntity]);

    const histories = await service.getHistories();

    expect(histories).toEqual([mockHistoryModel]);
    expect(mockHistoryRepository.getHistories).toBeCalledTimes(1);
  });

  it('should return user histories', async () => {
    const id = '456';

    jest
      .spyOn(mockHistoryRepository, 'getHistories')
      .mockResolvedValue([mockHistoryEntity]);

    const histories = await service.getUserHistory(id);

    expect(histories).toEqual([mockHistoryModel]);
    expect(mockHistoryRepository.getHistories).toBeCalledTimes(1);
  });

  it('should return user most played songs', async () => {
    const id = '456';

    jest
      .spyOn(mockHistoryRepository, 'getHistories')
      .mockResolvedValue([mockHistoryEntity]);

    jest
      .spyOn(mockSongRepository, 'getSong')
      .mockResolvedValue(new SongEntity({ title: 'Test Song', duration: 4, artist: 'Spongebob', genre: 'Rock', id: '789', times_ever_played: 12}));

    const mostPlayed = await service.getUserMostPlayedList(id);

    expect(mostPlayed).toEqual([
      new MostPlayedModel({
        song_id: '789',
        song_name: 'Test Song',
        song_duration: 4,
        song_genre: 'Rock',
        times_played: 1,
      }),
    ]);
    expect(mockHistoryRepository.getHistories).toBeCalledTimes(1);
    expect(mockSongRepository.getSong).toBeCalledTimes(1);
  });

  it('should return a history by id', async () => {
    const id = '123';

    jest
      .spyOn(mockHistoryRepository, 'getHistory')
      .mockResolvedValue(mockHistoryEntity);

    const history = await service.getHistory(id);

    expect(history).toEqual(mockHistoryModel);
    expect(mockHistoryRepository.getHistory).toBeCalledWith(id);
  });

  it('should throw an error when history is not found', async () => {
    const id = '123';

    jest.spyOn(mockHistoryRepository, 'getHistory').mockResolvedValue(null);

    await expect(service.getHistory(id)).rejects.toThrow(HttpNotFoundError);
    expect(mockHistoryRepository.getHistory).toBeCalledWith(id);
  });

  it('should create a history', async () => {
    jest
      .spyOn(mockHistoryRepository, 'createHistory')
      .mockResolvedValue(mockHistoryEntity);

    const data: HistoryEntity = new HistoryEntity({
      id: "12",
      user_id: '456',
      song_id: '789',
    });

    const history = await service.createHistory(data);

    expect(history).toEqual(mockHistoryModel);
    expect(mockHistoryRepository.createHistory).toBeCalledWith(data);
  });

  it('should update a history', async () => {
    const id = '123';

    jest
      .spyOn(mockHistoryRepository, 'updateHistory')
      .mockResolvedValue(mockHistoryEntity);

    const data: HistoryEntity = {
      id: "12",
      user_id: '456',
      song_id: '789',
    };

    const updatedHistory = await service.updateHistory(id, data);

    expect(updatedHistory).toEqual(mockHistoryModel);
    expect(mockHistoryRepository.updateHistory).toBeCalledWith(id, data);
  });

  it('should delete a history', async () => {
    const id = '123';
    await service.deleteHistory(id);

    expect(mockHistoryRepository.deleteHistory).toBeCalledWith(id);
  });

  it('should delete user histories', async () => {
    const id = '456';
    await service.deleteUserHistory(id);

    expect(mockHistoryRepository.deleteUserHistory).toBeCalledWith(id);
  });

  it('should return user histories', async () => {

    const id = '456';
    const mockHistories: HistoryEntity[] = [
      { id: '1', user_id: '456', song_id: '789' },
      { id: '2', user_id: '456', song_id: '890' },
      { id: '3', user_id: '789', song_id: '123' }, 
    ];
    const expectedHistories: HistoryModel[] = [
      { id: '1', user_id: '456', song_id: '789' },
      { id: '2', user_id: '456', song_id: '890' },
    ];

    jest.spyOn(mockHistoryRepository, 'getHistories').mockResolvedValue(mockHistories);

    const result = await service.getUserHistory(id);

    expect(result).toEqual(expectedHistories);
    expect(mockHistoryRepository.getHistories).toHaveBeenCalledTimes(1);
  });

});
