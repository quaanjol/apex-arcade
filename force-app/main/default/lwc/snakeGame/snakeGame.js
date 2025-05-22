import { LightningElement } from 'lwc';
import snakeHead from '@salesforce/resourceUrl/snake_head';
import snakeBody from '@salesforce/resourceUrl/snake_body';
import snake_apple from '@salesforce/resourceUrl/game_apple_image';
import snake_shit from '@salesforce/resourceUrl/game_shit_image';
import quack_sound from "@salesforce/resourceUrl/quack_sound";
import game_music_1 from "@salesforce/resourceUrl/game_music_1";
import success_sound_1 from "@salesforce/resourceUrl/success_sound_1";
import FORM_FACTOR from '@salesforce/client/formFactor';

const LEFT = {
  direction: 'left',
  headBorderRadius: '0% 50% 50% 0%',
  rotate: '180deg',
};
const RIGHT = {
  direction: 'right',
  headBorderRadius: '0% 50% 50% 0%',
  rotate: '0deg',
};
const UP = {
  direction: 'up',
  headBorderRadius: '0% 50% 50% 0%',
  rotate: '-90deg',
};
const DOWN = {
  direction: 'down',
  headBorderRadius: '0% 50% 50% 0%',
  rotate: '90deg',
};

const DIRECTIONS = {
  right: RIGHT,
  left: LEFT,
  up: UP,
  down: DOWN,
}

export default class SnakeGame extends LightningElement {
  playButtonIcon = 'utility:play';
  isPlaying = false;
  playingMusic = false;
  startButtonLabel = 'Start';
  playMusicButtonLabel = 'Play music';

  color1 = '#000000';
  color2 = '#ef4444';
  currentDirection = DIRECTIONS.right.direction;
  snake = [2, 1, 0];
  mapRows = 8;
  gameInterval = null;
  speed = 1;
  interval = 500;
  points = 0;
  highestPoint = 0;
  drawFirstTime = false;
  appleIndex = -1;
  shitIndexes = [];

  bgAudio = new Audio(game_music_1);
  quackAudio = new Audio(quack_sound);
  eatAudio = new Audio(success_sound_1);

  // this means shit appear every 5 points
  shitFrequency = 5;

  get isMobile() {
    return FORM_FACTOR == 'Small';
  }

  get isTablet() {
    return FORM_FACTOR == 'Medium';
  }

  get isDesktop() {
    return FORM_FACTOR == 'Large';
  }

  get maxGameWidth() {
    if (this.isMobile) {
      return 300;
    }

    if (this.isTablet) {
      return 450;
    }

    if (this.isDesktop) {
      return 560;
    }
  }

  get mapContainerClass() {
    return 'map-container ' + 'w-' + this.maxGameWidth + 'px';
  }

  get getBoxWithClass() {
    return `w-${this.maxGameWidth / this.mapRows}px`;
  }

  get mapRowsArr() {
    let res = [];
    for(let i = 0; i < this.mapRows; i++) {
      for(let j = 0; j < this.mapRows; j++) {
        res.push({
          index: i * this.mapRows + j,
          isOdd: (i + j) % 2 === 0,
          row: i,
          col: j,
          classes: `map-cell ${this.getBoxWithClass} ` + ((i + j) % 2 === 0 ? 'map-cell-odd' : 'map-cell-even')
        })
      }
    }
    return res;
  }

  handlePlayMusic(e) {
    this.playingMusic = !this.playingMusic;
    if (this.playingMusic) {
      this.bgAudio.pause();
      this.playMusicButtonLabel = 'Play music';
    } else {
      this.bgAudio.play();
      this.playMusicButtonLabel = 'Stop music';
    }
  }

