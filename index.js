"use strict";

/////////////
//WordTaiko//
/////////////

// TODO - throw all of this in constructor

const canvas = document.getElementById("wordTaiko");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;


const wordCount = 180;
const apiKey = "NNYGYXAE";
const http = new XMLHttpRequest();
const url = "https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number=" + wordCount;
const keyHitAudio = new Audio("audio/KeyHit.wav");

class WordTaiko {
    constructor() {
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
        document.removeEventListener("keydown", this.bindedCheckKey);

        //stats
        this.wordsSpaced = "";
        this.wordsInput = [];
        this.currentChar = 0;
        this.gameStartTime = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.charactersPerMin = 0;
        this.wordsPerMin = 0;
        this.accuracy = 0;

        //will draw background as words not yet obtained
        this.drawWords();
        this.getWords();
        this.resetGameTimer();
        this.drawStats();

        //stop current loop
        clearInterval(this.loopID);
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
        this.accuracy = (this.currentChar == 0) ? 0.0 : this.charactersPerMin / this.currentChar * 100

        //reset char place timer
        this.placeTimer = 5;

        //draw components
        this.drawWords();
        this.drawStats();
    }

    // TODO - change API
    getWords() {
        // let wordList;
        // http.onreadystatechange = function (event) {
        //     if (http.readyState == 4 && http.status == 200) {
        //         // get response and parse
        //         wordList = JSON.parse(http.responseText);
        //         this.wordsSpaced = wordList.join(" ");
        //         //draw words once done
        //         this.drawWords();
        //         //allow input once words obtained
        //         document.addEventListener("keydown", this.bindedCheckKey);
        //     }
        // }.bind(this);
        // http.open("GET", url);
        // http.send();

        this.wordsSpaced = "bruh lol k dude";
        this.drawWords();
        document.addEventListener("keydown", this.bindedCheckKey);
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
        let stats = {
            timestamp: DateFormatter.getFormattedDate(),
            maxCombo: this.maxCombo,
            charactersPerMin: this.charactersPerMin,
            wordsPerMin: this.wordsPerMin,
            accuracy: this.accuracy
        };
        resultsModal.setResults(stats);
        resultsModal.showModal();

        //adds result to DB
        localDB.addResult(stats);
        resultsChart.addResult(stats);
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

/////////////////
//Results Modal//
/////////////////

class Results {
    constructor() {
        this.modal = document.getElementById("results");
        this.stats = {
            maxCombo: 0,
            charactersPerMin: 0,
            wordsPerMin: 0,
            accuracy: 0
        };

        window.onclick = function (event) {
            if (event.target == this.modal) {
                this.modal.style.display = "none";
            }
        }.bind(this);
        document.getElementById("modalClose").onclick = this.handleClose.bind(this);
        document.getElementById("modalRestart").onclick = this.handleReset.bind(this);
    }

    setResults(stats) {
        this.stats = stats;
    }

    showModal() {
        document.getElementById("maxComboResult").innerHTML = this.stats.maxCombo;
        document.getElementById("cpmResult").innerHTML = this.stats.charactersPerMin;
        document.getElementById("wpmResult").innerHTML = this.stats.wordsPerMin;
        document.getElementById("accuracyResult").innerHTML = this.stats.accuracy.toFixed(1) + "%";

        this.modal.style.display = "block";
    }

    handleClose() {
        this.modal.style.display = "none";
    }

    handleReset() {
        this.modal.style.display = "none";
        currentGame.resetGame();
    }
}


///////////////////////////
//IndexedDB Local Storage//
///////////////////////////

class ResultsDatabase {
    constructor() {
        this.db;

        window.onload = function () {
            let request = window.indexedDB.open('results_db', 1);

            request.onerror = function () {
                console.log("Database failed to open");
            };

            request.onsuccess = function () {
                console.log("Database opened successfully");

                //store db object
                this.db = request.result;

                //get results and draw upon addition
                //call used as function needs to be used immediately
                this.getResults.call(this);
            }.bind(this);

            request.onupgradeneeded = function (e) {
                this.db = e.target.result;

                //initialising database
                let objectStore = this.db.createObjectStore('results_os', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex("timestamp", "timestamp", { unique: false });
                objectStore.createIndex("maxCombo", "maxCombo", { unique: false });
                objectStore.createIndex("charactersPerMin", "charactersPerMin", { unique: false });
                objectStore.createIndex("wordsPerMin", "wordsPerMin", { unique: false });
                objectStore.createIndex("accuracy", "accuracy", { unique: false });
            }.bind(this);

        }.bind(this);
    }

    addResult(result) {
        console.log("Adding result to database");

        //open a read/write db transaction
        let transaction = this.db.transaction(["results_os"], 'readwrite');

        //call object store
        let objectStore = transaction.objectStore('results_os');

        //make request to add results to database
        let request = objectStore.add(result);
        request.onsuccess = function () {
            console.log("Request done")
        }

        transaction.oncomplete = function () {
            console.log("Database transaction completed");
        };

        transaction.onerror = function () {
            console.log("Database transaction failed");
        };
    }

    getResults() {
        let results = [];
        let objectStore = this.db.transaction("results_os").objectStore("results_os");
        objectStore.openCursor().onsuccess = function (e) {
            let cursor = e.target.result;

            if (cursor) {
                //christ is real
                let result = {
                    timestamp: cursor.value.timestamp,
                    maxCombo: cursor.value.maxCombo,
                    charactersPerMin: cursor.value.charactersPerMin,
                    wordsPerMin: cursor.value.wordsPerMin,
                    accuracy: cursor.value.accuracy
                };

                results.push(result);
                console.log("Iterating")
                cursor.continue();
            } else {
                //final iteration
                console.log("All results obtained");
                console.log(results);
                resultsChart.setResults(results);
            }
        };
    }

    deleteResults() {
        console.log("Deleting results");

        //open a read/write db transaction
        let transaction = this.db.transaction(["results_os"], 'readwrite');

        transaction.onerror = function() {
            console.log("Database transaction failed");
        };

        //call object store
        let objectStore = transaction.objectStore('results_os');

        //clear object store
        let request = objectStore.clear();

        request.onsuccess = function(){
            console.log("Data Cleared");
        }
    }
}


///////////
//ChartJS//
///////////

class ResultsChart {
    constructor() {
        this.results = [];
        this.chartResultType = "maxCombo";

        //TODO - chnage graph to be more assthethicc as well as changing baseline
        let chartCanvas = document.getElementById('resultsChart').getContext('2d');
        this.lineChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: "Results",
                    backgroundColor: "#7851A9",
                    borderColor: '#583189',
                    data: [],
                }]
            },
            options: {
                defaultFontColor: "#ffffff",
                legend: {
                    display: false,
                },
                maintainAspectRatio: true,
                scales: {
                    xAxes: [{
                        ticks: {
                            display: false,
                            maxRotation: 90,
                            minRotation: 60
                        },
                        gridLines: {
                            display: false,
                        }
                    }],
                    yAxes: [{
                        // scaleLabel:{
                        //     labelString: "Max Combo",
                        //     display: true,
                        //     fontColor: "white",
                        // },
                        ticks: {
                            fontColor: "white",
                        },
                        gridLines: {
                            color: "#777"
                        }
                    }]
                }
            }
        });
    }

    setChartResultType(resultType) {
        console.log("Switching Results");
        switch (resultType) {
            case "Max Combo":
                this.chartResultType = "maxCombo";
                break;
            case "CPM":
                this.chartResultType = "charactersPerMin";
                break;
            case "WPM":
                this.chartResultType = "wordsPerMin";
                break;
            case "Accuracy":
                this.chartResultType = "accuracy";
                break;
            default:
                this.chartResultType = "maxCombo";
        }
        this.updateChart();
    }

    setResults(results) {
        console.log("Setting results");
        this.results = results;
        this.updateChart();
    }

    deleteResults(){
        this.results = [];
        this.updateChart();
    }

    addResult(result) {
        this.results.push(result);
        this.lineChart.data.labels.push(result.timestamp);
        this.lineChart.data.datasets[0].data.push(result[this.chartResultType]);
        this.lineChart.update();
    }

    updateChart() {
        console.log("Updating chart");
        this.lineChart.data.datasets[0].label = this.chartResultType;
        this.lineChart.data.labels = [];
        this.lineChart.data.datasets[0].data = [];
        for (let i = 0; i < this.results.length; i++) {
            this.lineChart.data.labels.push(this.results[i].timestamp);
            this.lineChart.data.datasets[0].data.push(this.results[i][this.chartResultType]);
        }
        console.log(this.lineChart);
        this.lineChart.update();
    }

}

