import { Router, Request, Response } from "express";
import { Result, SuccessResult } from "../utils/result";
import HistoryService from "../services/history.service";
import HistoryEntity from "../entities/history.entity";

class HistoryController {
  private prefix: string = "/user";
  private hot: string = "/hot";
  private statistics: string = "/statistics";
  private recommendations: string = "/recommendations";
  private suffix: string = "/history";
  public router: Router;
  private historyService: HistoryService;

  constructor(router: Router, historyService: HistoryService) {
    this.router = router;
    this.historyService = historyService;
    this.initRoutes();
  }

  // id is USER id
  private initRoutes() {
    // GET all histories
    // /histories
    this.router.get(`/histories`, (req: Request, res: Response) =>
      this.getHistories(req, res)
    );

    // GET history by id
    // /history/:id
    this.router.get(`${this.suffix}/:id`, (req: Request, res: Response) =>
      this.getHistoryById(req, res)
    );

    // GET user history
    // /user/:id/history
    this.router.get(
      `${this.prefix}/:id${this.suffix}`,
      (req: Request, res: Response) => this.getUserHistory(req, res)
    );

    // GET most played
    // /user/:id/hot
    this.router.get(
      `${this.prefix}/:id${this.hot}`,
      (req: Request, res: Response) => this.getUserMostPlayed(req, res)
    );

    // GET statistics
    // /user/:id/statistics
    this.router.get(
      `${this.prefix}/:id${this.statistics}`,
      (req: Request, res: Response) => this.getUserStatistics(req, res)
    );

    this.router.get(
      `/feed${this.prefix}/:id${this.recommendations}`,
      (req: Request, res: Response) => this.getUserRecommendations(req, res)
    );

    // CREATE user history
    // /history
    this.router.post(this.suffix, (req: Request, res: Response) =>
      this.createHistory(req, res)
    );

    // DELETE history entry
    // /history/:id
    this.router.delete(`${this.suffix}/:id`, (req: Request, res: Response) =>
      this.deleteHistory(req, res)
    );

    // DELETE and CLEAR user history
    // /user/:id/history/clear
    this.router.delete(
      `${this.prefix}/:id${this.suffix}/clear`,
      (req: Request, res: Response) => this.deleteUserHistory(req, res)
    );
  }

  private async getHistories(req: Request, res: Response) {
    const histories = await this.historyService.getHistories();

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: histories,
    }).handle(res);
  }

  private async getUserHistory(req: Request, res: Response) {
    const histories = await this.historyService.getUserHistory(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: histories,
    }).handle(res);
  }

  private async getUserMostPlayed(req: Request, res: Response) {
    const mostPlayed = await this.historyService.getUserMostPlayedList(
      req.params.id
    );

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: mostPlayed,
    }).handle(res);
  }

  private async getUserStatistics(req: Request, res: Response) {
    const statistics = await this.historyService.getUserStatistics(
      req.params.id
    );

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: statistics,
    }).handle(res);
  }

  private async getUserRecommendations(req: Request, res: Response) {
    const userId: string = req.params.id as string;
    const statistics = await this.historyService.getUserRecommendations(
      req.params.id
    );

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: statistics,
    }).handle(res);
  }

  private async getHistory(req: Request, res: Response) {
    const history = await this.historyService.getHistory(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: history,
    }).handle(res);
  }

  private async getHistoryById(req: Request, res: Response) {
    const history = await this.historyService.getHistoryById(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: history,
    }).handle(res);
  }

  private async createHistory(req: Request, res: Response) {
    const history = await this.historyService.createHistory(
      new HistoryEntity(req.body)
    );

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: history,
    }).handle(res);
  }

  private async updateHistory(req: Request, res: Response) {
    const history = await this.historyService.updateHistory(
      req.params.id,
      new HistoryEntity(req.body)
    );

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: history,
    }).handle(res);
  }

  private async deleteHistory(req: Request, res: Response) {
    await this.historyService.deleteHistory(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
    }).handle(res);
  }

  private async deleteUserHistory(req: Request, res: Response) {
    await this.historyService.deleteUserHistory(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
    }).handle(res);
  }
}

export default HistoryController;
