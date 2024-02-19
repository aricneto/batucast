Feature: Songs

Scenario: Searching for a song by a string that is contained in the title
    Given there's a song with name "Watermelon", artist "Spongebob" in the database
	When the searchSongs function is called with query word "water"
    Then the returned songs array must include a song with name "Watermelon" and artist "Spongebob"

Scenario: Search for a song with a genre filter
    Given there's a song with name "Watermelon", artist "Spongebob" and genre "MPB" in the database
	When the searchSongs function is called with query word "water" and filter "mpb"
    Then the returned songs array must include a song with name "Watermelon", artist "Spongebob" and genre "MPB"