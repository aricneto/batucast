import { Router, Request, Response } from "express";
import { FailureResult, Result, SuccessResult } from "../utils/result";
import {
  HttpNotFoundError,
  HttpUnauthorizedError,
} from "../utils/errors/http.error";
import PlaylistService from "../services/playlist.service";
import PlaylistEntity from "../entities/playlist.entity";

class PlaylistController {
  private prefix: string = "/playlists";
  private search: string = "/search";
  public router: Router;
  private playlistService: PlaylistService;

  constructor(router: Router, playlistService: PlaylistService) {
    this.router = router;
    this.playlistService = playlistService;
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(
      `/feed${this.search}${this.prefix}`,
      (req: Request, res: Response) => this.searchPlaylists(req, res)
    );

    this.router.get(
      `${this.prefix}/MyPlaylists`,
      (req: Request, res: Response) => this.getUserPlaylists(req, res)
    );

    this.router.get(this.prefix, (req: Request, res: Response) =>
      this.getPlaylists(req, res)
    );

    this.router.get(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.getPlaylist(req, res)
    );
    this.router.post(this.prefix, (req: Request, res: Response) =>
      this.createPlaylist(req, res)
    );
    this.router.put(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.updatePlaylist(req, res)
    );
    this.router.delete(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.deletePlaylist(req, res)
    );
    this.router.put(
      `${this.prefix}/follow/:playlistId`,
      (req: Request, res: Response) => this.followPlaylist(req, res)
    );
    this.router.put(
      `${this.prefix}/unfollow/:playlistId`,
      (req: Request, res: Response) => this.unfollowPlaylist(req, res)
    );
    this.router.put(
      `${this.prefix}/:id/:songId`,
      (req: Request, res: Response) => this.addSongToPlaylist(req, res)
    );
    this.router.delete(
      `${this.prefix}/:id/:songId`,
      (req: Request, res: Response) => this.removeSongToPlaylist(req, res)
    );
    this.router.put(
      `${this.prefix}/addContributor/:playlistId/:contributorId`,
      (req: Request, res: Response) => this.addContributor(req, res)
    );
    this.router.put(
      `${this.prefix}/removeContributor/:playlistId/:contributorId`,
      (req: Request, res: Response) => this.removeContributor(req, res)
    );
  }

