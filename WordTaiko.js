const canvas = document.getElementById("wordTaiko");
const context = canvas.getContext("2d");


const wordCount = 180;
const apiKey = "P7AP6168";
const http = new XMLHttpRequest();
const url = "https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number=" + wordCount;
const keyHitAudio = new Audio("audio/KeyHit.wav");


//basically init
let currentChar;
let wordsInput;
let wordsSpaced;
let placeTimer = 5;
canvas.width = window.innerWidth;
let placeX = window.innerWidth / 3;
let placeY = 20;
let gameState = false;
let loopID;
//init stat variables
let gameTimer = 60;
let combo = 0;
let maxCombo = 0;
let charactersPerMin = 0;
let wordsPerMin = 0;
//start the blinking of the insert
setInterval(placeCountdown, 100);
init();

function init() {
    currentChar = 0;
    wordsInput = [];
    wordsSpaced = "";
    charactersPerMin = 0;
    wordsPerMin = 0;
    getWords();
    drawWords();
    resetGameTimer();
    stopGame();
    drawStats();
}

//make actual API call once done
function getWords() {
    let wordList;
    // http.open("GET", url);
    // http.send();
    // http.onreadystatechange = (e) => {
    //     wordList = http.responseText;
    // }
    wordList = ["one", "two", "three"];
    wordsSpaced = wordList.join(" ");
}

document.getElementById("restart").onclick = init();

document.addEventListener("keydown", function (event) {
    //start the game if key pressed
    startGame();
    //delete pressed
    if (event.keyCode == 8) {
        //check word correctness for WPM
        if(wordsSpaced.charAt(currentChar) == " "){
            let i=1;
            let wordCorrect = true;
            while(currentChar-i>0 && wordsSpaced.charAt(currentChar-i) != " "){
                if(wordsInput[currentChar-i].correct==false){
                    wordCorrect=false;
                    break;
                }
                i++;
            }
            if(wordCorrect){
                wordsPerMin--;
            }
        }
        //removes last char and checks if it is correct
        if (wordsInput.length != 0 && wordsInput.pop().correct == true) {
            charactersPerMin--;
        }
        //reset combo
        combo=0;
        currentChar--;
        if (currentChar < 0) {
            currentChar = 0
        }
        playKeyHitAudio();
    //printable char
    } else if (event.key.length === 1) {
        let correctChar = (event.key == wordsSpaced.charAt(currentChar));
        wordsInput.push({
            key: event.key,
            correct: correctChar
        });
        //increment CPM when correct char otherwise do nothing
        if (correctChar) {
            charactersPerMin++;
            combo++;
        }else{
            combo=0;
        }
        //check word correctness for WPM
        if(wordsSpaced.charAt(currentChar+1) == " "){
            let i=0;
            let wordCorrect = true;
            while(currentChar-i>0 && wordsSpaced.charAt(currentChar-i) != " "){
                if(wordsInput[currentChar-i].correct==false){
                    wordCorrect=false;
                    break;
                }
                i++;
            }
            if(wordCorrect){
                wordsPerMin++;
            }
        }
        currentChar++;
        playKeyHitAudio();
    }

    //check maxCombo
    if(maxCombo<combo){
        maxCombo = combo;
    }
    //reset char place timer
    placeTimer = 5;
    drawWords();
    drawStats();
});

//on window resize, chnage widths and redraw words
window.addEventListener("resize", function (event) {
    canvas.width = window.innerWidth;
    placeX = window.innerWidth / 3;
    drawWords();
});

function startGame() {
    if (typeof loopID != 'undefined') {
        clearInterval(loopID);
    }
    gameState = true;
    loopID = setInterval(gameCountdown, 100);
}

function stopGame() {
    gameState = false;
    clearInterval(loopID);
}

function resetGameTimer() {
    gameTimer = 60;
    //reflect game timer (might need to change such that it reflects Date.now())
    document.getElementsByClassName("timer")[0].innerHTML = "Timer<br>" + gameTimer;
}

function gameCountdown() {
    gameTimer--;
    if (gameTimer <= 0) {
        gameTimer=0;
        stopGame();
    }
    document.getElementsByClassName("timer")[0].innerHTML = "Timer<br>" + gameTimer;
    console.log(gameTimer);
}

function playKeyHitAudio() {
    if (keyHitAudio.paused) {
        keyHitAudio.play();
    } else {
        keyHitAudio.currentTime = 0;
    }
}

function drawWords() {
    //fill over previous
    context.fillStyle = "#44454A"
    context.fillRect(0, 0, canvas.width, canvas.height);

    //draw chars not typed yet
    context.fillStyle = "white";
    context.font = "45px Courier New";
    context.fillText(wordsSpaced.substring(currentChar, wordsSpaced.length), placeX + 2, placeY + 35);

    //draw chars typed
    if (wordsInput.length != 0) {
        for (let i = wordsInput.length - 1; i >= 0; i--) {
            if (wordsInput[i].correct) {
                context.fillStyle = "gray";
            } else {
                context.fillStyle = "#d92929";
                //draw strikethrough if character is incorrect
                context.fillRect(placeX - 25 - 27 * (wordsInput.length - i - 1), placeY + 25, 27, 2)
            }
            context.font = "45px Courier New";
            context.fillText(wordsInput[i].key, placeX - 25 - 27 * (wordsInput.length - i - 1), placeY + 35);
        }
    }
    //draw current place such that always shown when typing
    drawPlace(true);
}

function drawPlace(isVisible) {
    //draw depending on isVisible
    if (isVisible) {
        context.fillStyle = "white";
    } else {
        context.fillStyle = "#44454A";
    }
    context.fillRect(placeX, placeY, 2, 45);
}

function placeCountdown() {
    placeTimer--;
    //should not show timer if under 0
    if (placeTimer == 0) {
        drawPlace(false);
    }
    //reset timer and draw if equal to -5
    if (placeTimer == -5) {
        placeTimer = 5;
        drawPlace(true);
    }
}

function drawStats() {
    //draw CPM
    document.getElementsByClassName("combo")[0].innerHTML = "Combo<br>" + combo;
    document.getElementsByClassName("cpm")[0].innerHTML = "CPM<br>" + charactersPerMin;
    document.getElementsByClassName("wpm")[0].innerHTML = "WPM<br>" + wordsPerMin;
}
