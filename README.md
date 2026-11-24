# CS4032 Assignment 1 — Space Shooter

**Student name:** Asad Ali  
**Roll number:** 24I-2072  
**Course:** CS4032 Web Programming, BS-CY Fall 2026

## How to run

1. Keep `index.html`, `style.css`, `script.js`, and `README.md` in the same folder.
2. Open `index.html` in the latest Chrome or Microsoft Edge.
3. Click **Start Game**.
4. Hold the **Left Arrow** or **Right Arrow** key to move. The ship fires automatically.
5. Press **P** to pause or resume. Destroy each enemy for 10 points.
6. The game ends when all three lives are lost. Click **Play Again** to restart.

## Files

* `index.html` — semantic page structure, start screen, HUD, play area and Game Over screen.
* `style.css` — page styling, sprite appearance, animations and responsive layout.
* `script.js` — constants, state, game logic, DOM rendering, event listeners and game loop.

## Required concepts map

Line numbers can change if the code is edited. Check the final files and update this map before submitting.

|Concept|File|Where to find it|
|-|-|-|
|Semantic HTML, buttons, linked CSS/JS|`index.html`|Lines 1–12, 15–47|
|CSS selectors and cascade|`style.css`|Throughout|
|Flexbox layout|`style.css`|`body`, `.screen`, `.hud` rules|
|CSS positioning|`style.css`|`.game`, `.play-area`, `.sprite` rules|
|CSS animation and keyframes|`style.css`|`.explosion`, `@keyframes explode`, `.blink`|
|Responsive media query|`style.css`|`@media (max-width: 768px)`|
|Named constants|`script.js`|Section 1|
|One state object, arrays and object properties|`script.js`|Section 2|
|Random numbers and collision calculations|`script.js`|Section 3|
|DOM selection and element creation/removal|`script.js`|Section 4 and rendering functions|
|Template strings and `textContent`|`script.js`|Rendering functions|
|Event listeners|`script.js`|Section 5, final part|
|Keyboard events and `preventDefault()`|`script.js`|Final event-listener section|
|`requestAnimationFrame` and delta time|`script.js`|`gameLoop()`|
|Browser storage (`localStorage`)|`script.js`|`updateHighScore()` and `startGame()`|
|Collision detection and scoring|`script.js`|`checkCollisions()`|
|Restart without page reload|`script.js`|`startGame()`|

## Functional checks

Before submitting, test all 14 requirements from the assignment sheet in Chrome or Edge with DevTools Console open. In particular, check that `state.enemies.length` remains between 4 and 6 during play and that restarting does not make the game faster.

## Bonus features attempted

* Pause/resume with the **P** key.
* Enemy speed variation and a speed increase every 100 points.
* High score saved with `localStorage`.
* CSS explosion effect.
* `requestAnimationFrame` with delta time.
* Three lives and temporary blinking after a hit.
* Responsive layout.

## Credits

No third-party images, libraries or frameworks are used. Ship and enemy artwork is made with CSS.

