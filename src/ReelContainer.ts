import {
  AnimatedSprite,
  Application,
  BlurFilter,
  Container,
  FillGradient,
  Renderer,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";
import { Reel, SymbolReelList, SymbolsList, Tween } from "./Types";

const reelsNo = 5;
const rowsNo = 3;

const REEL_WIDTH = 160;
const SYMBOL_SIZE = 150;
const reels: Reel[] = [];
const SPIN_TIME = 1000;
const SPIN_SETTLE_TIME = 0.3;
const tweening: Tween[] = [];
var forceSymbol = false;
let _isSpinning = false;
var _isWinState = false;
var forceSymbolIndex = 0;

// Create gradient fill
const fill = new FillGradient(0, 0, 0, 0);

// Add play text
const style = new TextStyle({
  fontFamily: "Arial",
  fontSize: 36,
  fontStyle: "italic",
  fontWeight: "bold",
  fill: fill,
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

export class ReelContainer extends Container {
  private _texture: Texture[] = [];
  private _app: Application<Renderer>;
  private _winBoard: SymbolReelList[] = [];

  constructor(texture: Texture[], app: Application<Renderer>) {
    super();
    this._app = app;
    this._texture = texture;
    this.createMainContainer();
  }

  private createMainContainer(): void {
    for (let i = 0; i < reelsNo; i++) {
      const rc = new Container();

      rc.x = i * REEL_WIDTH;
      this.addChild(rc);

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
        var texture =
          this._texture[Math.floor(Math.random() * this._texture.length)];
        const symbol = new Sprite(texture);
        // Scale the symbol to fit symbol area.

        symbol.y = j * SYMBOL_SIZE;
        symbol.scale.x = symbol.scale.y = Math.min(
          SYMBOL_SIZE / symbol.width,
          SYMBOL_SIZE / symbol.height
        );
        symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
        symbol.label = `${i}${j}`;
        var text = new Text({ text: ``, style: style });
        symbol.addChild(text);
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      reels.push(reel);
    }
  }

  private reelSpinner(): void {
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      const extra = Math.floor(Math.random() * 3);
      const target = r.position + 10 + i * 5 + extra;
      const time = SPIN_TIME + i * 600 + extra * 600;

      this.tweenTo(
        r,
        i,
        "position",
        target,
        time,
        this.backout(SPIN_SETTLE_TIME),
        () => {},
        i === reels.length - 1 ? this.reelsComplete : () => {}
      );
    }
  }

  // Reels done handler.
  private reelsComplete(): void {
    _isSpinning = false;
    forceSymbol = false;
  }

  // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
  private tweenTo(
    object: Reel,
    reelNo: number,
    property: String,
    target: number,
    time: number,
    easing: (t: any) => number,
    onchange: (t: any) => void | null,
    oncomplete: (t: any) => void | null
  ): Tween {
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

  // Backout function from tweenjs.
  // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
  private backout(amount: number): (t: number) => number {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  }

  // Function to start playing.
  public startPlay(): void {
    if (_isSpinning) return;
    _isSpinning = true;

    this.clearLandWinSymbols();

    this.stopWinAnimation();

    this.clearWinLineValues();

    this.reelSpinner();
  }

  /**
   * Clear the landing win symbols.
   */
  private clearLandWinSymbols(): void {
    this._winBoard.forEach((symbol) => {
      var sym: Sprite = symbol.sprite as Sprite;
      sym.texture = Texture.from(`assets/${symbol.texture}`);
    });
  }

  /**
   * Clear the win line values.
   */
  private clearWinLineValues(): void {
    // Clear text at the start of each round
    reels.forEach((reel) => {
      reel.symbols.forEach((symbol) => {
        var sym: Sprite = symbol as Sprite;
        var textField = sym.children[0] as Text;
        textField.text = "";
      });
    });
  }

  /**
   * Stop the win animation.
   */
  private stopWinAnimation(): void {
    this._app.stage.children.forEach((child) => {
      if (child instanceof AnimatedSprite) {
        this._app.stage.removeChild(child);
      }
    });
    if (this._app.stage.children.length > 3) {
      this.stopWinAnimation();
    }
  }

  /**
   * Force one random symbol on the reels.
   */
  public forceOneRandomSymbol(): void {
    forceSymbol = true;
    forceSymbolIndex = Math.floor(Math.random() * this._texture.length);
  }

  public updateSymbols(): void {
    var sym: SymbolsList[] = [];
    var changeAdded = false;
    // Update the slots.
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      var row: SymbolReelList[] = [];
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
            this._texture[
              forceSymbol
                ? forceSymbolIndex
                : Math.floor(Math.random() * this._texture.length)
            ];

          s.scale.x = s.scale.y = Math.min(
            SYMBOL_SIZE / s.texture.width,
            SYMBOL_SIZE / s.texture.height
          );
          s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
          changeAdded = true;
        }
        var name = s.texture.label?.split("/")[4];

        row.push({
          sprite: s,
          texture: name ?? "",
          x: s.x,
          y: s.y,
        });
      }
      sym.push(row);
    }

    this.checkWinConditions(sym, changeAdded);
  }

  /**
   * Check the win conditions.
   * @param symbols
   * @param changeAdded
   * @returns void
   */
  private checkWinConditions(
    symbols: SymbolsList[],
    changeAdded: Boolean
  ): void {
    if (!changeAdded) {
      return;
    }
    this._winBoard = [];
    _isWinState = false;

    symbols.forEach((reel) => {
      reel.sort((a, b) => a.y - b.y);
    });

    symbols.forEach((reel) => {
      if (reel.length > rowsNo) reel.shift();
    });

    let isWin = false;

    for (let i = 0; i < rowsNo; i++) {
      let isSameSymbol = true;
      for (let j = 0; j < symbols.length - 1; j++) {
        if (symbols[j][i].texture !== symbols[j + 1][i].texture) {
          isSameSymbol = false;
          break;
        }
      }

      if (isSameSymbol) {
        isWin = true; // Mark as win if any row has the same symbols across all reels
        for (let j = 0; j < symbols.length; j++) {
          this._winBoard.push(symbols[j][i]); // Add winning row symbols to _winBoard
        }
      }
    }

    if (isWin) {
      _isWinState = true; // Update the win state if any winning row was found
    }

    let isVWin = false;
    let isUpsideDownVWin = false;

    // Check if the symbols form a V shape
    if (
      symbols[0][0].texture === symbols[1][1].texture &&
      symbols[0][0].texture === symbols[2][2].texture &&
      symbols[0][0].texture === symbols[3][1].texture &&
      symbols[0][0].texture === symbols[4][0].texture
    ) {
      isVWin = true;
      // Add the winning symbols to _winBoard for V shape
      this._winBoard.push(
        symbols[0][0],
        symbols[1][1],
        symbols[2][2],
        symbols[3][1],
        symbols[4][0]
      );
    }

    // Check if the symbols form an upside-down V shape
    if (
      symbols[0][2].texture === symbols[1][1].texture &&
      symbols[0][2].texture === symbols[2][0].texture &&
      symbols[0][2].texture === symbols[3][1].texture &&
      symbols[0][2].texture === symbols[4][2].texture
    ) {
      isUpsideDownVWin = true;
      // Add the winning symbols to _winBoard for upside-down V shape
      this._winBoard.push(
        symbols[0][2],
        symbols[1][1],
        symbols[2][0],
        symbols[3][1],
        symbols[4][2]
      );
    }

    if (isVWin || isUpsideDownVWin) {
      _isWinState = true; // Update the win state if a V shape or upside-down V shape win was found
    }

    let isPotWin = true;
    let isUpsideDownPotWin = true;
    const potPattern = [0, 1, 1, 1, 0]; // Row indices for the "pot" shape
    const upsideDownPotPattern = [2, 1, 1, 1, 2]; // Row indices for the upside-down "pot" shape

    for (let reelIndex = 0; reelIndex < symbols.length; reelIndex++) {
      // Check for "pot" shape
      if (
        symbols[reelIndex][potPattern[reelIndex]].texture !==
        symbols[0][potPattern[0]].texture
      ) {
        isPotWin = false;
      }

      // Check for upside-down "pot" shape
      if (
        symbols[reelIndex][upsideDownPotPattern[reelIndex]].texture !==
        symbols[0][upsideDownPotPattern[0]].texture
      ) {
        isUpsideDownPotWin = false;
      }
    }

    if (isPotWin) {
      // Add logic to handle pot win, e.g., update _winBoard or _isWinState
      this._winBoard.push(
        symbols[0][0],
        symbols[1][1],
        symbols[2][1],
        symbols[3][1],
        symbols[4][0]
      );
      _isWinState = true;
    }

    if (isUpsideDownPotWin) {
      this._winBoard.push(
        symbols[0][2],
        symbols[1][1],
        symbols[2][1],
        symbols[3][1],
        symbols[4][2]
      );
      // Add logic to handle upside-down pot win, e.g., update _winBoard or _isWinState
      _isWinState = true;
    }
  }

  public showWins(): void {
    if (_isWinState && !_isSpinning) {
      _isWinState = false;

      const lowWinSymbols = ["9", "10"];
      if (
        lowWinSymbols.some((symbol) =>
          this._winBoard[0].texture.includes(symbol)
        )
      ) {
        this._winBoard.forEach((symbol) => {
          var sym: Sprite = symbol.sprite as Sprite;
          sym.texture = this.showLandingSymbols(this._winBoard[0].texture);
          var textField = sym.children[0] as Text;
          textField.text = "5€";
          textField.setSize(36);
          textField.x = Math.round(SYMBOL_SIZE / 2);
          textField.y = Math.round(SYMBOL_SIZE / 2);
        });
        this.playWinAnimation(5);
      }
      const mediumWinSymbols = ["M1", "M2", "M3", "M4", "M5", "M6"];
      if (
        mediumWinSymbols.some((symbol) =>
          this._winBoard[0].texture.includes(symbol)
        )
      ) {
        this._winBoard.forEach((symbol) => {
          var sym: Sprite = symbol.sprite as Sprite;
          sym.texture = this.showLandingSymbols(this._winBoard[0].texture);
          var textField = sym.children[0] as Text;
          textField.text = "10€";
          textField.setSize(50);
          textField.x = Math.round(SYMBOL_SIZE / 2);
          textField.y = Math.round(SYMBOL_SIZE / 2);
        });
        this.playWinAnimation(10);
      }

      const highWinSymbols = ["H1", "H2", "H3", "H4", "H5", "H6"];
      if (
        highWinSymbols.some((symbol) =>
          this._winBoard[0].texture.includes(symbol)
        )
      ) {
        this._winBoard.forEach((symbol) => {
          var sym: Sprite = symbol.sprite as Sprite;
          sym.texture = this.showLandingSymbols(this._winBoard[0].texture);
          var textField = sym.children[0] as Text;
          textField.text = "20€";
          textField.setSize(60);
          textField.x = Math.round(SYMBOL_SIZE / 2);
          textField.y = Math.round(SYMBOL_SIZE / 2);
        });
        this.playWinAnimation(20);
      }

      const specialWinSymbols = ["A", "J", "K", "Q"];
      if (
        specialWinSymbols.some((symbol) =>
          this._winBoard[0].texture.includes(symbol)
        )
      ) {
        this._winBoard.forEach((symbol) => {
          var sym: Sprite = symbol.sprite as Sprite;
          sym.texture = this.showLandingSymbols(this._winBoard[0].texture);
          var textField = sym.children[0] as Text;
          textField.text = "50€";
          textField.setSize(80);
          textField.x = Math.round(SYMBOL_SIZE / 2);
          textField.y = Math.round(SYMBOL_SIZE / 2);
        });
        this.playWinAnimation(50);
      }
    }
  }

  /**
   * Show the landing symbols.
   * @param name Symbol name
   * @returns
   */
  private showLandingSymbols(name: String): Texture {
    var fileName = name.split(".")[0];
    return Texture.from(`assets/${fileName}_connect.png`);
  }

  /**
   * Play the win animation.
   * @param noOfExplosions number of explosions
   */
  private playWinAnimation(noOfExplosions: number): void {
    // Create an array to store the textures
    const explosionTextures = [];
    let i;

    for (i = 0; i < 26; i++) {
      const texture = Texture.from(`Explosion_Sequence_A ${i + 1}.png`);

      explosionTextures.push(texture);
    }

    // Create and randomly place the animated explosion sprites on the stage
    for (i = 0; i < noOfExplosions; i++) {
      // Create an explosion AnimatedSprite
      const explosion = new AnimatedSprite(explosionTextures);

      explosion.x = Math.random() * this._app.screen.width;
      explosion.y = Math.random() * this._app.screen.height;
      explosion.anchor.set(0.5);
      explosion.rotation = Math.random() * Math.PI;
      explosion.scale.set(0.75 + Math.random() * 0.5);
      explosion.gotoAndPlay((Math.random() * 26) | 0);
      this._app.stage.addChild(explosion);
    }
  }

  public checkForSpin(): void {
    const now: number = Date.now();
    const remove = [];

    for (let i = 0; i < tweening.length; i++) {
      const t: Tween = tweening[i];
      const phase = Math.min(1, (now - t.start) / t.time);

      t.object.position = this.lerp(
        t.propertyBeginValue,
        t.target,
        t.easing(phase)
      );
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
  }

  // Basic lerp funtion.
  private lerp(a1: number, a2: number, t: number): number {
    return a1 * (1 - t) + a2 * t;
  }
}
