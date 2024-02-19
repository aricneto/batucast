import { Router, Request, Response } from "express";
import { Result, SuccessResult } from "../utils/result";
import SongService from "../services/song.service";
import SongEntity from "../entities/song.entity";

class SongController {
  private prefix: string = "/songs";
  private search: string = "/search";
  public router: Router;
  private songService: SongService;

  constructor(router: Router, songService: SongService) {
    this.router = router;
    this.songService = songService;
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(
      `/feed${this.search}${this.prefix}`,
      (req: Request, res: Response) => this.searchSongs(req, res)
    );

    this.router.get(this.prefix, (req: Request, res: Response) =>
      this.getSongs(req, res)
    );

    this.router.get(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.getSong(req, res)
    );

    this.router.post(this.prefix, (req: Request, res: Response) =>
      this.createSong(req, res)
    );
    this.router.put(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.updateSong(req, res)
    );
    this.router.delete(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.deleteSong(req, res)
    );
  }

  private async getSongs(req: Request, res: Response) {
    const songs = await this.songService.getSongs();

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: songs,
    }).handle(res);
  }

  private async getSong(req: Request, res: Response) {
    const song = await this.songService.getSong(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: song,
    }).handle(res);
  }

  private async searchSongs(req: Request, res: Response) {
    const keyword: string = req.query.keyword as string;
    const filter: string = req.query.filter as string;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    let songs;
    if (filter) {
      songs = await this.songService.searchSongs(keyword, filter);
    } else {
      songs = await this.songService.searchSongs(keyword);
    }

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: songs,
    }).handle(res);
  }

  private async createSong(req: Request, res: Response) {
    const song = await this.songService.createSong(new SongEntity(req.body));

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: song,
    }).handle(res);
  }

  private async updateSong(req: Request, res: Response) {
    const song = await this.songService.updateSong(
      req.params.id,
      new SongEntity(req.body)
    );

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: song,
    }).handle(res);
  }

  private async deleteSong(req: Request, res: Response) {
    await this.songService.deleteSong(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
    }).handle(res);
  }
}

export default SongController;
