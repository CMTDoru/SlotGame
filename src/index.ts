import {
  Application,
  Assets,
  Color,
  Container,
  Texture,
  Sprite,
  Graphics,
  Text,
  TextStyle,
  BlurFilter,
  FillGradient,
} from "pixi.js";

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
  await Assets.add({ alias: "10", src: "assets/10.png" });
  await Assets.add({ alias: "A", src: "assets/A.png" });
  await Assets.add({ alias: "H1", src: "assets/H1.png" });
  await Assets.add({ alias: "H2", src: "assets/H2.png" });
  await Assets.add({ alias: "H3", src: "assets/H3.png" });
  await Assets.add({ alias: "H4", src: "assets/H4.png" });
  await Assets.add({ alias: "H5", src: "assets/H5.png" });
  await Assets.add({ alias: "H6", src: "assets/H6.png" });
  await Assets.add({ alias: "J", src: "assets/J.png" });
  await Assets.add({ alias: "K", src: "assets/K.png" });
  await Assets.add({ alias: "Q", src: "assets/Q.png" });
  await Assets.add({ alias: "M1", src: "assets/M1.png" });
  await Assets.add({ alias: "M2", src: "assets/M2.png" });
  await Assets.add({ alias: "M3", src: "assets/M3.png" });
  await Assets.add({ alias: "M4", src: "assets/M4.png" });
  await Assets.add({ alias: "M5", src: "assets/M5.png" });
  await Assets.add({ alias: "M6", src: "assets/M6.png" });

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
  ]);

  const REEL_WIDTH = 160;
  const SYMBOL_SIZE = 150;

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
  const reels: Reel[] = [];
  const reelContainer = new Container();

  // Numbers of reels
  const reelsNo = 5;
  const rowsNo = 3;

  for (let i = 0; i < reelsNo; i++) {
    const rc = new Container();

    rc.x = i * REEL_WIDTH;
    reelContainer.addChild(rc);

    const reel: Reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new BlurFilter(),
    };

    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    rc.filters = [reel.blur];

    // Build the symbols
    for (let j = 0; j < rowsNo + 1; j++) {
      const symbol = new Sprite(
        slotTextures[Math.floor(Math.random() * slotTextures.length)]
      );
      // Scale the symbol to fit symbol area.

      symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width,
        SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
  }
  app.stage.addChild(reelContainer);

  // Build top & bottom covers and position reelContainer
  const margin = (app.screen.height - SYMBOL_SIZE * rowsNo) / 2;

  const top = new Graphics()
    .rect(0, 0, app.screen.width, margin)
    .fill({ color: 0x0 });

  reelContainer.y = top.height;
  reelContainer.x = app.screen.width * 0.5 - reelContainer.width * 0.5;

  const bottom = new Graphics()
    .rect(0, SYMBOL_SIZE * rowsNo + margin, app.screen.width, margin)
    .fill({ color: 0x0 });

  // Create gradient fill
  const fill = new FillGradient(0, 0, 0, 36 * 1.7);

  const colors = [0xffffff, 0x00ff99].map((color) =>
    Color.shared.setValue(color).toNumber()
  );

  colors.forEach((number, index) => {
    const ratio = index / colors.length;

    fill.addColorStop(ratio, number);
  });

  // Add play text
  const style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: { fill },
    stroke: { color: 0x4a1850, width: 5 },
    dropShadow: {
      color: 0x000000,
      angle: Math.PI / 6,
      blur: 4,
      distance: 6,
    },
    wordWrap: true,
    wordWrapWidth: 440,
  });

  const playText = new Text({ text: "Spin", style: style });

  playText.x = Math.round((bottom.width - playText.width) / 2);
  playText.y =
    app.screen.height - margin + Math.round((margin - playText.height) / 2);
  bottom.addChild(playText);

  // Add header text
  const headerText = new Text({ text: "CRAZY SLOTS!", style: style });

  headerText.x = Math.round((top.width - headerText.width) / 2);
  headerText.y = Math.round((margin - headerText.height) / 2);
  top.addChild(headerText);

  app.stage.addChild(top);
  app.stage.addChild(bottom);

  // Set the interactivity.
  bottom.eventMode = "static";
  bottom.cursor = "pointer";
  bottom.addListener("pointerdown", () => {
    startPlay();
  });

  let running = false;

  // Function to start playing.
  function startPlay() {
    if (running) return;
    running = true;

    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      const extra = Math.floor(Math.random() * 3);
      const target = r.position + 10 + i * 5 + extra;
      const time = 2500 + i * 600 + extra * 600;

      tweenTo(
        r,
        i,
        "position",
        target,
        time,
        backout(0.5),
        () => {},
        i === reels.length - 1 ? reelsComplete : () => {}
      );
    }
  }

  // Reels done handler.
  function reelsComplete() {
    running = false;
  }

  // Listen for animate update.
  app.ticker.add(() => {
    // Update the slots.
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      // Update blur filter y amount based on speed.
      // This would be better if calculated with time in mind also. Now blur depends on frame rate.

      r.blur.blurY = (r.position - r.previousPosition) * 8;
      r.previousPosition = r.position;

      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;

        s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          // Detect going over and swap a texture.
          // This should in proper product be determined from some logical reel.
          s.texture =
            slotTextures[Math.floor(Math.random() * slotTextures.length)];
          s.scale.x = s.scale.y = Math.min(
            SYMBOL_SIZE / s.texture.width,
            SYMBOL_SIZE / s.texture.height
          );
          s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
        }
      }
    }
  });

  // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
  const tweening: Tween[] = [];

  function tweenTo(
    object: Reel,
    reelNo: number,
    property: String,
    target: number,
    time: number,
    easing: (t: any) => number,
    onchange: (t: any) => void | null,
    oncomplete: (t: any) => void | null
  ) {
    const tween: Tween = {
      object,
      reelNo,
      property,
      propertyBeginValue: object.position,
      target,
      easing,
      time,
      change: onchange,
      complete: oncomplete,
      start: Date.now(),
    };

    tweening.push(tween);

    return tween;
  }
  // Listen for animate update.
  app.ticker.add(() => {
    const now: number = Date.now();
    const remove = [];

    for (let i = 0; i < tweening.length; i++) {
      const t: Tween = tweening[i];
      const phase = Math.min(1, (now - t.start) / t.time);

      t.object.position = lerp(t.propertyBeginValue, t.target, t.easing(phase));
      if (t.change) t.change(t);
      if (phase === 1) {
        t.object.position = t.target;
        if (t.complete) t.complete(t);
        remove.push(t);
      }
    }
    for (let i = 0; i < remove.length; i++) {
      tweening.splice(tweening.indexOf(remove[i]), 1);
    }
  });

  // Basic lerp funtion.
  function lerp(a1: number, a2: number, t: number): number {
    return a1 * (1 - t) + a2 * t;
  }

  // Backout function from tweenjs.
  // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
  function backout(amount: number) {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  }
})();

type Reel = {
  container: Container;
  symbols: Sprite[];
  position: number;
  previousPosition: number;
  blur: BlurFilter;
};

type Tween = {
  object: Reel;
  reelNo: number;
  property: String;
  propertyBeginValue: number;
  target: number;
  easing: (t: any) => number;
  time: number;
  change: (t: any) => void | null;
  complete: (t: any) => void | null;
  start: number;
};
