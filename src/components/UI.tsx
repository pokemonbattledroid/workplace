import React, { useMemo } from 'react';
import type { SimulationConfig, LayoutType, RenderMode } from '../types';
import { Users, Layout, Zap, Palette, RefreshCcw } from 'lucide-react';

interface Props {
  config: SimulationConfig;
  setConfig: (config: SimulationConfig) => void;
}

const UI: React.FC<Props> = ({ config, setConfig }) => {
  const metrics = useMemo(() => {
    const encouragement = (config.collaborationSpace * 0.8) + (config.layout === 'ABW' ? 20 : 0);
    const satisfaction = Math.min(100, (encouragement * 0.7) + (config.headcount / config.teamCount) * 2);
    return {
      encouragementIndex: Math.round(encouragement),
      satisfaction: Math.round(satisfaction),
    };
  }, [config]);

  const handleChange = (key: keyof SimulationConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="absolute top-6 left-6 w-80 bg-slate-900/80 backdrop-blur-md text-white p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight uppercase">Spatial Potential</h1>
        <button 
          onClick={() => handleChange('randomSeed', Math.random() * 1000)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 uppercase font-semibold">Satisfaction</p>
          <p className="text-2xl font-mono text-emerald-400">{metrics.satisfaction}%</p>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 uppercase font-semibold">Encouragement</p>
          <p className="text-2xl font-mono text-blue-400">{metrics.encouragementIndex}</p>
        </div>
      </div>

      <div className="space-y-4">
        <section>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <Users size={16} /> Headcount: {config.headcount}
          </label>
          <input 
            type="range" min="10" max="200" value={config.headcount}
            onChange={(e) => handleChange('headcount', parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-700 rounded-lg h-2"
          />
        </section>

        <section>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <Zap size={16} /> Collaboration Space: {config.collaborationSpace}%
          </label>
          <input 
            type="range" min="0" max="100" value={config.collaborationSpace}
            onChange={(e) => handleChange('collaborationSpace', parseInt(e.target.value))}
            className="w-full accent-blue-500 bg-slate-700 rounded-lg h-2"
          />
        </section>

        <section>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <Layout size={16} /> Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['ABW', 'Cellular', 'Cubicles'] as LayoutType[]).map(l => (
              <button
                key={l}
                onClick={() => handleChange('layout', l)}
                className={`text-[10px] py-2 rounded-lg border transition-all ${
                  config.layout === l ? 'bg-slate-100 text-slate-900 border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <Palette size={16} /> Rendering Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Cloud', 'Dense', 'Stock', 'Wave'] as RenderMode[]).map(m => (
              <button
                key={m}
                onClick={() => handleChange('renderMode', m)}
                className={`text-[10px] py-2 rounded-lg border transition-all ${
                  config.renderMode === m ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="pt-2 text-[10px] text-slate-500 leading-tight">
        * Generative artwork simulating human potential within spatial boundaries.
      </div>
    </div>
  );
};

export default UI;
