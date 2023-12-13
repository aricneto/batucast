Feature: User registration
    As someone interested in creating an account on the app
    I want to enter my details to register an account on the application
    So that enter the application and I have access to the application's features

    Scenario: Successful user registration
        Given I am on the “registration” page
        And there is no registered account with email “ze@gmail.com”
        When I fill in the name field with “Ze”
        And I fill in the email field with “ze@gmail.com”
        And I fill in the password field with “ze123”
        And I fill in the confirm password field with “ze123”
        Then I can see a registration confirmation message on the screen

    Scenario: Attempting to register with an email already registered
        Given I am on the “registration” page
        And there is an account registered with email “ze@gmail.com”
        When I fill in the name field with “Ze”
        And I fill in the email field with “ze@gmail.com”
        And I fill in the password field with “ze123”
        And I fill in the confirm password field with “ze123”
        Then I can see a failure message because this email is already registered

    Scenario: Attempt to register with a non-standard password
        Given I am on the “registration” page
        When I try to register using the password "ze1"
        Then I can see a failure message indicating that the password must be at least 5 characters long

    Scenario: Attempt to register with fields not filled in
        Given I am on the “registration” page
        When I try to register an account without filling out all the registration fields
        Then I can see a message indicating that I must fill in all the fields to proceed
        And I remain on the registration page