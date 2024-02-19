Scenario: Searching for a song by a string contained in the title
    Given there are songs in the database with titles "Example Song 1", "Another Example Song"
    When I send a GET request to "/api/songs/search/?keyword=Example"
    Then the response status should be 200
    And the response JSON should contain songs with titles "Example Song 1", "Another Example Song"

