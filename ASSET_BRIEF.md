# Sea Salt Scorekeeper — Designer Asset Brief

## About the App

Sea Salt Scorekeeper is a score-tracking companion app for the card game "Sea Salt & Paper." The app runs on iOS, Android, and web. The current placeholder icons use an origami line-art style, but the designer has full creative freedom to establish the final visual direction.

---

## Style Guide

- **Theme**: Origami / folded paper — but the designer has full creative freedom on colors, shading, and style
- **Icon style**: Full-color, designer's choice. These will be displayed directly as-is in the app (not recolored at runtime)
- **Delivery format for icons**: SVG (preferred) or PNG. If PNG, deliver at **3x resolution** (72×72 px for a 24dp icon) to support high-density screens. Include @1x (24×24), @2x (48×48), and @3x (72×72) variants, or deliver a single high-res SVG.
- **Delivery format for raster assets**: PNG
- **Icon sizes in-app**: Icons are displayed at various sizes — most commonly 24dp, but also 14dp, 16dp, 20dp, and 64dp (trophy on game-over screen). Designs must remain clear and recognizable at the smallest size (14dp).
- **Background**: Icons will be displayed on a light/white background (#FFFFFF) in most contexts. Some icons appear on colored banners — the designer should ensure they work on both light and accent-colored backgrounds.

---

## Section 1: App & Store Raster Assets

| #   | Asset                       | Filename                      | Size         | Format                                   | Guidance                                                                                                                                                                                                                  |
| --- | --------------------------- | ----------------------------- | ------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | App Icon                    | `icon.png`                    | 1024×1024 px | PNG, no transparency, no rounded corners | Main brand mark for both stores. Must be recognizable at 60×60 px. Stores apply their own corner rounding/masking — do not add any.                                                                                       |
| R2  | Splash Screen               | `splash-icon.png`             | 1284×2778 px | PNG                                      | Shown on app launch. Center the logo, keep it minimal. Background edges must match the app background color (currently white #FFFFFF). Avoid text — it won't scale across device sizes.                                   |
| R3  | Android Adaptive Foreground | `android-icon-foreground.png` | 432×432 px   | PNG, transparent background              | Logo layer for Android adaptive icons. **Keep all content within the center 288×288 px safe zone** — the OS crops the outer area into circles, squircles, etc. Test with [adapticon.tooo.io](https://adapticon.tooo.io/). |
| R4  | Android Adaptive Background | `android-icon-background.png` | 432×432 px   | PNG                                      | Layer behind the foreground. Can be a solid color, gradient, or pattern.                                                                                                                                                  |
| R5  | Android Adaptive Monochrome | `android-icon-monochrome.png` | 432×432 px   | PNG, transparent background              | Single-color silhouette for Android 13+ themed icons. Same 288×288 px safe zone as foreground. Should be a simplified version of the icon that reads well as a flat shape.                                                |
| R6  | Web Favicon                 | `favicon.png`                 | 48×48 px     | PNG                                      | Tiny version for browser tabs. Keep it extremely simple — just the core mark.                                                                                                                                             |
| R7  | Play Store Feature Graphic  | _(new file)_                  | 1024×500 px  | PNG or JPG                               | **Required** for Google Play listing. Banner at top of the store page. Can include app name, tagline, and key visual.                                                                                                     |

---

## Section 2: In-App Icons

### 2A: UI / Game Mechanic Icons

These represent game actions, states, and UI elements. They appear in the scoreboard, round headers, and game-over screen.

| #   | Icon             | What It Represents                                                      | Where Used                                                     | Display Sizes  | Design Guidance                                                                                                                                                                                                   |
| --- | ---------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I01 | **DuoIcon**   | Duo Cards in the game(a set of cards palyed in pairs, 1p each)            | In the heading of the scoreboard table to indicate the section | 14dp, 24dp | The duo card types are Crab, Fish, Boat, and Shark+Swimmer. Currently the icon is a crab. Open to making the display larger if needed to effectively communicate |
| I02 | **CollectorCardsIcon**   | Collector cards are worth more the more of them you collect  | In the heading of the scoreboard table to indicate the section | 14dp, 24dp | The collector card types are shells, octopus, penguins and sailors(anchors). Currently the icon is a shell. Open to making the display larger if needed to effectively communicate |
| I03 | **MermaidIcon**   | Mermaid cards in game  | In the heading of the scoreboard table to indicate the section, also used in the history to indicate a mermaid victory | 14dp, 20dp, 24dp | A mermaid with a tail. This icon appears in the most contexts and at the most sizes — needs to work well across all of them. Also used as a small badge next to the winner's name when they win via mermaid collection. |
| I04 | **TrophyIcon**   | Winner / victory                                                        | Winner banner on scoreboard, game-over screen                  | 20dp, **64dp** | A trophy or cup. Displayed prominently at 64dp on the game-over screen — this is the largest icon in the app, so it can have more detail than the others. Also used small (20dp) in the scoreboard winner banner. |
| I05 | **LastChanceIcon**     | "Last Chance" round type — a player gambled on one more round           | Round type indicator in scoreboard rows, score breakdown modal | 14dp, 24dp     | Indicates that a player gambled they could still win the round even if everyone else had one more turn. Currently a die                                      |
| I06 | **StopHandIcon** | "Stop" round type — a player chose to end the round                     | Round type indicator in scoreboard rows                        | 14dp, 24dp     | A stop/halt gesture (raised hand, stop sign, etc.). Must clearly communicate "stop" or "halt." Used at 14dp in scoreboard rows.                                                                                   |
| I07 | **DeckIcon**     | "Empty Deck" round type — the round ended because the draw pile ran out | Round type indicator in scoreboard rows                        | 14dp, 24dp     | A card deck or stack of cards. Must communicate "deck" or "cards." Used at 14dp in scoreboard rows.                                                                                                               |


## Section 3: Background Waves

A set of assets representing what look like ocean waves cut out of construction paper that can be layered on top of each other and sway side to side to look like rolling ocean.

## Appendix

Looking for icons that look like folded paper to represent the following things: 

- Duo Cards indicator(currently crab icon)
- Collector Cards indicator(currently shell icon)
- Mermaids Cards indicator(currently super bad mermaid)
- Stop Icon 
  - Shown on the score board to indicate that the round was ended by a "stop"
  - Currently a hand in the "stop" position
- Last Chance Icon
  - Shown on the score board to indicate that the round was ended by a "last chance"
  - Currently a die 
  - Indicates that a player gambled they could still win the round even if everyone else had one more turn
- Empty Deck icon
- Trophy icon when the round is over
- Mermaid icon to indicate a mermaid victory(larger than the one above)
- App icon
  - Thinking an origami S/5 since they look similar?
- Construction paper waves for the background of the app
  - These offer a small ambiance to the app. They are layered on top of each other and add to the ocean vibe.
  - Want these to resemble ocean waves cut out of construction paper that will sway side to side creating a light ocean movement to the player
