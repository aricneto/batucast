import supertest from 'supertest';
import app from '../../src/app';
import PlaylistEntity from '../../src/entities/playlist.entity';

const request = supertest(app);

describe('PlaylistController', () => {
  const mockedUserId: string = "Pedro";
  const mockedPlaylistName = {name: "My songs"};
  const mockedPlaylistId: string = "ce6f5c66-1967-4b21-9929-51ca7d652151";
  const mockedPlaylistId2: string = "alwnqwdnej18ej129";
  const mockedSongId: string = "1";
  const mockedFollower = "Thiago";
  const mockedContributorId: string = "contributor123";

  const mockedPlaylistEntity: PlaylistEntity = new PlaylistEntity({
    id: mockedPlaylistId,
    name: "Afternoon Sessions",
    songs: [],
    createdBy: mockedUserId,
    private: true,
    followers: [],
    contributors: [],
  });

  const mockedPlaylistEntity2: PlaylistEntity = new PlaylistEntity({
    id: mockedPlaylistId2,
    name: "Songs to listen to with a fever",
    songs: [],
    createdBy: mockedUserId,
    private: false,
    followers: [],
    contributors: [],
  });

  it('should return playlists', async () => {
    const response = await request.get('/api/playlists').send();
    const result = response.body.data;

    expect(response.status).toBe(200);
  });

  it('should return a playlist by id', async () => {
    const response = await request.get('/api/playlists/' + mockedPlaylistId).send();
    const result = response.body.data;

    expect(response.status).toBe(200);
    expect(result).toEqual({
      ...mockedPlaylistEntity,
      songsContent: [],
    });
});

it('should throw an error when playlist is not found by id', async () => {
    const response = await request.get('/api/playlists/1111').send();
    const result = response.body.msgCode;
    
    expect(response.status).toBe(404);
    expect(result).toEqual('playlist_not_found');
});

it('should create a playlist', async () => {
    const createPlaylistData = {createdBy: mockedUserId, name: mockedPlaylistName.name};
    const response = await request.post('/api/playlists').send(createPlaylistData);
    const result = response.body.data;
    
    
    expect(response.status).toBe(200);
    expect(result).toEqual(
        expect.objectContaining({
          name: mockedPlaylistName.name,
        })
    );
  });

  it('should update a playlist', async () => {
    const updatePlaylistData = {
        id: mockedPlaylistEntity.id, 
        name: "Updated Playlist", 
        songs: mockedPlaylistEntity.songs,
        createdBy: mockedPlaylistEntity.createdBy,
        private: mockedPlaylistEntity.private,
        followers: mockedPlaylistEntity.followers,
        userId: mockedUserId
    };
    const response = await request.put('/api/playlists/' + mockedPlaylistId).send(updatePlaylistData);
    const result = response.body.data;

    expect(response.status).toBe(200);
    expect(result).toEqual(
      expect.objectContaining({
        name: 'Updated Playlist',
      })
    );
  });
  
  it('should add a song to a playlist', async () => {
      const addSongtoPlaylistData = {userId: mockedUserId};
      const response = await request.put('/api/playlists/addSong/' + mockedPlaylistId + '/' + mockedSongId).send(addSongtoPlaylistData);
      const result = response.body.data;

      expect(response.status).toBe(200);
      expect(result.songs).toContain(mockedSongId);
    });
    
    it('should remove a song from a playlist', async () => {
        const addSongtoPlaylistData = {userId: mockedUserId};
        const response = await request.put('/api/playlists/removeSong/' + mockedPlaylistId + '/' + mockedSongId).send(addSongtoPlaylistData);
        const result = response.body.data;
        
        expect(response.status).toBe(200);
        expect(result.songs).not.toContain(mockedSongId);
    });
    
    it('should delete a playlist', async () => {
      const response = await request.delete('/api/playlists/' + mockedPlaylistId + '/' + mockedUserId).send();
    
      expect(response.status).toBe(200);
    });

    it('should return an empty list as a result of the search', async () => {
      
      const response = await request.get('/api/feed/search/playlists/?keyword=after');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
});
