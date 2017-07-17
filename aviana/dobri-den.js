var dobriDen = "Good ";;
var birdsColor = 0x383095;

var hourNow = new Date().getHours();

renderTime(hourNow);


function renderTime(hourNow) {
    dobriDen = "Good ";

    if (hourNow > 4 && hourNow < 17) {
        dobriDen += "morning!";
        document.getElementById("threeCanvas").style.background = "linear-gradient(#4c558e,  #8182cc, #b99bd2,#e4b8dc)";
        birdsColor = 0x5f67a8;
    }
    else if (hourNow < 22) {
        dobriDen += "evening!";
        document.getElementById("threeCanvas").style.background = "linear-gradient( #292375, #373094, #605ecc ,  #bb9cda )";
        birdsColor = 0x383095;
    }
    else {
        dobriDen += "night!";
        document.getElementById("threeCanvas").style.background = "linear-gradient(#121421, #233248, #4c5166, #a3735c)";
        birdsColor = 0x161d2e;
    }
    document.getElementById("good-what").innerHTML = dobriDen;
}
