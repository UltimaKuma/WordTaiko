const canvas = document.getElementById("wordTaiko");
const context = canvas.getContext("2d");

const wordCount = 20;
const apiKey = "P7AP6168";
const http = new XMLHttpRequest();
const url = "https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number="+wordCount;
const keyHitAudio = new Audio("audio/KeyHit.wav");


//make actual API call one done
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

$(document).ready(function () {
    $("#start").click(function () {
        currentChar = 0;
        getWords();
    });
});

$(document).keydown(function (event) {
    //remove chars when delete pressed
    if (event.keyCode == 8) {
        wordsInput.pop();
        currentChar--;
        if(currentChar<0){
            currentChar=0
        }
    } else if(event.key.length === 1) {
        wordsInput.push({
            key: event.key,
            correct: event.key==wordsSpaced.charAt(currentChar)
        });
        currentChar++;
    }
    //reset char place timer
    placeTimer = 5;
    playKeyHitAudio();
    drawWords();
});

//basically init
let currentChar = 0;
let wordsInput = [];
let wordsSpaced;
let placeTimer = 5;
getWords();
drawWords();
setInterval(placeCountdown, 100);

function playKeyHitAudio(){
    if (keyHitAudio.paused) {
        keyHitAudio.play();
    }else{
        keyHitAudio.currentTime = 0
    }
}

function drawWords() {
    //fill over previous
    context.fillStyle = "#44454A"
    context.fillRect(0, 0, 672, 100);

    //draw chars not typed yet
    context.fillStyle = "white";
    context.font = "45px Courier New";
    context.fillText(wordsSpaced.substring(currentChar, wordsSpaced.length), 110  , 50);

    //draw chars typed
    if (wordsInput.length != 0) {
        for (let i = wordsInput.length-1; i >= 0; i--) {
            console.log(wordsInput[i]);
            if (wordsInput[i].correct) {
                context.fillStyle = "gray";
            } else {
                context.fillStyle = "#ff4c3b";
                //draw strikethrough if character is incorrect
                context.fillRect(83 - 27 * (wordsInput.length-i-1), 40, 27, 2)
            }
            context.font = "45px Courier New";
            context.fillText(wordsInput[i].key, 83 - 27 * (wordsInput.length-i-1), 50);
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
    context.fillRect(108, 15, 2, 45);
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
