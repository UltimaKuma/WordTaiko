const canvas = document.getElementById("wordTaiko");
const context = canvas.getContext("2d");

const wordCount = 20;
const apiKey = "P7AP6168";
const http = new XMLHttpRequest();
const url = "https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number="+wordCount;


function getWords(){
    let wordList;
    // http.open("GET", url);
    // http.send();
    // http.onreadystatechange = (e) => {
    //     wordList = http.responseText;
    // }
    wordList = ["one", "two", "three"];

    wordsSpaced = wordList.join(" ");
    console.log(wordList);
}

$(document).ready(function () {
    $("#start").click(function () {
        currentChar = 0;
        getWords();
    });
});

$(document).keydown(function (event) {
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
    typedFrame=true;
    drawWords();
});


let currentChar = 0;
let wordsInput = [];
let wordsSpaced;
let typedFrame = false;
getWords();
drawWords();

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
            }
            context.font = "45px Courier New";
            context.fillText(wordsInput[i].key, 83 - 27 * (wordsInput.length-i-1), 50);
        }
    }
}