  private async getPlaylists(req: Request, res: Response) {
    const playlists = await this.playlistService.getPlaylists();

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: playlists,
    }).handle(res);
  }

  private async getUserPlaylists(req: Request, res: Response) {
    const userId = req.body.userId;
    const playlists = await this.playlistService.getUserPlaylists(userId);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: playlists,
    }).handle(res);
  }

  private async getPlaylist(req: Request, res: Response) {
    const playlist = await this.playlistService.getPlaylist(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: playlist,
    }).handle(res);
  }

  private async createPlaylist(req: Request, res: Response) {
    try {
      const { name, createdBy } = req.body;

      // Validar se o nome esta presentes
      if (!name) {
        return res
          .status(400)
          .json({ error: "A name is required for playlist creation" });
      }

      // Validar o createdBy estão presentes
      if (!createdBy) {
        return res
          .status(400)
          .json({ error: "A valid userID is required for playlist creation" });
      }

      const playlist = await this.playlistService.createPlaylist(
        new PlaylistEntity(req.body)
      );

      return new SuccessResult({
        msg: Result.transformRequestOnMsg(req),
        data: playlist,
      }).handle(res);
    } catch (error) {
      return new FailureResult({
        msg: Result.transformRequestOnMsg(req),
        msgCode: "playlist_creation_failure",
        code: 500,
      }).handle(res);
    }
  }

  private async updatePlaylist(req: Request, res: Response) {
    try {
      const name = req.body.name;
      const userId = req.body.userId;

      // Validar se o nome esta presentes
      if (!name) {
        return res
          .status(400)
          .json({ error: "A name is required to update playlist" });
      }

      // Validar o userId estão presentes
      if (!userId) {
        return res
          .status(400)
          .json({ error: "A valid userId is required to update playlist" });
      }

      const playlist = await this.playlistService.updatePlaylist(
        req.params.id,
        new PlaylistEntity(req.body),
        userId
      );

      return new SuccessResult({
        msg: Result.transformRequestOnMsg(req),
        data: playlist,
      }).handle(res);
    } catch (error) {
      if (error instanceof HttpUnauthorizedError) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "update_playlist_unauthorized",
          code: 403,
        }).handle(res);
      }

      if (error instanceof HttpNotFoundError) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "playlist_not_found",
          code: 403,
        }).handle(res);
      }

      return new FailureResult({
        msg: Result.transformRequestOnMsg(req),
        msgCode: "playlist_update_failure",
        code: 500,
      }).handle(res);
    }
  }

  private async deletePlaylist(req: Request, res: Response) {
    try {
      const userId = req.body.userId; // informação do ID do usuário na requisição

      await this.playlistService.deletePlaylist(req.params.id, userId);

      return new SuccessResult({
        msg: Result.transformRequestOnMsg(req),
      }).handle(res);
    } catch (error) {
      if (error instanceof HttpUnauthorizedError) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "playlist_deletion_unauthorized",
          code: 403,
        }).handle(res);
      }

      return new FailureResult({
        msg: Result.transformRequestOnMsg(req),
        msgCode: "playlist_deletion_failure",
        code: 500,
      }).handle(res);
    }
  }

  private async searchPlaylists(req: Request, res: Response) {
    const keyword: string = req.query.keyword as string;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const playlists = await this.playlistService.searchPlaylists(keyword);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: playlists,
    }).handle(res);
  }

  private async addSongToPlaylist(req: Request, res: Response) {
    try {
      const playlistId = req.params.id;
      const songId = req.params.songId;
      const userId = req.body.userId; // informação do ID do usuário na requisição

      if (!userId) {
        return res.status(400).json({
          error: "A valid userID is required to add songs in playlist",
        });
      }

      const updatedPlaylist = await this.playlistService.addSongToPlaylist(
        playlistId,
        songId,
        userId
      );

      return new SuccessResult({
        msg: Result.transformRequestOnMsg(req),
        data: updatedPlaylist,
      }).handle(res);
    } catch (error) {
      if (error instanceof HttpUnauthorizedError) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "playlist_add_song_unauthorized",
          code: 403,
        }).handle(res);
      }

      if (error instanceof HttpNotFoundError) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "entity_not_found",
          code: 403,
        }).handle(res);
      }

      if (error instanceof Error) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "song_alread_in_playlist",
          code: 403,
        }).handle(res);
      }

      return new FailureResult({
        msg: Result.transformRequestOnMsg(req),
        msgCode: "add_song_failure",
        code: 500,
      }).handle(res);
    }
  }

  private async removeSongToPlaylist(req: Request, res: Response) {
    try {
      const playlistId = req.params.id;
      const songId = req.params.songId;
      const userId = req.body.userId; // informação do ID do usuário na requisição

      if (!userId) {
        return res.status(400).json({
          error: "A valid userID is required to add songs in playlist",
        });
      }

      const updatedPlaylist = await this.playlistService.removeSongToPlaylist(
        playlistId,
        songId,
        userId
      );

      return new SuccessResult({
        msg: Result.transformRequestOnMsg(req),
        data: updatedPlaylist,
      }).handle(res);
    } catch (error) {
      if (error instanceof HttpUnauthorizedError) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "playlist_remove_song_unauthorized",
          code: 403,
        }).handle(res);
      }

      if (error instanceof HttpNotFoundError) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "entity_not_found",
          code: 403,
        }).handle(res);
      }

      if (error instanceof Error) {
        return new FailureResult({
          msg: Result.transformRequestOnMsg(req),
          msgCode: "song_do_not_exist_in_playlist",
          code: 403,
        }).handle(res);
      }

      return new FailureResult({
        msg: Result.transformRequestOnMsg(req),
        msgCode: "remove_song_failure",
        code: 500,
      }).handle(res);
    }
  }

  private async followPlaylist(req: Request, res: Response) {
    const playlistId: string = req.params.playlistId;
    const userId: string = req.body.userId;

    await this.playlistService.followPlaylist(playlistId, userId);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
    }).handle(res);
  }

  private async unfollowPlaylist(req: Request, res: Response) {
    const playlistId: string = req.params.playlistId;
    const userId: string = req.body.userId;

    await this.playlistService.unfollowPlaylist(playlistId, userId);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
    }).handle(res);
  }

  private async addContributor(req: Request, res: Response) {
    const playlistId: string = req.params.playlistId;
    const contributorId: string = req.params.contributorId;
    const userId: string = req.body.userId;

    try {
      await this.playlistService.addContributor(
        playlistId,
        contributorId,
        userId
      );
      return new SuccessResult({
        msg: "Contributor added successfully",
      }).handle(res);
    } catch (error) {
      throw error;
    }
  }

  private async removeContributor(req: Request, res: Response) {
    const playlistId: string = req.params.playlistId;
    const contributorId: string = req.params.contributorId;
    const userId: string = req.body.userId;

    try {
      await this.playlistService.removeContributor(
        playlistId,
        contributorId,
        userId
      );
      return new SuccessResult({
        msg: "Contributor removed successfully",
      }).handle(res);
    } catch (error) {
      throw error;
    }
  }
}

export default PlaylistController;
