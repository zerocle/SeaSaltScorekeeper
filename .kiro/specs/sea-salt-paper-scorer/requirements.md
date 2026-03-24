# Requirements Document

## Introduction

Sea Salt and Paper Scorer is a cross-platform mobile and web application for tracking scores during games of Sea Salt and Paper, a card game where players collect sets of cards and score points across multiple rounds. The app supports 2-4 players, tracks per-round scores with round-ending context (STOP vs LAST CHANCE), calculates running totals, and determines the winner when a player reaches the end-game threshold or triggers an instant win. The app is a score tracker, not a game simulator — it does not manage cards, decks, or turns.

## Glossary

- **App**: The Sea Salt and Paper Scorer cross-platform application
- **Player**: A participant in a game of Sea Salt and Paper, identified by a name and a seating order
- **Game_Session**: A single complete game consisting of multiple rounds, with 2 to 4 players
- **Round**: One scoring phase within a Game_Session where each player receives a score
- **Round_End_Type**: The method by which a round ended: STOP, LAST_CHANCE, or EMPTY_DECK
- **Running_Total**: The cumulative score for a player across all completed rounds in a Game_Session
- **End_Game_Threshold**: The target score that triggers the end of the game (varies by player count: 40 points for 2 players, 35 points for 3 players, 30 points for 4 players)
- **Mermaid_Win**: An instant win condition triggered when a single player has placed all 4 mermaid cards
- **Last_Round_Player**: The player who went last in the final round of a Game_Session, used as the tie-breaker
- **Score_Entry_Form**: The UI component used to input scores for each player in a round
- **Player_Setup_Screen**: The UI screen where users configure the number of players and their names before starting a game
- **Scoreboard**: The UI component displaying all players, their per-round scores, and running totals
- **Navigation_Shell**: The top-level UI container that provides navigation and layout structure across all screens

## Requirements

### Requirement 1: Cross-Platform Deployment

**User Story:** As a user, I want to install and use the app on my phone or access it from a web browser, so that I can track scores regardless of which device I have available.

#### Acceptance Criteria

1. THE App SHALL run as a native application on iOS devices
2. THE App SHALL run as a native application on Android devices
3. THE App SHALL run as a web application in modern browsers (Chrome, Safari, Firefox, Edge)
4. THE App SHALL be built from a single shared codebase targeting all three platforms

### Requirement 2: App Framework and Navigation

**User Story:** As a user, I want a responsive and intuitive app layout, so that I can navigate between screens easily on any device.

#### Acceptance Criteria

1. THE Navigation_Shell SHALL provide navigation between the Player_Setup_Screen, Score_Entry_Form, and Scoreboard
2. THE App SHALL render a responsive layout that adapts to phone, tablet, and desktop screen sizes
3. WHEN the App is launched, THE App SHALL display the Player_Setup_Screen as the default screen

### Requirement 3: Player Setup

**User Story:** As a user, I want to set up players before starting a game, so that the app knows who is playing and can track scores for each person.

#### Acceptance Criteria

1. THE Player_Setup_Screen SHALL allow the user to select a player count of 2, 3, or 4
2. THE Player_Setup_Screen SHALL display a name input field for each selected player
3. THE Player_Setup_Screen SHALL assign a seating order to each player based on the order they are listed
4. WHEN the user has entered a name for every player, THE Player_Setup_Screen SHALL enable a start game button
5. IF a player name is left empty, THEN THE Player_Setup_Screen SHALL disable the start game button
6. WHEN the user taps the start game button, THE App SHALL create a new Game_Session and navigate to the Scoreboard

### Requirement 4: Round Score Entry

**User Story:** As a user, I want to enter each player's score at the end of a round along with how the round ended, so that the app can keep an accurate record of the game.

#### Acceptance Criteria

1. THE Score_Entry_Form SHALL display a numeric input field for each player in the Game_Session
2. THE Score_Entry_Form SHALL accept integer score values of 0 or greater for each player
3. THE Score_Entry_Form SHALL allow the user to select a Round_End_Type of STOP, LAST_CHANCE, or EMPTY_DECK for the round
4. WHEN the user submits the Score_Entry_Form, THE App SHALL record the scores and the selected Round_End_Type as a new Round in the Game_Session
5. WHEN a new Round is recorded, THE App SHALL update each player's Running_Total
6. WHEN a new Round is recorded, THE App SHALL navigate to the Scoreboard

### Requirement 5: Scoreboard Display

**User Story:** As a user, I want to see a clear scoreboard showing all players' scores per round and their totals, so that I can follow the progress of the game at a glance.

#### Acceptance Criteria

1. THE Scoreboard SHALL display each player's name, per-round scores, and Running_Total
2. THE Scoreboard SHALL display rounds in chronological order
3. THE Scoreboard SHALL display the Round_End_Type for each round
4. THE Scoreboard SHALL highlight the player with the highest Running_Total
5. THE Scoreboard SHALL provide a button to navigate to the Score_Entry_Form for entering a new round

### Requirement 6: End-Game Detection

**User Story:** As a user, I want the app to detect when the game is over, so that I know who won.

#### Acceptance Criteria

1. WHEN a player's Running_Total reaches or exceeds the End_Game_Threshold after a round is recorded, THE App SHALL declare the game over
2. THE App SHALL use an End_Game_Threshold of 40 points for a 2-player Game_Session
3. THE App SHALL use an End_Game_Threshold of 35 points for a 3-player Game_Session
4. THE App SHALL use an End_Game_Threshold of 30 points for a 4-player Game_Session
5. WHEN the game is over, THE App SHALL declare the player with the highest Running_Total as the winner
6. IF two or more players share the highest Running_Total when the game is over, THEN THE App SHALL prompt the user to identify the Last_Round_Player among the tied players and declare that player as the winner

### Requirement 7: Mermaid Instant Win

**User Story:** As a user, I want to record a mermaid instant win, so that the app correctly handles the special case where a player collects all 4 mermaids and wins immediately.

#### Acceptance Criteria

1. THE Score_Entry_Form SHALL provide an option to declare a Mermaid_Win for a specific player
2. WHEN a Mermaid_Win is declared for a player, THE App SHALL immediately end the Game_Session and declare that player as the winner
3. WHEN a Mermaid_Win is declared, THE App SHALL skip normal score entry for that round

### Requirement 8: New Game

**User Story:** As a user, I want to start a new game after one finishes, so that I can play multiple games in a session without restarting the app.

#### Acceptance Criteria

1. THE Scoreboard SHALL provide a button to start a new game
2. WHEN the user taps the new game button, THE App SHALL navigate to the Player_Setup_Screen
3. WHEN a new Game_Session is created, THE App SHALL clear all previous Round data and Running_Totals

### Requirement 9: Data Persistence

**User Story:** As a user, I want my current game to be saved automatically, so that I don't lose progress if I accidentally close the app.

#### Acceptance Criteria

1. WHEN a new Round is recorded, THE App SHALL persist the Game_Session data to local device storage
2. WHEN the App is launched with a saved Game_Session, THE App SHALL restore the Game_Session and navigate to the Scoreboard
3. WHEN a new Game_Session is created, THE App SHALL remove the previously saved Game_Session from local storage
