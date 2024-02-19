Feature: Homepage
//as reference

Scenario: User Page - getUser function (ok)
    Given the system has a user with id "1", name "otaviohbf", email "ohbf@cin.ufpe.br" and history_tracking set to "true"
    When the function getUser is called for id "1"
    Then the user returned must have id "1", name "otaviohbf", email "ohbf@cin.ufpe.br" and history_tracking set to "true"

Scenario: User Page - getHistory function (ok)
    Given the system has a user with id "1", name "otaviohbf", email "ohbf@cin.ufpe.br" history_tracking set to "true"
    And this user has a history with a song with id "2"
    When the function getUserHistory is called for id "1"
    Then the history model returned must have user_id equal to "1" and song_id equal to "2"

Scenario: Personalized Recommendations (not ok)
    Given the system has a user with id "1", name "otaviohbf", email "ohbf@cin.ufpe.br" history_tracking set to "true"
    And this user has a history with a song with id "2" and genre "MPB"
    And the most_played_genre by this user is "MPB"
    And there is, in the database, one other song with id "1" and genre "MPB"
    Then the recommendation to be returned must be the song with id "1" and genre "MPB"

Scenario: Searching for a song by a string that is contained in the title (ok)
    Given there's a song with name "Watermelon", artist "Spongebob" in the database
	When the searchSongs function is called with query word "water"
    Then the returned songs array must include a song with name "Watermelon" and artist "Spongebob"

Scenario: Searching for a public playlist (ok)
    Given there's a playlist named "Road Trip Playlist" and id "2", that has the private atribute set to "false" in the database
    When the searchPlaylists function is called with query word "trip"
    Then the returned playlists array must include a playlist with name "Road Trip Playlist" and id "2"

Scenario: Searching for a private playlist (ok)
    Given there's a playlist named "Afternoon Sessions" and id "ce6f5c66-1967-4b21-9929-51ca7d652151", that has the private atribute set to "true" in the database
    When the searchPlaylists function is called with query word "Afternoon Sessions"
    Then the returned playlists array must not include a playlist with name "Afternoon Sessions" and id "ce6f5c66-1967-4b21-9929-51ca7d652151"

Scenario: Search for a song with a genre filter (ok)
    Given there's a song with name "Watermelon", artist "Spongebob" and genre "MPB" in the database
	When the searchSongs function is called with query word "water" and filter "mpb"
    Then the returned songs array must include a song with name "Watermelon", artist "Spongebob" and genre "MPB"