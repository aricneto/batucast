import SongRepository from '../../src/repositories/song.repository';
import SongEntity from '../../src/entities/song.entity';
import SongService from '../../src/services/song.service';

describe('HistoryService', () => {

  let mockSongRepository: SongRepository;
  let service: SongService;

  let mockSongEntity: SongEntity = new SongEntity({
    id: '1',
    title: 'Example Song',
    duration: 240,
    artist: 'Artist Name',
    genre: 'Pop',
    times_ever_played: 100,
  });

  beforeEach(() => {
    mockSongRepository = {
      getSong: jest.fn(),
      searchSongs: jest.fn().mockResolvedValue([mockSongEntity]), // Mocking the searchSongs function here
    } as any;
    
    service = new SongService(mockSongRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should search songs without filter', async () => {
    const keyword = 'example';

    const result = await service.searchSongs(keyword);

    expect(mockSongRepository.searchSongs).toHaveBeenCalledWith(keyword);
    expect(result).toEqual([mockSongEntity]);
  });

  it('should search songs with filter', async () => {
    const keyword = 'example';
    const filter = 'Pop';

    const result = await service.searchSongs(keyword, filter);

    expect(mockSongRepository.searchSongs).toHaveBeenCalledWith(keyword, filter);
    expect(result).toEqual([mockSongEntity]);
  });
});
