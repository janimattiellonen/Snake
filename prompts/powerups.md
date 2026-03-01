# Powerups


Powerups are items that gives the snake some additional capabilities for a short period of time or other kind
of benefits like destroying the apple.

Suggest cool powerups that we could implement in this game.


## Design

We need a Powerup data model that allows us to create custom powerups and their capabilities.

Here below are some powerups suggested by you (Claude):

```
Speed/Movement
- Slow Motion — Reduces tick speed for ~5 seconds, giving more reaction time
- Ghost Mode — Snake can pass through its own body for ~5 seconds (wall collision still kills)
- Reverse — Snake direction flips and the tail becomes the head momentarily

Scoring
- Double Points — Apples are worth 2 points for ~10 seconds
- Apple Magnet — The next apple spawns adjacent to the snake's head (easy grab)

Size
- Shrink — Snake loses 3 segments instantly (minimum 1), making navigation easier
- Bomb — Destroys the current apple in an explosion (bigger particle burst) and spawns a new one elsewhere —
  useful if the apple is in a dangerous spot

Board
- Warp Walls — For ~8 seconds, hitting a wall teleports to the opposite side instead of dying
- Trail Eraser — Snake doesn't grow for the next 3 apples eaten (score still counts)

Visual/Fun
- Shield — Survive one collision (wall or self), consumed on impact with a shatter effect
- Speed Boost — Temporarily faster movement for bonus points per apple (high risk, high reward)

```

Even if we might not implement all of these, they give us a foundation to build on. Each powerup needs 
to contain everything the game needs to know to activate the powerup.

Use the list above as a reference. Start working on a design that allows us to easilly implement new powerups 
and powerups mention above.

Show me how you would implement 3 powerups from the list.


## New powerups

Scoring
- Double Points — Apples are worth 2 points for 20 seconds
- Apple Magnet — The next apple spawns adjacent to the snake's head (easy grab).

Bomb
- Destroys the current apple in an explosion (bigger particle burst) and spawns a new one elsewhere —
  useful if the apple is in a dangerous spot. This powerup should stay until used or another powerup is taken.
- When active, the "bomb" powerup is used by pressing the space key. Mention this in the Help menu
  under the Bomb powerup.


## Powerups menu

As the game is under development, I'd like to be able to choose, what powerup comes next. Create a "Powerups"
menu (button named "Powerups", use different color then the blue that is used).

List available powerups in the menu. Also index them [1, 2, 3 ...] and show the index number in parentheses.
The powerup at a given index may be selected either by cliking on the powerup, or pressing the numeric key 
corresponding to the index number


## Changes to Magnet powerup

When the snake's head is within 3 elements of the next apple, make the head pull the apple towards the head, 
until the apple is eaten. 

If magnet powerup is active and the head comes close enough but passes the apple, the apple starts to "race"
with the head and tries catching up. Also, the magnet effect is a bit slugish. Can you make the animation of 
the apple getting drawn closer to the head a bit smoother. 

When the magnet powerup is active, no visible hints is given.

## Slow motion improvements

The snake's movement, when "Slow motion" powerup is active, is sluggish. Can you make the snake's movement slow but smooth?

## Custom probability

Add support for varying probability of a certain powerup to show up. The more powerful powerup, the less
probability for it to show up next. Define a probability scale that can be used. One end of the scale
means that a certain powerup's probability is high and the other end means a low probability for a certain
powerup to show up.

Current powerups:
- Slow motion: very high probability
- Ghost mode: high probability
- Shield: high probability
- Double points: low probability
- Apple magnet: very low probability
- Bomb: low probability