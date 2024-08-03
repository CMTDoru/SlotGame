import {
  AnimatedSprite,
  Application,
  Renderer,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import { Reel, SymbolReelList, SymbolsList } from "./Types";
import { ReelTextZone } from "./ReelTextZone";

const ROWS_NO = 3;
const SYMBOL_SIZE = 150;

export class WinLogic {
  private _app: Application<Renderer>;
  private _winBoard: SymbolReelList[] = [];
  private _isWinState = false;

  constructor(app: Application<Renderer>) {
    this._app = app;
  }

  public resetToBaseState(reels: Reel[]): void {
    this.clearLandWinSymbols();
    this.stopWinAnimation();
    this.clearWinLineValues(reels);
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
  private clearWinLineValues(reels: Reel[]): void {
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
   * Check the win conditions.
   * @param symbols
   * @param changeAdded
   * @returns void
   */
  public checkWinConditions(
    symbols: SymbolsList[],
    changeAdded: Boolean
  ): void {
    if (!changeAdded) {
      return;
    }
    this._winBoard = [];
    this._isWinState = false;

    symbols.forEach((reel) => {
      reel.sort((a, b) => a.y - b.y);
      if (reel.length > ROWS_NO) reel.shift();
    });

    let isWin = false;

    for (let i = 0; i < ROWS_NO; i++) {
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
      this._isWinState = true; // Update the win state if any winning row was found
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
      this._isWinState = true; // Update the win state if a V shape or upside-down V shape win was found
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
      // Add logic to handle pot win, e.g., update _winBoard or this._isWinState
      this._winBoard.push(
        symbols[0][0],
        symbols[1][1],
        symbols[2][1],
        symbols[3][1],
        symbols[4][0]
      );
      this._isWinState = true;
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
      this._isWinState = true;
    }
  }

  public showAllWins(isSpinning: Boolean): void {
    if (this._isWinState && !isSpinning) {
      this._isWinState = false;

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
          this.addToTotalWin("5");
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
          this.addToTotalWin("10");
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
          this.addToTotalWin("20");
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
          this.addToTotalWin("50");
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

  private addToTotalWin(value: string): void {
    const reelTextZone = this._app.stage.children[2] as ReelTextZone;
    var currentValue = reelTextZone.totalValue;

    reelTextZone.totalValue = currentValue + parseInt(value);
  }
}
