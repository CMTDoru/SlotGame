import { BlurFilter, Container, Sprite } from "pixi.js";

export type Reel = {
  container: Container;
  symbols: Sprite[];
  position: number;
  previousPosition: number;
  blur: BlurFilter;
};

export type Tween = {
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

export type SymbolsList = SymbolReelList[];

export type SymbolReelList = {
  sprite: Sprite;
  texture: string;
  x: number;
  y: number;
};
