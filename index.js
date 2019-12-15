"use strict";

  /////////////
 //WordTaiko//
/////////////

const canvas = document.getElementById("wordTaiko");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;


const wordCount = 180;
const apiKey = "LLQTBJXD";
const http = new XMLHttpRequest();
const url = "https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number=" + wordCount;
const keyHitAudio = new Audio("audio/KeyHit.wav");

class WordTaiko {
    constructor() {
        this.wordsSpaced = "";
        this.placeX = window.innerWidth / 6;
        this.placeY = 20;
        this.gameState = false;
        this.placeTimer = 5;
        this.loopID = -1;

        //making checkKey.bind(this) a variable as needs to access
        //binded version in add/removeEventListener
        this.bindedCheckKey = this.checkKey.bind(this)

        this.resetGame();

        //start the blinking of the insert
        setInterval(this.placeCountdown.bind(this), 100);

    }

    resetGame() {
        //when reset, game does not start until input detected
        this.gameState = false;

        //stats
        this.wordsInput = [];
        this.currentChar = 0;
        this.gameStartTime = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.charactersPerMin = 0;
        this.wordsPerMin = 0;
        this.accuracy = 0;

        this.getWords();
        this.drawWords();
        this.resetGameTimer();
        this.drawStats();

        //stop current loop and add event listener again to allow input
        clearInterval(this.loopID);
        document.addEventListener("keydown", this.bindedCheckKey);
    }

    checkKey(event) {
        //start the game if key pressed and game hasnt started already
        if (!this.gameState) {
            this.startGame();
        }
        //delete pressed
        if (event.keyCode == 8) {
            //check word correctness for WPM
            if (this.wordsSpaced.charAt(this.currentChar) == " ") {
                let i = 1;
                let wordCorrect = true;
                while (this.currentChar - i > 0 && this.wordsSpaced.charAt(this.currentChar - i) != " ") {
                    if (this.wordsInput[this.currentChar - i].correct == false) {
                        wordCorrect = false;
                        break;
                    }
                    i++;
                }
                if (wordCorrect) {
                    this.wordsPerMin--;
                }
            }
            //removes last char and checks if it is correct
            if (this.wordsInput.length != 0 && this.wordsInput.pop().correct == true) {
                this.charactersPerMin--;
            }
            //reset combo
            this.combo = 0;
            this.currentChar--;
            if (this.currentChar < 0) {
                this.currentChar = 0
            }
            this.playKeyHitAudio();

        //printable chars
        } else if (event.key.length === 1) {
            let correctChar = (event.key == this.wordsSpaced.charAt(this.currentChar));
            this.wordsInput.push({
                key: event.key,
                correct: correctChar
            });
            //increment CPM when correct char otherwise do nothing
            if (correctChar) {
                this.charactersPerMin++;
                this.combo++;
            } else {
                this.combo = 0;
            }
            //check word correctness for WPM
            if (this.wordsSpaced.charAt(this.currentChar + 1) == " ") {
                let i = 0;
                let wordCorrect = true;
                while (this.currentChar - i > 0 && this.wordsSpaced.charAt(this.currentChar - i) != " ") {
                    if (this.wordsInput[this.currentChar - i].correct == false) {
                        wordCorrect = false;
                        break;
                    }
                    i++;
                }
                if (wordCorrect) {
                    this.wordsPerMin++;
                }
            }
            this.currentChar++;
            this.playKeyHitAudio();
        }

        //check maxCombo
        if (this.maxCombo < this.combo) {
            this.maxCombo = this.combo;
        }

        //calc accuracy to 1dp percentage
        this.accuracy = (this.currentChar==0) ? 0.0 : this.charactersPerMin/this.currentChar*100

        //reset char place timer
        this.placeTimer = 5;

        //draw components
        this.drawWords();
        this.drawStats();
    }

