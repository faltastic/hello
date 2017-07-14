var dobriDen = "Good ";;
var birdsColor = 0x3a384d;

var hourNow = new Date().getHours();

renderTime(hourNow);


function renderTime(hourNow) {
    dobriDen = "Good ";

    if (hourNow > 4 && hourNow < 17) {
        dobriDen += "morning!";
        document.getElementById("threeCanvas").style.background = "linear-gradient(60deg, #454F8A, #948DD5, #E5BAE0)";
        birdsColor = 0x625e84;
    }
    else if (hourNow < 22) {
        dobriDen += "evening!";
        document.getElementById("threeCanvas").style.background = "linear-gradient(60deg, #2E2880, #A578D3)";
        birdsColor = 0x3a384d;
    }
    else {
        dobriDen += "night!";
        document.getElementById("threeCanvas").style.background = "linear-gradient(60deg, #1e3c72,#2a5298)";
        birdsColor = 0x7787a2;
    }
    document.getElementById("good-what").innerHTML = dobriDen;
}