/////////////////
//DateFormatter//
/////////////////

class DateFormatter {
    static pad(num) {
        if (num < 10) {
            num = "0" + num;
        }
        return num;
    }

    static getFormattedDate() {
        let d = new Date();

        let hours = this.pad(d.getHours());
        let minutes = this.pad(d.getMinutes());
        let seconds = this.pad(d.getSeconds());

        let days = this.pad(d.getDate());
        let months = this.pad(d.getMonth());
        let years = d.getFullYear();

        let fullDate = hours + ":" + minutes + ":" + seconds + " " + days + "/" + months + "/" + years;
        return fullDate;
    }
}

//////////////////
//Initialisation//
//////////////////

var currentGame;
var resultsModal;
var localDB;
var resultsChart;

var results = []

function init() {
    currentGame = new WordTaiko();
    resultsModal = new Results();
    localDB = new ResultsDatabase();
    resultsChart = new ResultsChart();

    //on window resize, chnage widths and redraw words
    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        this.placeX = window.innerWidth / 5;
        this.drawWords();
    }.bind(currentGame));

    //tab button handler
    let tabList = document.getElementsByClassName("tab");
    for (let tab of tabList) {
        tab.onclick = function () {
            resultsChart.setChartResultType(tab.innerHTML);
            for (let tab2 of tabList) {
                tab2.className = tab2.className.replace(" active", "");
            }
            tab.className += " active";
        }
    }

    //clear data button handler
    document.getElementById("clearData").onclick = function () {
        resultsChart.deleteResults();
        localDB.deleteResults();
    }

    document.getElementById("restart").onclick = currentGame.resetGame.bind(currentGame);
}

init();



