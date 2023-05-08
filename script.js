let dictionary = [];
let targetWords = [];
let targetWord = "";

fetch('./dictionary.json').then(response=>response.json()).then(data=>{dictionary=[...data]});
fetch('./targetWords.json').then(response=>response.json()).then(data=>{targetWords=[...data];  targetWord=targetWords[Math.floor(Math.random() * targetWords.length - 1)];})
let temp = '';
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const WORD_LENGTH = 5;
const guessGrid = document.querySelector('[data-guess-grid]');
const alertContainer = document.querySelector('[data-alert-container]');
const keyboard = document.querySelector('[data-keyboard]');
startInteraction();

function startInteraction() {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener('click', handleMouseClick);
  document.removeEventListener('keydown', handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches('[data-key]')) {
    pressKey(e.target.dataset.key);
    return;
  }
  if (e.target.matches('[data-enter]')) {
    submitGuess();
    return;
  }

  if (e.target.matches('[data-delete]')) {
    deleteKey();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    submitGuess();
    return;
  }

  if (e.key === 'Backspace' || e.key === 'Delete') {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) {
    return;
  }
  const nextTile = guessGrid.querySelector(':not([data-letter]');
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = 'active';
}

const getActiveTiles = () =>
  guessGrid.querySelectorAll('[data-state="active"]');

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = '';
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert('Not enough letters');
    shakeTiles(activeTiles);
    return;
  }
  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, '');

  if (!dictionary.includes(guess)) {
    showAlert('Not in word list');
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => {
    // console.log({ params });
    flipTile(...params, guess);
  });
  temp = '';
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter.toLowerCase();
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  // console.log(key);
  setTimeout(() => {
    tile.classList.add('flip');
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    'transitionend',
    () => {
      tile.classList.remove('flip');
      tile.classList.add("tile-dark")
      key.classList.add('tile-dark')
      if (targetWord[index] === letter) {
        temp += letter;
        tile.dataset.state = 'correct';
        key.classList.add('correct');
      } else if (targetWord.includes(letter)) {
        if (temp.split(letter).length < targetWord.split(letter).length) {
          tile.dataset.state = 'wrong-location';
          key.classList.add('wrong-location');
          temp += letter;
        } else {
          tile.dataset.state = 'wrong';
          key.classList.add('wrong');
        }
      } else {
        tile.dataset.state = 'wrong';
        key.classList.add('wrong');
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          'transitionend',
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement('div');
  alert.textContent = message;
  alert.classList.add('alert');
  alertContainer.prepend(alert);
  if (duration === null) return;
  setTimeout(() => {
    alert.classList.add('hide');
    alert.addEventListener('transitionend', () => {
      alert.remove();
    });
  }, duration);
}

// Parameters may be declared in a variety of syntactic forms
/**
 * @param {Element[]} activeTiles - The active tiles that are written in the game
 */

function shakeTiles(activeTiles) {
  activeTiles.forEach((tile) => {
    tile.classList.add('shake');
    tile.addEventListener(
      'animationend',
      () => {
        tile.classList.remove('shake');
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert('You win', 5000);
    danceTiles(tiles);
    stopInteraction();
    showConfettis();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(':not([data-letter])');

  if (remainingTiles.length === 0) {
    showAlert(`The word was ${targetWord.toUpperCase()}`, null);
    stopInteraction();
  }
}

/**
 * @param {Element[]} tiles - The tiles that are active
 */

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add('dance');
      tile.addEventListener(
        'animationend',
        () => {
          tile.classList.remove('dance');
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}

/*
  Confetti animation https://stackoverflow.com/a/64503571/14563882 Javascript portion. just making 20 
  different confetti div's and then changing their colors and animation delay by using javascript 
  Math.random(). removing the hidden attribute because the container is hidden at the start. And this 
  function only runs when the user wins the game, i.e. when the user correctly guesses the target word 
  in 5 attempts, by using any hints that the game has provided 
*/
const colors = ['#f2d74e', '#95c3de', '#ff9a91'];

function showConfettis() {
  const confettiContainer = document.getElementById('confettis');
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');

    confetti.style.backgroundColor = colors[Math.floor(Math.random() * 3)];
    confetti.style.animationDelay = i === 0 ? '0' : `${Math.random() * 5}s`;
    confetti.style.left = `${(i % 10) * 10}%`;
    confetti.style.top = '-5%';
    confettiContainer.appendChild(confetti);
  }
  confettiContainer.classList.remove('hidden');
}



const themeIcon = document.getElementById("theme-icon")
const darkIcon = document.getElementsByClassName("dark-icon")[0]
const lightIcon= document.getElementsByClassName("light-icon")[0]
const root = document.querySelector(':root');
const tiles = document.querySelectorAll('.tile');
themeIcon.addEventListener('click',()=>{
  if(themeIcon.dataset.theme==="dark"){
    root.style.setProperty('--text-white',"#000000")

    themeIcon.dataset.theme ="light"
    document.body.style.backgroundColor ="white";
    darkIcon.classList.add("hidden")
    lightIcon.classList.remove("hidden")
    themeIcon.style.color="black"
    themeIcon.style.borderColor="black"
  }else {
    root.style.setProperty('--text-white',"#ffffff");
    themeIcon.dataset.theme ="dark"
    document.body.style.backgroundColor ="hsl(240, 3%, 7%)";
    darkIcon.classList.remove("hidden")
    lightIcon.classList.add("hidden")
    themeIcon.style.color="white"
    themeIcon.style.borderColor="white"
  }
})
