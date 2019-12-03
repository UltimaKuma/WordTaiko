const canvas = document.getElementById("wordTaiko");
const context = canvas.getContext("2d");


const wordCount = 180;
const apiKey = "P7AP6168";
const http = new XMLHttpRequest();
const url = "https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number="+wordCount;
const keyHitAudio = new Audio("audio/KeyHit.wav");


//basically init
let currentChar;
let wordsInput;
let wordsSpaced;
let placeTimer = 5;
canvas.width = window.innerWidth;
let placeX = window.innerWidth/3;
let placeY = 20;
let gameState = false;
let gameTimer = 60;
let loopID;
//start the blinking of the insert
setInterval(placeCountdown, 100);
init();

function init (){
    currentChar = 0;
    wordsInput = [];
    wordsSpaced = "";
    getWords();
    drawWords();
    resetGameTimer();
    stopGame();
}

//make actual API call once done
function getWords(){
    let wordList;
    // http.open("GET", url);
    // http.send();
    // http.onreadystatechange = (e) => {
    //     wordList = http.responseText;
    // }
    wordList = ["one", "two", "three"];
    wordsSpaced = wordList.join(" ");
}

document.getElementById("restart").onclick = function () {
    currentChar = 0;
    wordsInput = [];
    wordsSpaced = "";
    getWords();
    drawWords();
    resetGameTimer();
    stopGame();
};

document.addEventListener("keydown",function (event) {
    //start the game if key pressed
    startGame();
    //remove chars when delete pressed
    //only play key audio if key is valid
    if (event.keyCode == 8) {
        wordsInput.pop();
        currentChar--;
        if(currentChar<0){
            currentChar=0
        }
        playKeyHitAudio();
    } else if(event.key.length === 1) {
        wordsInput.push({
            key: event.key,
            correct: event.key==wordsSpaced.charAt(currentChar)
        });
        currentChar++;
        playKeyHitAudio();
    }
    //reset char place timer
    placeTimer = 5;
    drawWords();
});

//on window resize, chnage widths and redraw words
window.addEventListener("resize", function(event){
    canvas.width = window.innerWidth;
    placeX = window.innerWidth/3;
    drawWords();
});

function startGame(){
    if(typeof loopID != 'undefined'){
        clearInterval(loopID);
    }
    gameState = true;
    loopID = setInterval(gameCountdown, 100);
}

function stopGame(){
    gameState = false;
    clearInterval(loopID);
}

function resetGameTimer(){
    gameTimer = 60;
    //reflect game timer (might need to change such that it reflects Date.now())
    document.getElementsByClassName("timer")[0].innerHTML = "Timer<br>" + gameTimer;
}

function gameCountdown(){
    gameTimer--;
    document.getElementsByClassName("timer")[0].innerHTML = "Timer\n" + gameTimer;
    console.log(gameTimer);
    if(gameTimer<=0){
        stopGame();
    }
}

function playKeyHitAudio(){
    if (keyHitAudio.paused) {
        keyHitAudio.play();
    }else{
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
    context.fillText(wordsSpaced.substring(currentChar, wordsSpaced.length), placeX+2  , placeY+35);

    //draw chars typed
    if (wordsInput.length != 0) {
        for (let i = wordsInput.length-1; i >= 0; i--) {
            if (wordsInput[i].correct) {
                context.fillStyle = "gray";
            } else {
                context.fillStyle = "#d92929";
                //draw strikethrough if character is incorrect
                context.fillRect(placeX-25 - 27 * (wordsInput.length-i-1), placeY+25, 27, 2)
            }
            context.font = "45px Courier New";
            context.fillText(wordsInput[i].key, placeX - 25 - 27 * (wordsInput.length-i-1), placeY+35);
        }
    }
    //draw current place such that always shown when typing
    drawPlace(true);
}

function drawPlace(isVisible){
    //draw depending on isVisible
    if (isVisible) {
        context.fillStyle = "white";
    } else {
        context.fillStyle = "#44454A";
    }
    context.fillRect(placeX, placeY, 2, 45);
}

function placeCountdown(){
    placeTimer--;
    //should not show timer if under 0
    if(placeTimer==0){
        drawPlace(false);
    }
    //reset timer and draw if equal to -5
    if(placeTimer==-5){
        placeTimer=5;
        drawPlace(true);
    }
}
