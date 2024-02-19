import app from '../../src/app';
import { di } from '../../src/di';
import supertest from 'supertest';
import SongRepository from '../../src/repositories/song.repository';
import SongEntity from '../../src/entities/song.entity';
import HotPageService from '../../src/services/hotPage.service';
import { HttpNotFoundError } from '../../src/utils/errors/http.error';
import SongService from '../../src/services/song.service';

interface HotPageServiceWithRepository extends HotPageService, SongRepository {}

describe('HotPageController', () => {
    let request = supertest(app);
    let mockHotSongsRepository: HotPageService;
    let hotPageService: HotPageService;
    let songService: SongService;

    const mockedGenre: string = "MPB";
  
    let mockSongRepository: SongRepository;

    beforeEach(() => {
        mockHotSongsRepository = di.getRepository(HotPageService);
        hotPageService = di.getService(HotPageService);

        mockSongRepository = {
            getSongs: jest.fn()
        } as any;

        mockHotSongsRepository = {
            getHotSongs: jest.fn(),
          } as any;


        songService = new SongService(mockSongRepository);
      });

    afterEach(() => {
        jest.resetAllMocks();
    })

    it('should return the top 5 songs', async () => {
        const hotSongs = await hotPageService.getHotSongs();
        const response = await request.get("/api/hot")

        expect(response.body.data).toEqual(hotSongs);
    })
    it(`should return the top 5 songs of the genre ${mockedGenre}`, async () => {
        const hotSongsFiltered = await hotPageService.getHotSongs(mockedGenre);
        const response = await request.get(`/api/hot?genre=${mockedGenre}`)

        expect(response.body.data).toEqual(hotSongsFiltered);
    })
    it('should throw an error when genre does not exist', async () => {
        const response = await request.get('/api/hot?genre=tiponaoexistente').send();
        const result = response.body.msgCode;
        
        expect(result).toEqual('hotPage_not_found');
    })
     it('should throw an error when there are no songs registered', async () => {
        jest.spyOn(mockSongRepository, 'getSongs').mockResolvedValue([]);

        await expect(songService.getSongs()).resolves.toEqual([]);
    })
})