import app from '../../src/app';
import { di } from '../../src/di';
import supertest from 'supertest';
import SongRepository from '../../src/repositories/song.repository';
import HotPageService from '../../src/services/hotPage.service';

describe('HotPageController', () => {
    let request = supertest(app);
    let mockHotSongsRepository: SongRepository;
    let hotPageService: HotPageService;

    const mockedGenre: string = "MPB";

    beforeEach(() => {
        mockHotSongsRepository = di.getRepository(SongRepository);
        hotPageService = di.getService(HotPageService);
      });

    afterEach(() => {
        jest.resetAllMocks();
    })

    it('should return the top 5 songs', async () => {
        const response = await request.get("/api/hot")

        expect(response.status).toBe(200);
    })
    it(`should return the top 5 songs of the genre ${mockedGenre}`, async () => {
        const response = await request.get(`/api/hot?genre=${mockedGenre}`)

        expect(response.status).toBe(200);
    })
    it('should throw an error when genre does not exist', async () => {
        const response = await request.get('/api/hot?genre=tiponaoexistente').send();
        
        expect(response.status).toBe(404);
    })
})