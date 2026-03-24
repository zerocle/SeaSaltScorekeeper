# Requirements Document

## Introduction

Advanced Score Input replaces the current single-number score entry in the Sea Salt and Paper Scorer app with a detailed, category-based breakdown. Instead of manually totaling card points, users input counts for each card category (Duo cards, Collector cards, Point Multiplier cards, Mermaid cards) and the app calculates the total automatically. The feature also handles the Last Chance round-end flow, where the caller's bet outcome determines which players receive card points versus only a color bonus. This feature modifies the existing score entry screen and extends the game logic and data model while preserving backward compatibility with previously saved games.

## Glossary

- **App**: The Sea Salt and Paper Scorer cross-platform application
- **Score_Entry_Screen**: The UI screen where users input per-player card breakdowns for a round
- **Card_Breakdown**: The structured input representing counts of each card category for a single player in a round
- **Duo_Cards**: Card pairs that score 1 point per pair — Crab pairs, Boat pairs, Fish pairs, and Swimmer+Shark combos
- **Collector_Cards**: Cards that score points based on how many of a type a player holds — Shells, Octopus, Penguins, Sailors
- **Multiplier_Cards**: Cards that multiply based on related card counts — Lighthouse (×boats), Shoal of Fish (×fish), Penguin Colony (×penguins), Captain (×sailors)
- **Mermaid_Card**: A card that scores 1 point per card of the color the player has the most of; each mermaid must reference a different color
- **Color_Count**: The number of cards of a specific color a player holds, used for mermaid scoring and color bonus calculation
- **Color_Bonus**: 1 point per card of the color the player has the most of, awarded during Last Chance resolution
- **Card_Score**: The total points derived from a player's Card_Breakdown (Duo + Collector + Multiplier + Mermaid points), before any Last Chance adjustments
- **Round_Score**: The final score recorded for a player in a round, after applying Last Chance rules if applicable
- **Caller**: The player who triggered the end of a round by calling Last Chance
- **Last_Chance_Outcome**: Whether the Caller won or lost the Last Chance bet — won if Caller's Card_Score is greater than or equal to all opponents' Card_Scores, lost otherwise
- **Scoring_Engine**: The pure-function module that computes Card_Scores and Round_Scores from Card_Breakdowns
- **Shell_Scoring_Table**: Points for Shells — 0/2/4/6/8/10 for 1/2/3/4/5/6 cards
- **Octopus_Scoring_Table**: Points for Octopus — 0/3/6/9/12 for 1/2/3/4/5 cards
- **Penguin_Scoring_Table**: Points for Penguins — 1/3/5 for 1/2/3 cards
- **Sailor_Scoring_Table**: Points for Sailors — 0/5 for 1/2 cards

## Requirements

### Requirement 1: Duo Card Input

**User Story:** As a user, I want to enter the number of each duo type separately, so that the app can calculate duo points automatically.

#### Acceptance Criteria

1. THE Score_Entry_Screen SHALL display a numeric input for Crab pair count for each player
2. THE Score_Entry_Screen SHALL display a numeric input for Boat pair count for each player
3. THE Score_Entry_Screen SHALL display a numeric input for Fish pair count for each player
4. THE Score_Entry_Screen SHALL display a numeric input for Swimmer+Shark combo count for each player
5. THE Score_Entry_Screen SHALL accept integer values of 0 or greater for each Duo_Cards input
6. THE Scoring_Engine SHALL calculate duo points as the sum of all duo pair/combo counts (1 point per pair or combo)

### Requirement 2: Collector Card Input

**User Story:** As a user, I want to enter the count of each collector card type, so that the app can look up the correct collector points from the scoring tables.

#### Acceptance Criteria

