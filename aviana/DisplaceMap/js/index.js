"use strict";

var baseUrl = "img/";

var loader = new PIXI.loaders.Loader(baseUrl)
            //.add("displaceMap", "ripple2.jpg")
            .add("displaceMap", "compass2.png")
            .add("backImg", "compass.png")
            .load(demo);


function demo(loader, assets) {

  var size = 500;
  var sizeH = size*1.25;


  var renderer = PIXI.autoDetectRenderer(size, sizeH, {
    view: document.querySelector("canvas")
  });

  var stage = new PIXI.Container();
  var logo = new PIXI.Sprite(assets.backImg.texture);
  var ripple = new PIXI.Sprite(assets.displaceMap.texture);
  var filter = new PIXI.filters.DisplacementFilter(ripple);

  logo.anchor.set(0.5);
  logo.position.set(size / 2, sizeH/2);

  ripple.pivot.set(0.5);
  ripple.anchor.set(0.5);
  ripple.scale.set(0.05);
  ripple.position.set(size / 2, sizeH/2);

  filter.scale.set(100);

  stage.filters = [filter];
  stage.addChild(logo);
  stage.addChild(ripple);

  var ease = Power1.easeOut;

  var tl = new TimelineMax({ repeat: -1, repeatDelay: 1.25}).to(ripple.scale, 1.5, { ease: ease, x: 1.5, y: 1.5 }, "ripple").to(filter.scale, 1.5, { ease: ease, x: 0, y: 0 }, "ripple");

  TweenLite.ticker.addEventListener("tick", function () {
    return renderer.render(stage);
  });
}
