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

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(containerRef.current!.offsetWidth, containerRef.current!.offsetHeight);
        simRef.current = new Simulation(p, config);
      };

      p.draw = () => {
        if (simRef.current) {
          simRef.current.update(config);
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

  // Update config when it changes without re-initializing
  useEffect(() => {
    if (simRef.current && config.randomSeed === simRef.current.config.randomSeed) {
      simRef.current.config = config;
    } else if (simRef.current) {
      simRef.current.config = config;
      simRef.current.init();
    }
  }, [config]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default SimulationCanvas;
