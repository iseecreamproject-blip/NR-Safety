import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AccessGateProps {
  onLogin: (key: string) => boolean;
}

const AccessGate: React.FC<AccessGateProps> = ({ onLogin }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onLogin(inputKey);
    
    if (!isValid) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-transform duration-100 ${shake ? 'translate-x-[-10px]' : ''} ${shake ? 'translate-x-[10px]' : ''}`}>
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-green-600 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Lock className="text-white h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Área Restrita</h1>
            <p className="text-slate-400 text-sm mt-2">NR Safety Gen - Treinamentos SST</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <p className="text-slate-600 text-sm">
              Este sistema é exclusivo para alunos e instrutores autorizados. Por favor, insira sua chave de acesso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                Chave de Acesso
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError(false);
                }}
                placeholder="Digite sua chave aqui..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  error 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-slate-200 bg-slate-50 focus:border-green-500 focus:bg-white text-slate-900'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-medium animate-pulse">
                <AlertCircle size={14} />
                <span>Chave de acesso incorreta. Verifique e tente novamente.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>Acessar Sistema</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-2">Não possui acesso?</p>
            <a 
              href="#" // Coloque seu link da Hotmart aqui no futuro
              className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center justify-center gap-1 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                alert("Configure o link da sua página de vendas da Hotmart aqui.");
              }}
            >
              <ShieldCheck size={14} />
              Adquirir Licença de Uso
            </a>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} NR Safety Gen. Todos os direitos reservados.
      </p>
    </div>
  );
};

export default AccessGate;