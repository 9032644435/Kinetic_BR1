
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: Point3D[];
  pinchDistance: number;
  pinchRotation: number; // Angle in radians between thumb and index
  isHandPresent: boolean;
  score: number;
  activeGesture: 'NONE' | 'RIGHT_EXPAND' | 'LEFT_EXPAND';
}

export interface HUDData {
  fps: number;
  handX: number;
  handY: number;
  expansion: number;
}