1. THE Score_Entry_Screen SHALL display a numeric input for Shell card count (0 to 6) for each player
2. THE Score_Entry_Screen SHALL display a numeric input for Octopus card count (0 to 5) for each player
3. THE Score_Entry_Screen SHALL display a numeric input for Penguin card count (0 to 3) for each player
4. THE Score_Entry_Screen SHALL display a numeric input for Sailor card count (0 to 2) for each player
5. THE Scoring_Engine SHALL calculate Shell points using the Shell_Scoring_Table: 0 for 0 cards, 0 for 1, 2 for 2, 4 for 3, 6 for 4, 8 for 5, 10 for 6
6. THE Scoring_Engine SHALL calculate Octopus points using the Octopus_Scoring_Table: 0 for 0 cards, 0 for 1, 3 for 2, 6 for 3, 9 for 4, 12 for 5
7. THE Scoring_Engine SHALL calculate Penguin points using the Penguin_Scoring_Table: 0 for 0 cards, 1 for 1, 3 for 2, 5 for 3
8. THE Scoring_Engine SHALL calculate Sailor points using the Sailor_Scoring_Table: 0 for 0 cards, 0 for 1, 5 for 2

### Requirement 3: Point Multiplier Card Input

**User Story:** As a user, I want to enter the count of each multiplier card, so that the app can calculate multiplier points based on related card counts.

#### Acceptance Criteria

1. THE Score_Entry_Screen SHALL display a numeric input for Lighthouse card count for each player
2. THE Score_Entry_Screen SHALL display a numeric input for Shoal of Fish card count for each player
3. THE Score_Entry_Screen SHALL display a numeric input for Penguin Colony card count for each player
4. THE Score_Entry_Screen SHALL display a numeric input for Captain card count for each player
5. THE Scoring_Engine SHALL calculate Lighthouse points as Lighthouse count multiplied by the total number of Boat pair cards (each pair contributes 2 cards) from Duo_Cards input, with each Lighthouse scoring 1 point per boat card
6. THE Scoring_Engine SHALL calculate Shoal of Fish points as Shoal of Fish count multiplied by the total number of Fish pair cards (each pair contributes 2 cards) from Duo_Cards input, with each Shoal scoring 1 point per fish card
7. THE Scoring_Engine SHALL calculate Penguin Colony points as Penguin Colony count multiplied by the Penguin card count from Collector_Cards input, with each Colony scoring 2 points per penguin card
8. THE Scoring_Engine SHALL calculate Captain points as Captain count multiplied by the Sailor card count from Collector_Cards input, with each Captain scoring 3 points per sailor card

### Requirement 4: Mermaid Card Input

**User Story:** As a user, I want to enter how many of each color I have for each mermaid, so that the app can calculate mermaid points correctly.

#### Acceptance Criteria

1. THE Score_Entry_Screen SHALL display a mermaid count input (0 to 4) for each player
2. WHEN a player's mermaid count is greater than 0, THE Score_Entry_Screen SHALL display a color count input for each mermaid, allowing the user to enter the number of cards of the chosen color for that mermaid
3. THE Scoring_Engine SHALL calculate each mermaid's points as the color count entered for that mermaid (1 point per card of the chosen color)
4. THE Scoring_Engine SHALL calculate total mermaid points as the sum of points from all individual mermaids for that player
5. IF a player sets a mermaid count of 4, THEN THE Score_Entry_Screen SHALL display a prompt asking whether to declare a Mermaid instant win

### Requirement 5: Card Score Calculation

**User Story:** As a user, I want the app to automatically total my card points from all categories, so that I do not have to add them up manually.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL calculate a player's Card_Score as the sum of duo points, collector points, multiplier points, and mermaid points
2. THE Score_Entry_Screen SHALL display the calculated Card_Score for each player in real time as inputs change
3. WHEN the Round_End_Type is STOP or EMPTY_DECK, THE Scoring_Engine SHALL set each player's Round_Score equal to the player's Card_Score

### Requirement 6: Last Chance Flow

**User Story:** As a user, I want the app to handle Last Chance scoring correctly, so that the caller's bet outcome determines who gets card points and who gets only a color bonus.

