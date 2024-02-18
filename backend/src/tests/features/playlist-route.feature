Feature: Playlist Routers
   
    Scenario: Create a New Playlist
        Given a user with id "123" is logged-in
        When a POST request is sent to "/api/playlists" with the playlist name "SleepYpy" and user id "123"
        Then the response status should be "200"
        And the response JSON should contain the created playlist with name "SleepYpy"

    Scenario: Add a Song to an Existing Playlist
        Given a user with id "999" is logged-in
        And there is an existing playlist with id "12345" named "Breakfast and Furious" created by user "999" without songs in
        And there is an existing song with id "3" named "Apple" by "Spongebob"
        When a PUT request is sent to "/api/playlists/12345/3" with user id "999"
        Then the response status should be "200"
        And the response JSON should contain the updated playlist with the added song id "3" in the list of songs

    Scenario: Delete a Playlist
        Given a user with id "1" is logged-in
        And there is an existing playlist with id "1" named "My Favorites" created by user "1"
        When a DELETE request is sent to "/api/playlists/1" with user id "1"
        Then the response status should be "200"
        And the playlist with id "1" should no longer exist in the database

    Scenario: Remove a Song from a Playlist
        Given a user with id "2" is logged-in
        And there is an existing playlist with id "2" named "Road Trip Playlist" created by user "2"
        And there is an existing song with id "2" named "Watermelon" by "Spongebob" in the playlist
        When a DELETE request is sent to "/api/playlists/2/2" with user id "2"
        Then the response status should be "200"
        And the response JSON should contain the updated playlist with the song id "2" removed from the list of songs


    Scenario: Update Playlist Name
        Given a user with id "2" is logged-in
        And there is an existing playlist with id "4" named "Workout Beats" created by user "2"
        When a PUT request is sent to "/api/playlists/4" with user id "2" and the updated playlist name "New Favorites"
        Then the response status should be "200"
        And the response JSON should contain the updated playlist with the name "New Favorites"

    Scenario: Fail to Create Playlist with Empty Name    
        Given a user with id "1" is logged-in
        When a POST request is sent to "/api/playlists" with an empty playlist name and user id "1"
        Then the response status should be "400"
        And the response JSON should contain "A name is required for playlist creation" error message
