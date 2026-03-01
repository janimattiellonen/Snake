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

