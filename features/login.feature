Feature: Users login
    As a user registered on the application
    I want to log into the application using my registered email and password
    So that I have access to the application's features

    Scenario: Login successful
        Given I am on the "Login" page
        And there is a registered user with the email "ze@gmail.com" and password "ze123"
        When I fill in the email field with "ze@gmail.com"
        And I fill in the password field with "ze123"
        Then I am redirected to the application's home page

    Scenario: Attempt to login with incorrect email and/or password
        Given I am on the "Login" page
        And there is no registered user with the email "ze@gmail.com" and password "ze321"
        When I fill in the email field with "ze@gmail.com"
        And I fill in the password field with "ze321"
        Then I can see a login failure message
        And I remain on the login screen

    Scenario: login attempt with blank email and/or password field
        Given I am on the "Login" page
        And there is a registered user with the email "ze@gmail.com" and password "ze123"
        When I fill in the email field with "ze@gmail.com"
        And I leave the password field blank
        And I try to log in
        Then I can see an error message indicating that all fields must be completed
