<template>
  <div id="minesweeperApp">
    <header>
      <nav>
        <div class="brand">
          <h1>Minesweeper</h1>
        </div>
      </nav>
    </header>
    <div class="message">
      <template v-if="gameOver">
      <h4 class="blink_me" v-if="gameWon">Congratulations!! You won the game. Play again.</h4>
      <h4 class="blink_me" v-else>Opps :( You lost the game. Better luck next time. Play again.</h4>
      </template>
    </div>
    <transition name="fade" mode="out-in" appear>
      <div class="container">
        <div class="gameboard">
          <table class="game" oncontextmenu="return false;">
            <tbody>
              <tr>
                <td class="tile-header" colspan="9">
                  <div class="counter" id="mines">{{ mineCounter }}</div>
                  <div class="counter" id="timer">{{ timer }}</div>
                  <button class="playButton" @click.prevent.stop="newGame" v-if="gameOver || firstPlay">Start</button>
                  <button class="playButton" @click.prevent.stop="newGame" v-else>Reset</button>
                </td>
              </tr>
              <tr v-for="row in tiles">
                <td class="tile" v-for="tile in row"
                     :class="[tile.classes, {'flagged': tile.flagged}]"
                     @click="openTile(tile, true)"
                     @contextmenu="flagTile(tile)">{{tile.text}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="menu">
          <ul>
            <li>
              <div class="dropdown">
                <button @click.prevent.stop="setDiff(1)" :class="{selected: difficulty === 1}">Easy</button>
                <button @click.prevent.stop="setDiff(2)" :class="{selected: difficulty === 2}">Normal</button>
                <button @click.prevent.stop="setDiff(3)" :class="{selected: difficulty === 3}">Hard</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  const diffToRow = { 1: 9, 2: 13, 3: 16 };
  const diffToCol = { 1: 9, 2: 13, 3: 16 };
  const tileClassMap = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight',
  };
  const tileText = {
    1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8',
  };

  export default {
    name: 'Minesweeper',
    data: () => {
      return {
        difficulty: 1, // Default difficulty level is easy
        tiles: [],
        gameStart: 0,
        elapsedTime: 0,
        windowTimer: null,
        displayGame: true,
        gameOver: false,
        firstPlay: true,
        gameWon: false,
        mineCounter: 0,
      };
    },
    computed: {
      rows() {
        const self = this;
        return diffToRow[self.difficulty];
      },
      columns() {
        const self = this;
        return diffToCol[self.difficulty];
      },
      timer() {
        const self = this;
        const totalSeconds = Math.floor(self.elapsedTime / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds - (minutes * 60);
        if (minutes.toString().length === 1) {
          minutes = `0${minutes}`;
        }
        if (seconds.toString().length === 1) {
          seconds = `0${seconds}`;
        }
        return `${minutes}:${seconds}`;
      },
    },
    created() {
      const self = this;
      self.initTiles();
    },
    methods: {
      /**
       * Calculate total number of mine bomb in the Minesweeeper board.
       */
      countTotalMines() {
        const self = this;
        let count = 0;
        self.tiles.forEach((row) => {
          row.forEach((tile) => {
            if (tile.mined) {
              count += 1;
            }
          });
        });
        self.mineCounter = count;
      },

      /**
       * Function for restarting the game.
       */
      restartGame() {
        const self = this;
        self.gameWon = false;
        self.newGame();
      },

      /**
       * Function for creating the new game board, initialize
       * the minesweeper tiles and restart the timer.
       */
      newGame() {
        const self = this;
        self.firstPlay = false;
        self.gameOver = false;
        self.initTiles();
        self.startTimer();
      },
      /**
       * Function for ending the game and to clear the game timer.
       */
      endGame() {
        const self = this;
        clearInterval(this.windowTimer);
        self.windowTimer = null;
        self.gameOver = true;
      },
      /**
       * Function to set the difficulty level.
       */
      setDiff(level) {
        const self = this;
        self.difficulty = level;
        self.newGame();
      },

      /**
       * Calculate the mine bomb probability.
       */
      mineProbability() {
        const self = this;
        const diffToProb = { 1: [10, 9], 2: [8, 7], 3: [6, 5] };
        const timesFactor = diffToProb[self.difficulty][0];
        const compareFactor = diffToProb[self.difficulty][1];
        return (Math.random() * timesFactor > compareFactor);
      },

      /**
       * Initialize the tile array with selected difficulty level. i.e.
       * for easy 9x9 grid
       * for Normal 13x13 grid
       * for Hard 16x16 grid
       */
      initTiles() {
        const self = this;
        self.tiles = new Array(self.rows).fill(0).map((row, rowIndex) => {
          return new Array(self.columns).fill(0).map((column, columnIndex) => {
            return {
              row: rowIndex,
              column: columnIndex,
              classes: [],
              flagged: false,
              mined: self.mineProbability(),
              text: '',
            };
          });
        });
        self.countTotalMines();
      },

      startTimer() {
        const self = this;
        self.gameStart = new Date().getTime();
        self.windowTimer = setInterval(() => {
          self.elapsedTime = (new Date().getTime() - self.gameStart);
        }, 1000);
      },

      openAllMines() {
        const self = this;
        self.tiles.forEach((row) => {
          row.forEach((tile) => {
            if (tile.mined) {
              // this.openTile(tile, false);
              if (tile.classes.indexOf('exposed') < 0) {
                tile.classes.push('exposed');
              }
              tile.classes.push('bomb');
            }
          });
        });
      },
      checkWin() {
        const self = this;
        let status = true;
        self.tiles.forEach((row) => {
          row.forEach((tile) => {
            if (!self.isOpened(tile) && !tile.mined) {
              status = false;
            }
          });
        });
        return status;
      },
      isOpened(tile) {
        return !(tile.classes.indexOf('exposed') < 0);
      },
      flagTile(tile) {
        tile.flagged = !tile.flagged;
      },
      openTile(tile, recursive = false) {
        if (this.firstPlay) {
          this.newGame();
          return;
        }
        // Only consider if the tile has not been touched
        if (!this.isOpened(tile) && !this.gameOver) {
          // Open the tile
          if (tile.classes.indexOf('exposed') < 0) {
            tile.classes.push('exposed');
          }
          if (this.checkWin()) {
            this.gameWon = true;
            this.endGame();
          }
          if (tile.mined) {
            tile.classes.push('bomb');
            this.endGame();
            this.openAllMines();
            return;
          }

          const neighbors = this.collectNeighbors(tile);
          const neighboringMines = this.countMines(neighbors);
          if (neighboringMines > 0) {
            tile.classes.push(tileClassMap[neighboringMines]);
            tile.text = tileText[neighboringMines];
            return;
          }
          const noNeighboringMines = true;

          // Open tiles recursively
          if (noNeighboringMines && recursive) {
            neighbors.forEach((neighborTile) => {
              // Do not open next neighbor recursively by default
              // It will check if it should during next pass
              // Open with timeout for looks :)
              const vm = this;
              setTimeout(() => {
                vm.openTile(neighborTile, true);
              }, 2);
            });
          }
          this.countTotalMines();
        }
      },
      collectNeighbors(tile) {
        // [[x, y]] relative coordinates
        const adjacentPositions = [
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 0],
          [1, -1],
          [0, -1],
          [-1, -1],
          [-1, 0]];
        const neighbors = [];

        adjacentPositions.forEach((position) => {
          const shiftRow = position[0];
          const shiftColumn = position[1];
          const row = tile.row + shiftRow;
          const column = tile.column + shiftColumn;
          if (this.findTile(row, column)) {
            neighbors.push(this.findTile(row, column));
          }
        });
        return neighbors;
      },
      findTile(row, column) {
        if (row < this.rows && row >= 0 && column < this.columns && column >= 0) {
          return this.tiles[row][column];
        }
        return false;
      },
      countMines(tileArray) {
        let count = 0;
        tileArray.forEach((tile) => {
          if (tile.mined) {
            count += 1;
          }
        });
        return count;
      },
    },
    beforeDestroy() {
      const self = this;
      self.endGame();
    },
  };
</script>