    //make actual API call once done
    getWords() {
        let wordList;
        http.onreadystatechange = function (event) {
            if (http.readyState == 4 && http.status == 200) {
                // get response and parse
                wordList = JSON.parse(http.responseText);
                this.wordsSpaced = wordList.join(" ");
                //draw words once done
                this.drawWords();
            }
        }.bind(this);
        http.open("GET", url);
        http.send();
    }

    startGame() {
        if (typeof this.loopID != 'undefined') {
            clearInterval(this.loopID);
        }
        this.gameState = true;
        this.gameStartTime = Date.now();
        this.loopID = setInterval(this.gameCountdown.bind(this), 10);
    }

    stopGame() {
        this.gameState = false;
        clearInterval(this.loopID);
        document.removeEventListener("keydown", this.bindedCheckKey);
        alert("done");
    }

    resetGameTimer() {
        this.gameTimer = 60;
        document.getElementById("timer").innerHTML = this.gameTimer;
    }

    gameCountdown() {
        //calculate difference between game start and current
        let delta = Date.now() - this.gameStartTime;
        this.gameTimer = Math.floor(60 - (delta / 1000));
        if (this.gameTimer <= 0) {
            this.gameTimer = 0;
            //want to show 0 before allowing alert
            document.getElementById("timer").innerHTML = this.gameTimer;
            this.stopGame();
        } else {
            document.getElementById("timer").innerHTML = this.gameTimer;
        }
    }

    playKeyHitAudio() {
        if (keyHitAudio.paused) {
            keyHitAudio.play();
        } else {
            keyHitAudio.currentTime = 0;
        }
    }

    drawWords() {
        //fill over previous
        context.fillStyle = "#44454A"
        context.fillRect(0, 0, canvas.width, canvas.height);

        //draw chars not typed yet
        context.fillStyle = "white";
        context.font = "45px Courier New";
        context.fillText(this.wordsSpaced.substring(this.currentChar, this.wordsSpaced.length), this.placeX + 2, this.placeY + 35);

        //draw chars typed
        if (this.wordsInput.length != 0) {
            for (let i = this.wordsInput.length - 1; i >= 0; i--) {
                if (this.wordsInput[i].correct) {
                    context.fillStyle = "gray";
                } else {
                    context.fillStyle = "#d92929";
                    //draw strikethrough if character is incorrect
                    context.fillRect(this.placeX - 25 - 27 * (this.wordsInput.length - i - 1), this.placeY + 25, 27, 2)
                }
                context.font = "45px Courier New";
                context.fillText(this.wordsInput[i].key, this.placeX - 25 - 27 * (this.wordsInput.length - i - 1), this.placeY + 35);
            }
        }
        //draw current place such that always shown when typing
        this.drawPlace(true);
    }

    drawPlace(isVisible) {
        //draw depending on isVisible
        if (isVisible) {
            context.fillStyle = "white";
        } else {
            context.fillStyle = "#44454A";
        }
        //need to floor x and y as otherwise place does not completely override itself
        context.fillRect(Math.floor(this.placeX), Math.floor(this.placeY), 2, 45);
    }

    placeCountdown() {
        this.placeTimer--;
        //should not show timer if under 0
        if (this.placeTimer == 0) {
            this.drawPlace(false);
        }
        //reset timer and draw if equal to -5
        if (this.placeTimer == -5) {
            this.placeTimer = 5;
            this.drawPlace(true);
        }
    }

    drawStats() {
        //draw CPM
        document.getElementById("combo").innerHTML = this.combo;
        document.getElementById("cpm").innerHTML = this.charactersPerMin;
        document.getElementById("wpm").innerHTML = this.wordsPerMin;
        document.getElementById("accuracy").innerHTML = this.accuracy.toFixed(1) + "%"; 
    }

}

  //////////////////
 //Initialisation//
//////////////////

var currentGame;

function init() {
    currentGame = new WordTaiko();

    //on window resize, chnage widths and redraw words
    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        this.placeX = window.innerWidth / 5;
        this.drawWords();
    }.bind(currentGame));

    document.getElementById("restart").onclick = currentGame.resetGame.bind(currentGame);
}

init();



