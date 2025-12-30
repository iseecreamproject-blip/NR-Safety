import React from 'react';
import { TrainingData, ThemeColor } from '../types';
import { Printer, Award, FileSignature, BookOpen, Download } from 'lucide-react';
import { exportCertificateToPPTX } from '../utils/pptxGenerator';

interface CertificateProps {
  data: TrainingData;
  theme: ThemeColor;
}

const themeStyles: Record<ThemeColor, { border: string; text: string; bg: string }> = {
  emerald: { border: 'border-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50' },
  blue: { border: 'border-blue-600', text: 'text-blue-800', bg: 'bg-blue-50' },
  amber: { border: 'border-amber-600', text: 'text-amber-800', bg: 'bg-amber-50' },
  rose: { border: 'border-rose-600', text: 'text-rose-800', bg: 'bg-rose-50' },
};

const Certificate: React.FC<CertificateProps> = ({ data, theme }) => {
  const styles = themeStyles[theme];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPPTX = () => {
    exportCertificateToPPTX(data, theme);
  };

  // Filter content slides (usually excluding cover, objectives, references if simple)
  // For safety, we include all slides that have content bullets
  const contentSlides = data.slides.filter(s => s.conteudo && s.conteudo.length > 0);

  return (
    <div className="bg-slate-800 p-4 md:p-8 h-full overflow-auto flex flex-col items-center animate-fade-in gap-8">
      {/* Force Landscape mode for Certificate */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Buttons - Hidden when printing */}
      <div className="fixed top-24 right-4 md:top-32 md:right-12 no-print flex flex-col gap-2 z-50">
        <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors shadow-lg font-medium"
        >
            <Printer size={16} />
            Imprimir PDF
        </button>
        <button 
            onClick={handleDownloadPPTX}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium"
        >
            <Download size={16} />
            Baixar PPTX
        </button>
      </div>

      {/* --- PAGE 1: FRONT --- */}
      {/* Certificate Container (A4 Landscape approx ratio) */}
      <div className="bg-white w-[297mm] h-[210mm] relative shadow-2xl text-center print:shadow-none print:w-full print:h-full flex flex-col p-2 print:p-0 scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top print:scale-100 print:mb-0 print:break-after-page">
        
        {/* Ornamental Border */}
        <div className={`h-full w-full border-[16px] ${styles.border} p-2 flex flex-col relative`}>
            <div className={`h-full w-full border-[2px] ${styles.border} flex flex-col items-center justify-between p-12 relative overflow-hidden`}>
                
                {/* Background Pattern */}
                <div className={`absolute inset-0 ${styles.bg} opacity-20 z-0 pointer-events-none`} 
                     style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {/* Header */}
                <div className="relative z-10 w-full flex justify-between items-start">
                    <div className="w-32 h-32 flex items-center justify-center">
                         {data.companyLogo ? (
                            <img src={data.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className={`text-center ${styles.text} opacity-50`}>
                                <FileSignature size={48} className="mx-auto mb-1" />
                                <span className="text-[10px] font-bold uppercase block">Logo Empresa</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-right">
                        <Award size={64} className={`${styles.text} opacity-80`} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-8">
                    <h1 className={`font-serif text-6xl font-bold ${styles.text} mb-4 uppercase tracking-widest`}>
                        Certificado
                    </h1>
                    
                    <p className="text-xl text-slate-500 font-serif italic mb-8">
                        Certificamos para os devidos fins que
                    </p>

                    <div className="w-full max-w-3xl border-b border-slate-300 mb-2">
                        {/* Placeholder for name - empty for manual filling if printed */}
                        <p className="text-3xl font-bold text-slate-900 font-serif pb-2 min-h-[48px]">
                            {/* Nome do Colaborador */}
                        </p>
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">Nome do Colaborador</p>

                    <p className="text-lg text-slate-600 mb-2 max-w-4xl leading-relaxed">
                        Concluiu com êxito o treinamento de capacitação em:
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 mb-6 uppercase max-w-5xl">
                        {data.nr} - {data.titulo}
                    </h2>

                    <p className="text-lg text-slate-600">
                        Realizado em <span className="inline-block border-b border-slate-400 w-32 mx-1"></span>, 
                        com carga horária total de <strong>{data.workload || "____"} horas</strong>.
                    </p>
                </div>

                {/* Signatures */}
                <div className="relative z-10 w-full flex justify-around mt-12">
                    <div className="text-center">
                        <div className="w-64 border-t border-slate-400 pt-2 mb-1">
                             {/* Signature Space */}
                        </div>
                        <p className="font-bold text-slate-700">{data.instructorName || "Instrutor Responsável"}</p>
                        <p className="text-xs text-slate-600 max-w-[250px] mx-auto leading-tight">{data.instructorQualifications || "Instrutor / Responsável Técnico"}</p>
                    </div>

                    <div className="text-center">
                        <div className="w-64 border-t border-slate-400 pt-2 mb-1">
                             {/* Signature Space */}
                        </div>
                        <p className="font-bold text-slate-700">Colaborador</p>
                        <p className="text-xs text-slate-500 uppercase">Assinatura do Participante</p>
                    </div>
                </div>

                 {/* Legal Footer */}
                 <div className="relative z-10 w-full text-center mt-8 pt-4 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase">
                        Este certificado tem validade em todo território nacional em conformidade com as Normas Regulamentadoras do Ministério do Trabalho e Emprego.
                    </p>
                 </div>
            </div>
        </div>
      </div>

      {/* --- PAGE 2: VERSO (PROGRAMMATIC CONTENT) --- */}
      <div className="bg-white w-[297mm] h-[210mm] relative shadow-2xl text-left print:shadow-none print:w-full print:h-full flex flex-col p-8 print:p-8 scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top print:scale-100 print:break-before-page">
         <div className="h-full border-2 border-slate-300 p-8 flex flex-col">
            
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4 mb-6">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">{data.nr} - Conteúdo Programático</h2>
                     <p className="text-slate-500">Verso do Certificado</p>
                </div>
                <BookOpen size={32} className="text-slate-300" />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 h-full content-start">
                    {contentSlides.map((slide, idx) => (
                        <div key={idx} className="break-inside-avoid">
                            <h3 className="font-bold text-slate-700 mb-1 text-sm border-b border-slate-100 pb-1">{slide.titulo}</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {slide.conteudo.slice(0, 5).map((point, pIdx) => (
                                    <li key={pIdx} className="text-xs text-slate-600 leading-tight pl-1">{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-6 border-t-2 border-slate-200 text-xs text-slate-400 text-center">
                <p>Este verso é parte integrante do certificado de treinamento emitido para o colaborador.</p>
                {data.instructorName && (
                     <p className="mt-1">Responsável Técnico: {data.instructorName} - {data.instructorQualifications}</p>
                )}
            </div>

         </div>
      </div>

    </div>
  );
};

export default Certificate;