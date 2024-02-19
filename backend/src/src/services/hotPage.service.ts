import { HttpNotFoundError } from "../utils/errors/http.error";
import SongModel from "../models/song.model";
import SongRepository from "../repositories/song.repository";
class HotPageServiceMessageCode {
  public static readonly hotPage_not_found = "hotPage_not_found";
}

class HotPageService {
  private songRepository: SongRepository;

  constructor(songRepository: SongRepository) {
    this.songRepository = songRepository;
  }

  public async getHotSongs(genre?: string): Promise<SongModel[]> {
    let sortedArray: SongModel[] = [];
    if (!genre) {
      sortedArray = (await this.songRepository.getSongs()).sort(
        (a, b) => b.times_ever_played - a.times_ever_played
      );
    } else {
      sortedArray = (await this.songRepository.getSongs())
        .filter(
          (song) => song.genre.toLocaleLowerCase() === genre.toLocaleLowerCase()
        )
        .sort((a, b) => b.times_ever_played - a.times_ever_played);
    }
    const slicedArray = sortedArray.slice(0, 5);

    if (genre && slicedArray.length === 0) {
      throw new HttpNotFoundError({
        msg: "Genre not found",
        msgCode: HotPageServiceMessageCode.hotPage_not_found,
      });
    }

    if (sortedArray.length === 0) {
      throw new HttpNotFoundError({
        msg: "There are no songs in the database.",
        msgCode: HotPageServiceMessageCode.hotPage_not_found,
      });
    }

    return slicedArray;
  }
}

export default HotPageService;
