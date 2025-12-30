import React from 'react';
import { TrainingOptions, ThemeColor } from '../types';
import { Settings2, Palette, Layers, User, Briefcase, Clock, Award } from 'lucide-react';

interface TrainingConfigProps {
  options: TrainingOptions;
  onChange: (newOptions: TrainingOptions) => void;
  disabled: boolean;
}

const themeColors: { id: ThemeColor; name: string; bg: string; ring: string }[] = [
  { id: 'emerald', name: 'Verde (Padrão)', bg: 'bg-emerald-600', ring: 'ring-emerald-500' },
  { id: 'blue', name: 'Azul Corporativo', bg: 'bg-blue-600', ring: 'ring-blue-500' },
  { id: 'amber', name: 'Laranja Alerta', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'rose', name: 'Vermelho Urgência', bg: 'bg-rose-600', ring: 'ring-rose-500' },
];

const TrainingConfig: React.FC<TrainingConfigProps> = ({ options, onChange, disabled }) => {
  const toggleOption = (key: keyof TrainingOptions) => {
    // @ts-ignore - dynamic key access
    onChange({ ...options, [key]: !options[key] });
  };

  const setTheme = (theme: ThemeColor) => {
    onChange({ ...options, theme });
  };

  const handleChange = (key: keyof TrainingOptions, value: string) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
        <Settings2 className="text-slate-400" size={20} />
        <h3 className="font-semibold text-slate-700">Personalizar Treinamento</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Institutional Details */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Briefcase size={16} />
            Dados do Instrutor/Empresa
          </label>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Nome do Instrutor</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={options.instructorName}
                  onChange={(e) => handleChange('instructorName', e.target.value)}
                  disabled={disabled}
                  placeholder="Ex: João Silva, TST"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Qualificações Técnicas</label>
              <div className="relative">
                <Award size={14} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={options.instructorQualifications}
                  onChange={(e) => handleChange('instructorQualifications', e.target.value)}
                  disabled={disabled}
                  placeholder="Ex: Téc. Seg. Trabalho - Reg: 12345"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Logo URL (Opcional)</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={options.companyLogo}
                  onChange={(e) => handleChange('companyLogo', e.target.value)}
                  disabled={disabled}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Carga Horária (Horas)</label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="number" 
                  value={options.workload}
                  onChange={(e) => handleChange('workload', e.target.value)}
                  disabled={disabled}
                  placeholder="Ex: 8"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Theme Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
            <Palette size={16} />
            Tema Visual
          </label>
          <div className="flex gap-3 flex-wrap">
            {themeColors.map((theme) => (
              <button
                key={theme.id}
                type="button"
                disabled={disabled}
                onClick={() => setTheme(theme.id)}
                className={`w-10 h-10 rounded-full ${theme.bg} transition-all duration-200 flex items-center justify-center ${
                  options.theme === theme.id
                    ? `ring-4 ring-offset-2 ${theme.ring} scale-110`
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Content Options */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
            <Layers size={16} />
            Conteúdo Programático
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={options.includeQuiz}
                onChange={() => toggleOption('includeQuiz')}
                disabled={disabled}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className={`text-sm ${options.includeQuiz ? 'text-slate-900 font-medium' : 'text-slate-500'} group-hover:text-slate-900 transition-colors`}>
                Incluir Quiz / Avaliação
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={options.includeCaseStudies}
                onChange={() => toggleOption('includeCaseStudies')}
                disabled={disabled}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className={`text-sm ${options.includeCaseStudies ? 'text-slate-900 font-medium' : 'text-slate-500'} group-hover:text-slate-900 transition-colors`}>
                Incluir Estudos de Caso
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={options.includeGlossary}
                onChange={() => toggleOption('includeGlossary')}
                disabled={disabled}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className={`text-sm ${options.includeGlossary ? 'text-slate-900 font-medium' : 'text-slate-500'} group-hover:text-slate-900 transition-colors`}>
                Incluir Glossário
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingConfig;