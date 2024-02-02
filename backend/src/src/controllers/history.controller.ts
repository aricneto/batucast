import { Router, Request, Response } from "express";
import { Result, SuccessResult } from "../utils/result";
import HistoryService from "../services/history.service";
import HistoryEntity from "../entities/history.entity";

class HistoryController {
  private prefix: string = "/user";
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
    this.router.get(`/histories`, (req: Request, res: Response) =>
      this.getHistories(req, res)
    );

    this.router.get(
      `${this.prefix}/:id${this.suffix}`,
      (req: Request, res: Response) => this.getUserHistory(req, res)
    );

    this.router.post(this.suffix, (req: Request, res: Response) =>
      this.createHistory(req, res)
    );
    // this.router.put(`${this.prefix}/:id/${this.sufix}`, (req: Request, res: Response) =>
    //   this.updateHistory(req, res)
    // );
    this.router.delete(
      `${this.prefix}/:id/${this.suffix}`,
      (req: Request, res: Response) => this.deleteHistory(req, res)
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

  private async getHistory(req: Request, res: Response) {
    const history = await this.historyService.getHistory(req.params.id);

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
}

export default HistoryController;