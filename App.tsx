import React, { useState } from 'react';
import { generateTrainingContent } from './services/geminiService';
import { TrainingData, LoadingState, TrainingOptions } from './types';
import Header from './components/Header';
import SlideViewer from './components/SlideViewer';
import JsonOutput from './components/JsonOutput';
import TrainingConfig from './components/TrainingConfig';
import AttendanceList from './components/AttendanceList';
import Certificate from './components/Certificate';
import { exportToPPTX } from './utils/pptxGenerator';
import { Search, Loader2, FileJson, Presentation, AlertTriangle, ClipboardList, Download, Award, Share2, Filter } from 'lucide-react';

// Categorized prompts for better UX
const categories = [
  { id: 'destaques', label: 'Destaques' },
  { id: 'gerais', label: 'Normas Gerais' },
  { id: 'riscos', label: 'Alto Risco' },
  { id: 'setoriais', label: 'Setoriais' },
];

const promptsByCategory: Record<string, string[]> = {
  destaques: [
    "NR-35 Trabalho em Altura",
    "NR-10 Segurança em Eletricidade",
    "NR-06 Equipamentos de Proteção (EPI)",
    "NR-05 CIPA"
  ],
  gerais: [
    "NR-01 Disposições Gerais e GRO",
    "NR-05 CIPA - Comissão Interna",
    "NR-07 PCMSO - Saúde Ocupacional",
    "NR-17 Ergonomia"
  ],
  riscos: [
    "NR-12 Máquinas e Equipamentos",
    "NR-13 Caldeiras e Vasos de Pressão",
    "NR-33 Espaço Confinado",
    "NR-35 Trabalho em Altura"
  ],
  setoriais: [
    "NR-18 Indústria da Construção",
    "NR-31 Trabalho Rural",
    "NR-32 Serviços de Saúde",
    "NR-34 Construção Naval"
  ]
};

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('destaques');
  const [options, setOptions] = useState<TrainingOptions>({
    theme: 'emerald',
    includeQuiz: false,
    includeCaseStudies: false,
    includeGlossary: false,
    instructorName: '',
    instructorQualifications: '',
    companyLogo: '',
    workload: ''
  });
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  const [data, setData] = useState<TrainingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'slides' | 'json' | 'attendance' | 'certificate'>('slides');

  const handleGenerate = async (query: string) => {
    if (!query.trim()) return;

    setLoading({ isLoading: true, message: 'Consultando Normas e Gerando Conteúdo...' });
    setError(null);
    setData(null);

    try {
      const result = await generateTrainingContent(query, options);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err: any) {
      console.error(err);
      // Extrai mensagem de erro amigável se possível
      let errorMsg = "Falha ao gerar o treinamento.";
      
      if (err.message) {
        if (err.message.includes("503") || err.message.includes("overloaded")) {
          errorMsg = "Os servidores de IA estão sobrecarregados no momento. Por favor, tente novamente em alguns instantes.";
        } else if (err.message.includes("API Key")) {
          errorMsg = "Chave de API não configurada corretamente.";
        } else {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(inputValue);
  };

  const handleExportPPT = async () => {
    if (!data) return;

    // Show loading state specifically for PPT generation because images take time
    setLoading({ isLoading: true, message: 'Gerando PowerPoint e processando imagens (isso pode levar alguns segundos)...' });
    
    try {
        await exportToPPTX(data, options.theme);
    } catch (error) {
        console.error("Error generating PPT:", error);
        alert("Ocorreu um erro ao gerar o PowerPoint. Tente novamente.");
    } finally {
        setLoading({ isLoading: false, message: '' });
    }
  };

  const handleShare = async () => {
    if (!data) return;
    
    const shareData = {
      title: `Treinamento ${data.nr}`,
      text: `Gerei um treinamento completo de ${data.nr} - ${data.titulo} com o NR Safety Gen.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert("Link copiado para a área de transferência!");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 print:p-0 print:max-w-none">
        
        {/* Input Section - Hidden when printing */}
        <div className="flex flex-col items-center gap-6 max-w-5xl mx-auto w-full print:hidden">
          <div className="text-center space-y-2 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Gere treinamentos de SST em segundos
            </h2>
            <p className="text-slate-600 text-lg">
              Escolha uma categoria, digite a NR e obtenha o conteúdo oficial.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="w-full relative group max-w-3xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ex: Treinamento NR-35 Trabalho em Altura..."
              className="block w-full pl-12 pr-24 py-5 text-lg rounded-2xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 shadow-sm transition-all"
            />
            <div className="absolute inset-y-2 right-2">
              <button
                type="submit"
                disabled={loading.isLoading || !inputValue.trim()}
                className="h-full px-6 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Gerar
              </button>
            </div>
          </form>

          {/* Configuration Component */}
          <div className="w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <TrainingConfig 
                options={options} 
                onChange={setOptions} 
                disabled={loading.isLoading} 
            />
          </div>

          {!data && !loading.isLoading && (
             <div className="w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
               <div className="flex items-center gap-2 mb-4 text-slate-500 text-sm font-medium">
                 <Filter size={16} />
                 <span>Sugestões por Categoria:</span>
               </div>
               
               {/* Category Tabs */}
               <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                 {categories.map((cat) => (
                   <button
                     key={cat.id}
                     onClick={() => setSelectedCategory(cat.id)}
                     className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                       selectedCategory === cat.id
                         ? 'bg-slate-800 text-white shadow-md'
                         : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                     }`}
                   >
                     {cat.label}
                   </button>
                 ))}
               </div>

               {/* Prompt Buttons */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {promptsByCategory[selectedCategory].map((prompt) => (
                   <button
                     key={prompt}
                     onClick={() => {
                       setInputValue(prompt);
                       handleGenerate(prompt);
                     }}
                     className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 text-left hover:border-green-500 hover:text-green-700 hover:shadow-md transition-all h-full flex items-center"
                   >
                     {prompt}
                   </button>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Loading State */}
        {loading.isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
            <p className="text-xl font-medium text-slate-700 animate-pulse text-center px-4">{loading.message}</p>
            {!loading.message.includes('PowerPoint') && (
                <p className="text-sm text-slate-500 mt-2">Isso pode levar alguns segundos...</p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 max-w-3xl mx-auto w-full animate-slide-in">
            <AlertTriangle className="text-red-600 shrink-0" />
            <div>
              <h3 className="font-bold text-red-900">Atenção</h3>
              <p className="text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Area */}
        {data && !loading.isLoading && (
          <div className="flex-1 flex flex-col min-h-[600px] animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 print:hidden">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{data.nr} - {data.titulo}</h2>
                <p className="text-slate-500 text-sm">Versão: {data.versao_nr} | Slides: {data.slides.length}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 bg-slate-200 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setActiveTab('slides')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'slides' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Presentation size={16} />
                  <span className="hidden md:inline">Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'attendance' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList size={16} />
                  <span className="hidden md:inline">Lista</span>
                </button>
                <button
                  onClick={() => setActiveTab('certificate')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'certificate' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award size={16} />
                  <span className="hidden md:inline">Certificado</span>
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'json' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileJson size={16} />
                  <span className="hidden md:inline">JSON</span>
                </button>
                
                <div className="w-px bg-slate-300 mx-1 hidden md:block"></div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-900 transition-colors whitespace-nowrap"
                  title="Compartilhar"
                >
                  <Share2 size={16} />
                </button>

                <button
                  onClick={handleExportPPT}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                >
                  <Download size={16} />
                  PPTX
                </button>
              </div>
            </div>

            <div className="flex-1">
              {activeTab === 'slides' && (
                <div className="h-[650px] print:hidden">
                  <SlideViewer 
                    slides={data.slides} 
                    theme={options.theme}
                    instructorName={data.instructorName}
                    companyLogo={data.companyLogo}
                    workload={data.workload}
                  />
                </div>
              )}
              {activeTab === 'attendance' && (
                  <AttendanceList data={data} />
              )}
              {activeTab === 'certificate' && (
                  <Certificate data={data} theme={options.theme} />
              )}
              {activeTab === 'json' && (
                <div className="h-[650px] print:hidden">
                  <JsonOutput data={data} />
                </div>
              )}
            </div>
            
            {activeTab === 'slides' && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2">Observações Legais</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{data.observacoes_legais}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2">Referências</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{data.referencias}</p>
                </div>
                </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default App;