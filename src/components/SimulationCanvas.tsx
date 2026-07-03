import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { Simulation } from '../simulation/Simulation';
import type { SimulationConfig } from '../types';

interface Props {
  config: SimulationConfig;
}

const SimulationCanvas: React.FC<Props> = ({ config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Simulation | null>(null);
  const configRef = useRef<SimulationConfig>(config);

  // Keep the ref up to date so p5 can access latest values without stale closures
  useEffect(() => {
    configRef.current = config;

    // If the seed changed, re-initialize the simulation
    if (simRef.current && config.randomSeed !== simRef.current.config.randomSeed) {
      simRef.current.config = config;
      simRef.current.init();
    }
  }, [config]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(containerRef.current!.offsetWidth, containerRef.current!.offsetHeight);
        simRef.current = new Simulation(p, configRef.current);
      };

      p.draw = () => {
        if (simRef.current) {
          // Always pass the latest config from the ref
          simRef.current.update(configRef.current);
          simRef.current.draw();
        }
      };

      p.windowResized = () => {
        if (!containerRef.current) return;
        p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
        if (simRef.current) simRef.current.init();
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default SimulationCanvas;
