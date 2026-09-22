import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  poster?: string;
  alt?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "shadow-intensity"?: string | number;
  exposure?: string | number;
  "environment-image"?: string;
  "touch-action"?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "camera-orbit"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElement;
    }
  }
}

export {};
