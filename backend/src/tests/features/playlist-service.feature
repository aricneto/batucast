Feature: Playlist Service

    # Service
    Scenario: Get playlists by user id
        Given the method getPlaylists was called with the user_id "1" from PlaylistService returns playlists with ids "1", "2", and "3"
        When the method getPlaylists from PlaylistService is called with the id "1"
        Then the playlists returned must have ids "1", "2", and "3"

    Scenario: Create a new playlist
        Given the function createPlaylist was called with the user_id "1" and the playlist name "My New Playlist"
        When the function getUserPlaylists is called with the user_id "1"
        Then the playlists returned must include "My New Playlist"

    Scenario: Update playlist name
        Given a user with id "1" has a playlist named "Old Playlist"
        When the function updatePlaylist is called with the playlist id "1", user_id "1", and the updated playlist name "New Playlist"
        And the function getPlaylist is called with the playlist id "1"
        Then the playlist returned must have the name "New Playlist"

    Scenario: Delete a playlist
        Given a user with id "1" has playlists with ids "1", "2", and "3"
        When the function deletePlaylist is called with the playlist id "1" and user_id "1"
        And the function getPlaylists is called with the user_id "1"
        Then the playlists returned must not include the playlist with id "1"
        And the user playlists must have 2 items

    Scenario: Add a song to a playlist
        Given a user with id "1" has a playlist with id "1"
        And there is a song with id "4"
        When the function addSongToPlaylist is called with the playlist id "1", song id "4", and user_id "1"
        And the function getPlaylist is called with the playlist id "1"
        Then the playlist returned must have the song with id "4"

    Scenario: Remove a song from a playlist
        Given a user with id "1" has a playlist with id "1" containing songs with ids "4", "5", and "6"
        When the function removeSongToPlaylist is called with the playlist id "1", song id "5", and user_id "1"
        And the function getPlaylist is called with the playlist id "1"
        Then the playlist returned must not have the song with id "5"
        And the playlist must have songs with ids "4" and "6"