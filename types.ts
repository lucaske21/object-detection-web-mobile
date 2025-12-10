// 0-1000 normalized coordinates: [ymin, xmin, ymax, xmax]
export type BoundingBox = [number, number, number, number];

export interface DetectionObject {
  label: string;
  box_2d: BoundingBox;
  score?: number;
  class_id?: number;
}

export interface DetectionResponse {
  detections: DetectionObject[];
  // Summary counts are derived from detections
}

export interface StatsItem {
  label: string;
  count: number;
}
