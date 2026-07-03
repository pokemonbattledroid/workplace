import { useState } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import UI from './components/UI';
import type { SimulationConfig } from './types';

function App() {
  const [config, setConfig] = useState<SimulationConfig>({
    headcount: 80,
    teamCount: 6,
    collaborationSpace: 40,
    layout: 'ABW',
    renderMode: 'Dense',
    randomSeed: 1234,
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <SimulationCanvas config={config} />
      <UI config={config} setConfig={setConfig} />
    </div>
  );
}

export default App;
