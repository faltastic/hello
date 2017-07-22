var dobriDen = "Good ";;
var birdsColor = 0x161d2e;

var hourNow = new Date().getHours();

renderTime(hourNow);

//renderTime(23);

function renderTime(hourNow) {
    dobriDen = "Good ";
    var skyBkg = document.getElementById("threeCanvas");

    if (hourNow > 4 && hourNow < 17) {
        dobriDen += "morning!";
        skyBkg.className = " morning";
        birdsColor = 0x5f67a8;
    }
    else if (hourNow < 22) {
        dobriDen += "evening!";
        skyBkg.className = "evening";
        birdsColor = 0x383095;
    }
    else {
        dobriDen += "night!";
        skyBkg.className = "night";
        birdsColor = 0x161d2e;

    }
  document.getElementById("good-what").innerHTML = dobriDen;
  //init();
}
