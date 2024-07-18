import {
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
import { WinLogic } from "./WinLogic";

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
  private _winLogic: WinLogic;

  constructor(texture: Texture[], app: Application<Renderer>) {
    super();
    this._texture = texture;
    this.createMainContainer();
    this._winLogic = new WinLogic(app);
  }

  public resize(): void {
    this.x = Math.round((window.innerWidth - this.width) / 2);
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

    this._winLogic.resetToBaseState(reels);
    this.reelSpinner();
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

    this._winLogic.checkWinConditions(sym, changeAdded);
  }

  /**
   * Show the wins if there are any
   */
  public showWins(): void {
    this._winLogic.showAllWins(_isSpinning);
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