#### Acceptance Criteria

1. WHEN the Round_End_Type is LAST_CHANCE, THE Score_Entry_Screen SHALL prompt the user to select which player is the Caller
2. WHEN all players' Card_Breakdowns are submitted in a LAST_CHANCE round, THE Scoring_Engine SHALL compare the Caller's Card_Score against all opponents' Card_Scores to determine the Last_Chance_Outcome
3. WHEN the Caller's Card_Score is greater than or equal to every opponent's Card_Score, THE Scoring_Engine SHALL set the Last_Chance_Outcome to won
4. WHEN at least one opponent's Card_Score is strictly greater than the Caller's Card_Score, THE Scoring_Engine SHALL set the Last_Chance_Outcome to lost
5. THE Score_Entry_Screen SHALL display the Last_Chance_Outcome to the user before prompting for color bonus input
6. WHEN the Last_Chance_Outcome is won, THE Score_Entry_Screen SHALL prompt for the Caller's Color_Bonus input
7. WHEN the Last_Chance_Outcome is won, THE Scoring_Engine SHALL set the Caller's Round_Score to Card_Score plus Color_Bonus
8. WHEN the Last_Chance_Outcome is won, THE Scoring_Engine SHALL set each opponent's Round_Score to that opponent's Color_Bonus only
9. WHEN the Last_Chance_Outcome is lost, THE Score_Entry_Screen SHALL prompt for the Caller's Color_Bonus input
10. WHEN the Last_Chance_Outcome is lost, THE Scoring_Engine SHALL set the Caller's Round_Score to the Caller's Color_Bonus only
11. WHEN the Last_Chance_Outcome is lost, THE Scoring_Engine SHALL set each opponent's Round_Score to that opponent's Card_Score
12. THE Score_Entry_Screen SHALL prompt for each player's Color_Bonus input as a single numeric value (the count of cards of the player's most-held color)

### Requirement 7: Card Breakdown Data Model

**User Story:** As a developer, I want the card breakdown stored alongside each round, so that scores can be audited and recalculated if needed.

#### Acceptance Criteria

1. THE App SHALL store each player's Card_Breakdown as part of the Round data
2. THE App SHALL store the Caller player index and Last_Chance_Outcome for LAST_CHANCE rounds
3. THE App SHALL store each player's Color_Bonus value for LAST_CHANCE rounds
4. WHEN a saved Game_Session from a previous app version contains rounds without Card_Breakdown data, THE App SHALL treat those rounds as legacy rounds and display the stored total score without breakdown details

### Requirement 8: Card Breakdown Serialization

**User Story:** As a developer, I want card breakdown data to survive app restarts, so that detailed score data is not lost.

#### Acceptance Criteria

1. THE App SHALL persist Card_Breakdown data as part of the Game_Session serialization
2. FOR ALL valid Card_Breakdown objects, serializing then deserializing SHALL produce an equivalent Card_Breakdown (round-trip property)
3. THE App SHALL serialize the Caller index and Last_Chance_Outcome for LAST_CHANCE rounds

### Requirement 9: Input Validation

**User Story:** As a user, I want the app to prevent me from entering invalid card counts, so that calculated scores are always correct.

#### Acceptance Criteria

1. IF a Duo_Cards input value is negative or not an integer, THEN THE Score_Entry_Screen SHALL display a validation error and prevent submission
2. IF a Collector_Cards input value exceeds the maximum for that type (Shells: 6, Octopus: 5, Penguins: 3, Sailors: 2), THEN THE Score_Entry_Screen SHALL display a validation error and prevent submission
3. IF a Mermaid color count is negative or not an integer, THEN THE Score_Entry_Screen SHALL display a validation error and prevent submission
4. IF a Color_Bonus value is negative or not an integer, THEN THE Score_Entry_Screen SHALL display a validation error and prevent submission
5. THE Score_Entry_Screen SHALL default all card count inputs to 0
