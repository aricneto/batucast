Feature: Most Played Songs
    As an user
    I want see my most played songs of the month
    So that I can get to know my taste in music

    Scenario: New user who has never played a song before
        Given I've created a new account with user "pedro", password "123"
        And I logged in with user "pedro", password "123"
        And I have no songs in my history
        When I open my most played songs
        Then I see a message "You haven't played any songs"

    Scenario: User asks for detailed stats
        Given I've created a new account with user "pedro", password "123"
        And I logged in with user "pedro", password "123"
        And I played the song "Aquarela", which is "3" minutes long, "4" times, and is from the genre "MPB" and artist "Toquinho"
        When I select "Detailed Statistics"
        Then the system will correctly calculate the total play time of my songs as "12" minutes
        And will correctly calculate my most played genre as "MPB", and my most played song as "Aquarela"

    Scenario: User attempts to access most played songs without logging in
        Given I am not logged into the system
        When I attempt to view my most played songs
        Then the system displays an error message prompting me to log in
        And does not show any song statistics or information

    Scenario: User turns off tracking of play history
        Given I am logged in with user "pedro", password "123"
        When I go to settings
        And I choose to turn off the tracking of my play history
        Then the system confirms that play history tracking is turned off
        And my future plays are not recorded in my play history

    Scenario: User clears play history
        Given I am logged in with user "pedro", password "123"
        And I have the songs "Yellow Submarine" and "Clair de Lune" in my play history
        When I go to settings
        And I select the option to clear my play history
        Then the system deletes all my previously stored play history
        And now I do not have any songs in my play history

    Scenario: User has disabled tracking of play history
        Given I am logged in with user "pedro", password "123"
        And I have disabled the tracking of my play history in settings
        When I attempt to view my most played songs
        Then the system displays an empty list
        And the system indicates that play history tracking is disabled
        And does not provide any most played song information

    Scenario: User asks for most played songs
        Given I am logged in with user "pedro", password "123"
        And I have played songs before
        When I open my most played songs
        Then the system will display me a list of my most played songs of the month
