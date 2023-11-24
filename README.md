# Following a [tutorial series](https://doc.babylonjs.com/guidedLearning/createAGame) about how to build a game with BabylonJS
This code is not my original design, I have made small changes but the codebase is from the linked tutorial.

## Running Locally
install dependencies (npm) 
```
npm install
```

start local game server
```
npm run start
```

Navigate to [localhost:8080/](http://localhost:8080/)

## Codebase Improvements
Better separation of concerns.
- some components of this application are too overloaded and should be split into smaller components
- components could be split into meaningul sections to improve scalability

DRYer code.
- there are several opportunites to simplify the code and avoid repetition by converting commonly used patterns into reusable functions or modules (e.g. creating a new scene)
- game state machine is overly repeated and would benefit from restructuring into a more modular design

More variables and constants.
- there are instnaces of hard-coded colors and values that could be extracted into constants (this would make changing values 10x easier and improve code readability by applying meaningful names to code like `Color4(0, 0, 0, 1)` which is just black)

Lose the classes.
- I like OOP, but as a personal perference I use functional patterns that are more aligned with how JavaScript was originally designed (again, personal preference)

## Current tutorial progress
5/16 modules completed
