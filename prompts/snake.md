# Snake

A classic game of snake, where the player tries to eat all the apples with the snake.

Every time the snake eats an apple, the player gets one point, and the snake grows one segment. If the snake's head touches the body, the game ends. 


## Tech stack

The game is built using Typescript and can be played in a web browser.

- React 19
- Typescript
- prettier
- lint
- typecheck
- Vite.js framework
- plain css. DO NOT install Tailwind
- use port 5194

## Gameplay

In the first version, show the game canvas when the user navigates to the website.

The game canvas should be a square and take most of the available space. Keep the canvas aspect ratio 1:1 at all times. It's ok to force the width and height to a minimum size.

When the user navigates to the page, the canvas should display the game's title, "Snake" and a button "Start game".

When the button is clicked, the game begins. The snake is initially just one segment long and is placed near the centre of the playing area, with little space for random positioning.

The snake "grows" from the tail. Every time the apple eaten, a new apple is placed randomly in a coordinate that is accessible by the snake. A coordinate is considered inaccessible, if the snake's head cannot reach it without touching an edges or itself. 

At any time, the user may click the esc key. In such case, the game is paused and a "Do you want to quit?" confirmation dialog is shown, allowing the user to either quit or continue playing.

The canvas consist of:
- score board that shows the player's current score
- playing area, inside which the snake can move freely. The playing area has a clear border. The border itself is the hard edge: if the snake touches the border: game over.

### Gameover

When the game ends, wither by the user cancelling, or the snake's head touches an edge or itself, a black rectangle is shown on the playing area with the text: 
"
       GAME OVER!

      xxxx points!
                      "
Below it a button "Start a new game" (which does what it says upon clicking it).


### Snake movement

- the snake can only move in straight lines
- the snake always turns 90 degrees
- the snake moves in a virtual grid, where each grid is equal the size of one snake segment. Each "step" the snake moves, is always a segment's height or width. Therefore, the snake can never "move" just a few pixels or half of a segment. Animation of the snake should still be smooth.
- the snake can be controlled by arrow and WASD keys.

### Game visuals

Initially, very simple visuals. No special effects and no sounds. 

Playing area colors:

- edge: #181717ff
- apple: #800000ff
- snake head: #2704edff
- snake body: #49bd07ff
- free space: #f3ececff