  toggleStartGame(e) {
    let that = this;
    if (this.isPlaying) {
      this.isPlaying = false;
      this.playButtonIcon = 'utility:play';
      this.startButtonLabel = 'Start';
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
      }
    } else {
      this.isPlaying = true;
      this.playButtonIcon = 'utility:pause';
      this.startButtonLabel = 'Pause';
      this.gameInterval = setInterval(() => {
        that.moveSnake();
      }, that.speed * that.interval);
    }
  }

  moveSnake() {
    try {
      let snake = [...this.snake];
      let popped = snake.pop();
      let head = snake[0];
      let cells = this.template.querySelectorAll('.map-cell');
      let headCell = Array.from(cells).find(cell => cell.dataset.index == `${head}`);
      if(!headCell) {
        alert('Cannot find head!');
        this.resetGame();
        return;
      }
      let poppedBox = Array.from(cells).find(cell => cell.dataset.index == `${popped}`);
      if(poppedBox) {
        poppedBox.classList.remove('head', 'body');
        poppedBox.innerHTML = '';
      }
      let currentRow = headCell.dataset.row;
      let currentCol = headCell.dataset.col;
      
      // check snake move
      if(this.checkSnakeMove(currentRow, currentCol)) {
        this.alertGameOver('Game Over! You hit the wall!');
        return;
      }

      let newHead = this.getNewHead(headCell);
      if(newHead < 0) {
        this.alertGameOver('Cannot get new head or you bit yourself!?!');
        return;
      }

      // TO DO: check if snake eats apple or shit
      snake = this.checkEatAppleOrShit(snake, newHead, popped);
      snake.unshift(newHead);
      this.snake = snake;
      this.drawSnake();
    } catch(err) {
      this.alertGameOver('Error: ' + err);
      this.resetGame();
    }
  }

  alertGameOver(message) {
    alert(message);
    this.quackAudio.play();
    this.resetGame();
  }

  checkEatAppleOrShit(snake, newHead, popped) {
    if(newHead == this.appleIndex) {
      this.points += 1;
      this.eatAudio.play();
      if(this.points % this.shitFrequency == 0) {
        this.drawShits(-1);
      }
      this.appleIndex = -1;
      this.drawApple();

      // increase snake's length
      this.increaseSnakeLength(snake, popped);

      // increase spped game
      this.increaseGameSpeed();
    }

    if(this.shitIndexes.indexOf(newHead) != -1) {
      this.drawShits(newHead);
      this.quackAudio.play();
    }
    return snake;
  }

  increaseSnakeLength(snake, popped) {
    snake.push(popped);
    return snake;
  }

  increaseGameSpeed() {
    this.speed = this.speed * 0.9;
    if(this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    let that = this;
    this.gameInterval = setInterval(() => {
      that.moveSnake();
    }, that.speed * that.interval);
  }

  resetGame() {
    clearInterval(this.gameInterval);
    this.currentDirection = DIRECTIONS.right.direction;
    this.snake = [2, 1, 0];
    if(this.highestPoint < this.points) {
      this.highestPoint = this.points;
    }
    this.points = 0;
    this.speed = 1;

    let cells = this.template.querySelectorAll('.map-cell');
    Array.from(cells).forEach(cell => {
      cell.classList.remove('apple', 'shit', 'head', 'body');
      cell.innerHTML = '';
    });
    this.drawSnake();
    this.drawApple();
    this.drawShits(-1);
  }

  getNewHead(headCell) {
    let newHead = -1;
    if(this.currentDirection == DIRECTIONS.right.direction) {
      newHead = parseInt(headCell.dataset.index) + 1;
    }
    if(this.currentDirection == DIRECTIONS.left.direction) {
      newHead = parseInt(headCell.dataset.index) - 1;
    }
    if(this.currentDirection == DIRECTIONS.up.direction) {
      newHead = parseInt(headCell.dataset.index) - this.mapRows;
    }
    if(this.currentDirection == DIRECTIONS.down.direction) {
      newHead = parseInt(headCell.dataset.index) + this.mapRows;
    }
    return newHead;
  }

  checkSnakeMove(currentRow, currentCol) {
    // snake cannot hit the wall :D
    return (parseInt(currentRow) == 0 && this.currentDirection == DIRECTIONS.up.direction) ||
           (parseInt(currentRow) == this.mapRows - 1 && this.currentDirection == DIRECTIONS.down.direction) ||
           (parseInt(currentCol) == 0 && this.currentDirection == DIRECTIONS.left.direction) ||
           (parseInt(currentCol) == this.mapRows - 1 && this.currentDirection == DIRECTIONS.right.direction);
  }

  drawSnake() {
    let mapCells = this.template.querySelectorAll('.map-cell');
    let isHead = false;
    let snakeBox, snakeColor;
    for(let i = 0; i < this.snake.length; i++) {
      isHead = false;
      if(i == 0) {
        isHead = true;
      }
      if(i % 2 ==0) {
        snakeColor = this.color1;
      } else {
        snakeColor = this.color2;
      }
      Array.from(mapCells).forEach(cell => {
        if(cell.dataset.index == `${this.snake[i]}`) {
          let style = '';
          if(isHead) {
            // rorate snake head based on current direction
            style = `background-color: ${snakeColor}; border-radius: ${DIRECTIONS[this.currentDirection].headBorderRadius}; transform: rotate(${DIRECTIONS[this.currentDirection].rotate});`;
            snakeBox = `<img src="${snakeHead}" class="snake-head" style="${style}" />`;
          } else {
            style = `background-color: ${snakeColor};`;
            snakeBox = `<img src="${snakeBody}" class="snake-body" style="${style}" />`;
          }
          if(isHead) {
            cell.classList.add('head');            
          } else {
            cell.classList.add('body');
          }
          cell.innerHTML = snakeBox;
        } else {
          cell.classList.remove('head', 'body');          
        }
      });
    }
  }

  controlSnake(e) {
    let keyCode = e.keyCode;
    if(keyCode == 37) {
      this.currentDirection = DIRECTIONS.left.direction;
    } else if(keyCode == 38) {
      this.currentDirection = DIRECTIONS.up.direction;
    } else if(keyCode == 39) {
      this.currentDirection = DIRECTIONS.right.direction;
    } else if(keyCode == 40) {
      this.currentDirection = DIRECTIONS.down.direction;
    }
  }

  renderedCallback() {
    if(!this.currentDirection) {
      this.currentDirection = DIRECTIONS.right.direction;
    }
    this.drawSnake();

    if(!this.drawFirstTime) {
      this.drawFirstTime = true;
      this.drawApple();
      this.drawShits(-1);
    }
  }

  drawApple() {
    do {
      this.appleIndex = Math.floor(Math.random() * this.mapRows * this.mapRows);
    } while(this.appleIndex < 0 || this.snake.indexOf(this.appleIndex) != -1 || this.shitIndexes.indexOf(this.appleIndex) != -1);
    let cells = this.template.querySelectorAll('.map-cell');
    Array.from(cells).forEach(cell => {
      if(cell.classList.contains('apple')) {
        cell.classList.remove('apple');
        cell.innerHTML = '';
      }
      if(cell.dataset.index == `${this.appleIndex}`) {
        cell.classList.add('apple');
        cell.innerHTML = `<img src="${snake_apple}" class="apple" />`;
      }
    });

  }

  // take in a shit to delete
  drawShits(shitToDelete) {
    let shits = [...this.shitIndexes];
    if(shitToDelete != -1) {
      shits.splice(shitToDelete, 1);
    }
    let shit = -1;
    do {
      shit = Math.floor(Math.random() * this.mapRows * this.mapRows);
    } while(shit < 0 || this.snake.indexOf(shit) != -1 || this.appleIndex == shit || shits.indexOf(shit) != -1);
    let cells = this.template.querySelectorAll('.map-cell');
    Array.from(cells).forEach(cell => {
      if(cell.classList.contains('shit')) {
        cell.classList.remove('shit');
        cell.innerHTML = '';
      }
      if(cell.dataset.index == `${shit}`) {
        cell.classList.add('shit');
        cell.innerHTML = `<img src="${snake_shit}" class="shit" />`;
      }
    });
    this.shitIndexes = shits;
  }



  // add event listener for keydown
  connectedCallback() {
    window.addEventListener('keyup', e => {
      this.controlSnake(e)
    });
  }
}