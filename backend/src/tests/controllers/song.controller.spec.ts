import supertest from 'supertest';
import SongEntity from '../../src/entities/song.entity';
import app from '../../src/app';
import { di } from '../../src/di';
import SongRepository from '../../src/repositories/song.repository';
import SongService from '../../src/services/song.service';

describe('SongController', () => {
  let request = supertest(app);
  let mockSongRepository: SongRepository;
  let songService: SongService;

  let mockSongEntity: SongEntity = new SongEntity (      {
    id: '2',
    title: 'Watermelon', 
    duration: 23,        
    artist: 'Spongebob', 
    genre: 'MPB',        
    times_ever_played: 30
  });
  

  beforeEach(() => {
    mockSongRepository = di.getRepository(SongRepository);
    songService = di.getService(SongService);
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return a song by the keyword query', async () => {

    const response = await request.get(`/api/feed/search/songs/?keyword=water`);
    expect(response.status).toBe(200);
    expect(response.body.data).toContainEqual(mockSongEntity);
  });

  it('should return a song by the keyword query and filter query', async () => {

    const response = await request.get(`/api/feed/search/songs/?keyword=water&filter=mPb`);
    expect(response.status).toBe(200);
    expect(response.body.data).toContainEqual(mockSongEntity);
  });
});