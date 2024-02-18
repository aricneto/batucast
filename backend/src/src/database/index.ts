import HistoryEntity from "../entities/history.entity";
import SongEntity from "../entities/song.entity";
import UserEntity from "../entities/user.entity";
import PlaylistEntity from "../entities/playlist.entity";

export default class Database {
  data: { [key: string]: any[] };
  private static instance: Database;

  private constructor() {
    this.data = {};
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  static reset() {
    Database.instance = new Database();
  }

  static seed() {
    Database.getInstance().data = {
      songs: [
        new SongEntity({
          id: "1",
          title: "Peanut",
          duration: 45,
          artist: "Spongebob",
          genre: "Rock",
          times_ever_played: 42,
        }),
        new SongEntity({
          id: "2",
          title: "Watermelon",
          duration: 23,
          artist: "Spongebob",
          genre: "MPB",
          times_ever_played: 30,
        }),
        new SongEntity({
          id: "3",
          title: "Apple",
          duration: 78,
          artist: "Spongebob",
          genre: "MPB",
          times_ever_played: 20,
        }),
        new SongEntity({
          id: "4",
          title: "Borboletas",
          duration: 78,
          artist: "Victo e Leo",
          genre: "MPB",
          times_ever_played: 12,
        }),
        new SongEntity({
          id: "5",
          title: "Faroeste Caboclo",
          duration: 600,
          artist: "Legião Urbana",
          genre: "MPB",
          times_ever_played: 0,
        }),
        new SongEntity({
          id: "6",
          title: "Anunciação",
          duration: 78,
          artist: "Alceu Valença",
          genre: "MPB",
          times_ever_played: 8,
        }),
        new SongEntity({
          id: "7",
          title: "Californication",
          duration: 78,
          artist: "Red Hot Chili Peppers",
          genre: "Rock",
          times_ever_played: 14,
        }),
        new SongEntity({
          id: "8",
          title: "Selvagem",
          duration: 78,
          artist: "Legião Urbana",
          genre: "MPB",
          times_ever_played: 5,
        }),
        new SongEntity({
          id: "9",
          title: "Many Men",
          duration: 78,
          artist: "50 cent",
          genre: "Rap",
          times_ever_played: 22,
        }),
        new SongEntity({
          id: "10",
          title: "Numa sala de reboco",
          duration: 78,
          artist: "Luiz Gonzaga",
          genre: "Forró",
          times_ever_played: 500,
        }),
        new SongEntity({
          id: "11",
          title: "Country roads",
          duration: 78,
          artist: "John Dever",
          genre: "Country",
          times_ever_played: 16,
        }),
        new SongEntity({
          id: "12",
          title: "abc",
          duration: 78,
          artist: "def",
          genre: "Country",
          times_ever_played: 1,
        }),
        new SongEntity({
          id: "13",
          title: "xyz",
          duration: 78,
          artist: "Pip",
          genre: "Country",
          times_ever_played: 0,
        }),
        new SongEntity({
          id: "13",
          title: "Umbrella",
          duration: 78,
          artist: "Rihanna",
          genre: "Pop",
          times_ever_played: 90,
        }),
        new SongEntity({
          id: "13",
          title: "Halo theme song",
          duration: 78,
          artist: "Unknown",
          genre: "Classical",
          times_ever_played: 50,
        }),
      ],
      users: [
        new UserEntity({
          id: "1",
          name: "Alfonso",
          email: "alfonso@gmail.com",
          password: "123456",
          history_tracking: true,
        }),
        new UserEntity({
          id: "2",
          name: "João",
          email: "joao@gmail.com",
          password: "789456",
          history_tracking: true,
        }),
      ],
      history: [
        new HistoryEntity({
          id: "",
          user_id: "1",
          song_id: "2",
        }),
        new HistoryEntity({
          id: "",
          user_id: "1",
          song_id: "2",
        }),
        new HistoryEntity({
          id: "",
          user_id: "1",
          song_id: "2",
        }),
        new HistoryEntity({
          id: "",
          user_id: "2",
          song_id: "3",
        }),
        new HistoryEntity({
          id: "",
          user_id: "2",
          song_id: "1",
        }),
        new HistoryEntity({
          id: "",
          user_id: "1",
          song_id: "2",
        }),
        new HistoryEntity({
          id: "",
          user_id: "1",
          song_id: "3",
        }),
      ],
      playlists: [
        new PlaylistEntity({
          id: "1",
          name: "My Favorites",
          songs: ["1", "2", "3"], // Song IDs ranging from 1 to 3
          createdBy: "1", // User ID 1 created this playlist
          private: false,
          followers: [],
          contributors: [],
        }),
        new PlaylistEntity({
          id: "2",
          name: "Road Trip Playlist",
          songs: ["1", "2", "3"], // Song IDs ranging from 1 to 3
          createdBy: "2", // User ID 2 created this playlist
          private: false,
          followers: [],
          contributors: [],
        }),
        new PlaylistEntity({
          id: "3",
          name: "Chill Vibes",
          songs: ["2", "3"], // Song IDs ranging from 2 to 3
          createdBy: "1", // User ID 1 created this playlist
          private: false,
          followers: [],
          contributors: [],
        }),
        new PlaylistEntity({
          id: "4",
          name: "Workout Beats",
          songs: ["1", "3"], // Song IDs ranging from 1 to 3
          createdBy: "2", // User ID 2 created this playlist
          private: true,
          followers: [],
          contributors: [],
        }),
        new PlaylistEntity({
          id: "ce6f5c66-1967-4b21-9929-51ca7d652151",
          name: "Afternoon Sessions",
          songs: [],
          createdBy: "Pedro",
          private: true,
          followers: [],
          contributors: [],
        }),
        new PlaylistEntity({
          id: "12345",
          name: "Breakfast and Furious",
          songs: [],
          createdBy: "999",
          private: true,
          followers: [],
          contributors: [],
        }),
      ],
    };
  }
}
