var prompt = require('prompt');

prompt.start();
  
const randomNumber = Math.floor(Math.random() * 11);
const maxLives = 5;
var fails = 0;

const guessNumber = () => {
    if(fails != maxLives - 1) {
        prompt.get(['number'], function (err, result) {
            var guess = parseInt(result.number);
            if (guess === randomNumber) {
                console.log('You guessed correctly! You win!');
                } else if (guess !== randomNumber) {
                console.log("That's not it, try again!");
                guessNumber();
                fails++;
                } else {
                console.log('Please enter a valid number.');
                guessNumber();
                }
        });
    } else {
        console.log("You're out of lives, game over :/");
    }
}

guessNumber();