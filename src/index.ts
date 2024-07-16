import * as PIXI from "pixi.js";

let _mainCont: PIXI.Sprite;

const app = new PIXI.Application();
app
  .init({ background: "#1099bb", resizeTo: window, hello: true })
  .then(async () => {
    // Check if a canvas already exists in the document body
    if (document.body.querySelector("canvas")) {
      console.log("Canvas already exists in the document body.");
      return; // Exit early if a canvas is found
    }
    document.body.appendChild(app.canvas);
    const texture = await PIXI.Assets.load(
      "https://pixijs.com/assets/bunny.png"
    );
    _mainCont = PIXI.Sprite.from(texture);
    _mainCont.texture.source.scaleMode = "nearest";
    _mainCont.anchor.set(0.5);
    _mainCont.scale.set(10);
    _mainCont.position.set(
      app.renderer.screen.width / 2,
      app.renderer.screen.height / 2
    );
    app.stage.addChild(_mainCont);
  });

window.addEventListener("resize", () => {
  // Code to execute when the window is resized
  app.renderer.resize(window.innerWidth, window.innerHeight);
  if (_mainCont !== null && _mainCont !== undefined) {
    _mainCont.x = app.renderer.screen.width / 2;
    _mainCont.y = app.renderer.screen.height / 2;
  }
  // Adjust other elements as needed
});
