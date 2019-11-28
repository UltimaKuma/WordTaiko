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
    drawWords();
});


let currentChar = 0;
let wordsInput = [];
let wordsSpaced;
getWords();
drawWords();

function drawWords() {
    //fill over previous
    context.fillStyle = "#44454A"
    context.fillRect(0, 0, 672, 100);

    context.fillStyle = "white";
    context.font = "45px Courier New";
    context.fillText(wordsSpaced, 10  , 50);


    for (let i = 0; i<wordsInput.length; i++) {
        if (wordsInput[i].correct) {
            context.fillStyle = "white";
        }else{
            context.fillStyle = "red";
        }
        context.font = "45px Courier New";
        context.fillText(wordsInput[i].key, 10 + 27*i , 100);
    }
}
