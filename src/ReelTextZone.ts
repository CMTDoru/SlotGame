import {
  Application,
  Color,
  FillGradient,
  Graphics,
  Renderer,
  Text,
  TextStyle,
} from "pixi.js";
import { ReelContainer } from "./ReelContainer";

// Create gradient fill
const fill = new FillGradient(0, 0, 0, 36 * 1.7);

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

export class ReelTextZone extends Graphics {
  private _app: Application<Renderer>;
  private _name: String;
  private _reelContainer: ReelContainer;
  // Build top & bottom covers and position reelContainer
  private _margin: number;
  private _symbolSize = 150;
  private _rowNo = 3;

  constructor(
    app: Application<Renderer>,
    name: String,
    reelContainer: ReelContainer
  ) {
    super();
    this._app = app;
    this._name = name;
    this._reelContainer = reelContainer;
    this._margin = (app.screen.height - this._symbolSize * this._rowNo) / 2;

    this.updateColors();
    this.drawTextZone(name);
    this.addText(name);
  }

  private updateColors(): void {
    const colors = [0xffffff, 0x00ff99].map((color) =>
      Color.shared.setValue(color).toNumber()
    );

    colors.forEach((number, index) => {
      const ratio = index / colors.length;

      fill.addColorStop(ratio, number);
    });
  }

  private drawTextZone(name: String): void {
    if (name === "top") {
      this.rect(0, 0, this._app.screen.width, this._margin).fill({
        color: 0x0,
      });
      this._reelContainer.y = this.height;
      this._reelContainer.x =
        this._app.screen.width * 0.5 - this._reelContainer.width * 0.5;
    }

    if (name === "bottom") {
      this.rect(
        0,
        this._symbolSize * this._rowNo + this._margin,
        this._app.screen.width,
        this._margin
      ).fill({ color: 0x0 });
    }
  }

  private addText(name: String): void {
    if (name === "top") {
      // Add header text
      const headerText = new Text({ text: "CRAZY SLOTS!", style: style });

      headerText.x = Math.round((this.width - headerText.width) / 2);
      headerText.y = Math.round((this._margin - headerText.height) / 2);
      this.addChild(headerText);
    }

    if (name === "bottom") {
      const playText = new Text({ text: "Spin", style: style });

      playText.x = Math.round((this.width - playText.width) / 2);
      playText.y =
        this._app.screen.height -
        this._margin +
        Math.round((this._margin - playText.height) / 2);
      this.addChild(playText);
    }
  }
}
