export type LayoutType = 'ABW' | 'Cellular' | 'Cubicles';
export type RenderMode = 'Cloud' | 'Dense' | 'Stock' | 'Wave';

export interface SimulationConfig {
  headcount: number;
  teamCount: number;
  collaborationSpace: number;
  layout: LayoutType;
  renderMode: RenderMode;
  randomSeed: number;
}

export interface SatisfactionMetrics {
  satisfaction: number;
  encouragementIndex: number;
}
