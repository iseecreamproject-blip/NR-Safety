import React from 'react';
import { TrainingData } from '../types';
import { Copy, Check } from 'lucide-react';

interface JsonOutputProps {
  data: TrainingData;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ data }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 h-full flex flex-col">
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <span className="text-slate-400 font-mono text-sm">training-data.json</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          {copied ? 'Copiado!' : 'Copiar JSON'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-green-400 font-mono text-xs sm:text-sm leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonOutput;