
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HandData, Point3D } from '../types';

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement>, isEnabled: boolean) => {
  const [handData, setHandData] = useState<HandData>({
    landmarks: [],
    pinchDistance: 0,
    pinchRotation: 0,
    isHandPresent: false,
    score: 0,
    activeGesture: 'NONE'
  });

  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  // Smooth the rotation to prevent jitter
  const prevRotationRef = useRef<number>(0);

  const calculateDistance = (p1: Point3D, p2: Point3D) => {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + 
      Math.pow(p1.y - p2.y, 2) + 
      Math.pow(p1.z - p2.z, 2)
    );
  };

  const onResults = useCallback((results: any) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      
      const distance = calculateDistance(thumbTip, indexTip);
      const normalizedPinch = Math.min(Math.max((distance - 0.02) / 0.38, 0), 1);

      // Better Rotation: Angle of the vector from thumb to index
      // Clockwise/Anti-clockwise is easier to detect relative to horizontal
      const rawRotation = Math.atan2(indexTip.y - thumbTip.y, indexTip.x - thumbTip.x);
      
      // Low-pass filter for rotation stability
      const rotation = prevRotationRef.current * 0.7 + rawRotation * 0.3;
      prevRotationRef.current = rotation;
      
      let gesture: 'NONE' | 'RIGHT_EXPAND' | 'LEFT_EXPAND' = 'NONE';
      
      // Sensitivity Tuning:
      // Expanded pinch + specific angle thresholds
      // 0 radians is horizontal (index right of thumb). 
      // In screen space (Y down): 
      // Clockwise twist moves index "up" relative to thumb (negative angle in atan2)
      // Anti-clockwise moves index "down" relative to thumb (positive angle in atan2)
      if (normalizedPinch > 0.65) {
        if (rotation < -0.4) gesture = 'RIGHT_EXPAND'; // Clockwise Twist
        else if (rotation > 0.4) gesture = 'LEFT_EXPAND'; // Anti-Clockwise Twist
      }

      setHandData({
        landmarks,
        pinchDistance: normalizedPinch,
        pinchRotation: rotation,
        isHandPresent: true,
        score: results.multiHandProbability?.[0] || 0,
        activeGesture: gesture
      });
    } else {
      setHandData(prev => ({ ...prev, isHandPresent: false, pinchDistance: 0, activeGesture: 'NONE' }));
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const initTracking = async () => {
      const { Hands, Camera } = (window as any);
      if (!Hands || !Camera) return;

      try {
        handsRef.current = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsRef.current.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7, // Increased for accuracy
          minTrackingConfidence: 0.7
        });

        handsRef.current.onResults(onResults);

        if (videoRef.current) {
          cameraRef.current = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          await cameraRef.current.start();
        }
      } catch (err) {
        console.error(err);
      }
    };

    initTracking();

    return () => {
      cameraRef.current?.stop();
      handsRef.current?.close();
    };
  }, [isEnabled, onResults, videoRef]);

  return handData;
};
