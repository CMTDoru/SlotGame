import { Application, Assets, Texture } from "pixi.js";
import { ReelContainer } from "./ReelContainer";
import "./style.css";
import { ReelTextZone } from "./ReelTextZone";

(async () => {
  if (document.body.querySelector("canvas")) {
    console.log("Canvas already exists in the document body.");
    return; // Exit early if a canvas is found
  }
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  await Assets.add({ alias: "9", src: "assets/9.png" });
  await Assets.add({ alias: "9_connect", src: "assets/9_connect.png" });
  await Assets.add({ alias: "10", src: "assets/10.png" });
  await Assets.add({ alias: "10_connect", src: "assets/10_connect.png" });
  await Assets.add({ alias: "A", src: "assets/A.png" });
  await Assets.add({ alias: "A_connect", src: "assets/A_connect.png" });
  await Assets.add({ alias: "H1", src: "assets/H1.png" });
  await Assets.add({ alias: "H1_connect", src: "assets/H1_connect.png" });
  await Assets.add({ alias: "H2", src: "assets/H2.png" });
  await Assets.add({ alias: "H2_connect", src: "assets/H2_connect.png" });
  await Assets.add({ alias: "H3", src: "assets/H3.png" });
  await Assets.add({ alias: "H3_connect", src: "assets/H3_connect.png" });
  await Assets.add({ alias: "H4", src: "assets/H4.png" });
  await Assets.add({ alias: "H4_connect", src: "assets/H4_connect.png" });
  await Assets.add({ alias: "H5", src: "assets/H5.png" });
  await Assets.add({ alias: "H5_connect", src: "assets/H5_connect.png" });
  await Assets.add({ alias: "H6", src: "assets/H6.png" });
  await Assets.add({ alias: "H6_connect", src: "assets/H6_connect.png" });
  await Assets.add({ alias: "J", src: "assets/J.png" });
  await Assets.add({ alias: "J_connect", src: "assets/J_connect.png" });
  await Assets.add({ alias: "K", src: "assets/K.png" });
  await Assets.add({ alias: "K_connect", src: "assets/K_connect.png" });
  await Assets.add({ alias: "Q", src: "assets/Q.png" });
  await Assets.add({ alias: "Q_connect", src: "assets/Q_connect.png" });
  await Assets.add({ alias: "M1", src: "assets/M1.png" });
  await Assets.add({ alias: "M1_connect", src: "assets/M1_connect.png" });
  await Assets.add({ alias: "M2", src: "assets/M2.png" });
  await Assets.add({ alias: "M2_connect", src: "assets/M2_connect.png" });
  await Assets.add({ alias: "M3", src: "assets/M3.png" });
  await Assets.add({ alias: "M3_connect", src: "assets/M3_connect.png" });
  await Assets.add({ alias: "M4", src: "assets/M4.png" });
  await Assets.add({ alias: "M4_connect", src: "assets/M4_connect.png" });
  await Assets.add({ alias: "M5", src: "assets/M5.png" });
  await Assets.add({ alias: "M5_connect", src: "assets/M5_connect.png" });
  await Assets.add({ alias: "M6", src: "assets/M6.png" });
  await Assets.add({ alias: "M6_connect", src: "assets/M6_connect.png" });
  await Assets.add({
    alias: "Explosion",
    src: "https://pixijs.com/assets/spritesheet/mc.json",
  });

  await Assets.load([
    "9",
    "10",
    "A",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "J",
    "K",
    "Q",
    "M1",
    "M2",
    "M3",
    "M4",
    "M5",
    "M6",
    "Explosion",
    "9_connect",
    "10_connect",
    "A_connect",
    "H1_connect",
    "H2_connect",
    "H3_connect",
    "H4_connect",
    "H5_connect",
    "H6_connect",
    "J_connect",
    "K_connect",
    "Q_connect",
    "M1_connect",
    "M2_connect",
    "M3_connect",
    "M4_connect",
    "M5_connect",
    "M6_connect",
  ]);

  // Create different slot symbols
  const slotTextures = [
    Texture.from("assets/9.png"),
    Texture.from("assets/10.png"),
    Texture.from("assets/A.png"),
    Texture.from("assets/H1.png"),
    Texture.from("assets/H2.png"),
    Texture.from("assets/H3.png"),
    Texture.from("assets/H4.png"),
    Texture.from("assets/H5.png"),
    Texture.from("assets/H6.png"),
    Texture.from("assets/J.png"),
    Texture.from("assets/K.png"),
    Texture.from("assets/Q.png"),
    Texture.from("assets/M1.png"),
    Texture.from("assets/M2.png"),
    Texture.from("assets/M3.png"),
    Texture.from("assets/M4.png"),
    Texture.from("assets/M5.png"),
    Texture.from("assets/M6.png"),
  ];

  // Build the reels
  const reelContainer = new ReelContainer(slotTextures, app);
  app.stage.addChild(reelContainer);

  const top = new ReelTextZone(app, "top", reelContainer);
  const bottom = new ReelTextZone(app, "bottom", reelContainer);

  app.stage.addChild(top);
  app.stage.addChild(bottom);

  // Set the interactivity.
  bottom.eventMode = "static";
  bottom.cursor = "pointer";
  bottom.addListener("pointerdown", () => {
    console.log("Spin started!");
    reelContainer.startPlay();
  });

  // Set the interactivity.
  top.eventMode = "static";
  top.cursor = "pointer";
  top.addListener("pointerdown", () => {
    console.log("Forcing added!");
    reelContainer.forceOneRandomSymbol();
  });

  // Listen for animate update.
  app.ticker.add(() => {
    if (reelContainer !== null && reelContainer !== undefined)
      reelContainer.updateSymbols();
  });

  app.ticker.add(() => {
    if (reelContainer !== null && reelContainer !== undefined)
      reelContainer.showWins();
  });

  // Listen for animate update.
  app.ticker.add(() => {
    if (reelContainer !== null && reelContainer !== undefined)
      reelContainer.checkForSpin();
  });

  window.addEventListener("resize", () => {
    top.width = window.innerWidth;
    bottom.width = window.innerWidth;
    reelContainer.resize();
  });
})();
