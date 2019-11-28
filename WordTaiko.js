const wordCount = 20;
const apiKey = "P7AP6168";
const http = new XMLHttpRequest();
const url = "https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number="+wordCount;

http.open("GET", url);
http.send();

http.onreadystatechange=(e)=>{
    console.log(http.responseText);
}