import React, { useState } from 'react';
import { TrainingData } from '../types';
import { Download, FileSignature, FileText, Loader2 } from 'lucide-react';
import { exportAttendanceListToDocx } from '../utils/docxGenerator';

interface AttendanceListProps {
  data: TrainingData;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ data }) => {
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    setIsGeneratingWord(true);
    try {
        await exportAttendanceListToDocx(data);
    } catch (e) {
        console.error("Error generating Word doc", e);
        alert("Erro ao gerar arquivo Word.");
    } finally {
        setIsGeneratingWord(false);
    }
  };

  // Increased to 30 rows as requested
  const rows = Array(30).fill(null);

  // Filter content slides (usually excluding cover, objectives, references if simple)
  // For safety, we include all slides that have content bullets
  const contentSlides = data.slides.filter(s => s.conteudo && s.conteudo.length > 0);

  return (
    <div className="bg-slate-200 p-4 md:p-8 h-full overflow-auto flex justify-center animate-fade-in">
       {/* CSS to force Portrait mode specifically for this component when printing */}
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 relative print:shadow-none print:w-full print:max-w-none print:p-0">
        
        {/* Print/Download Buttons - Hidden when printing */}
        <div className="absolute top-4 right-4 no-print flex gap-2 z-10">
            <button 
                onClick={handleExportWord}
                disabled={isGeneratingWord}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-lg font-medium disabled:opacity-70 disabled:cursor-wait"
                title="Baixar em formato Word editável"
            >
                {isGeneratingWord ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                DOCX
            </button>
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg font-medium"
            >
                <Download size={18} />
                PDF / Imprimir
            </button>
        </div>

        {/* Header */}
        <div className="border-2 border-slate-900 mb-6">
          <div className="flex border-b-2 border-slate-900">
            <div className="w-1/4 p-4 flex items-center justify-center border-r-2 border-slate-900">
              {data.companyLogo ? (
                <img src={data.companyLogo} alt="Logo" className="max-h-16 object-contain" />
              ) : (
                <div className="text-center text-slate-400">
                  <FileSignature size={32} className="mx-auto mb-1" />
                  <span className="text-xs font-bold uppercase">Logo da Empresa</span>
                </div>
              )}
            </div>
            <div className="w-3/4 p-4 text-center flex flex-col justify-center">
              <h1 className="text-xl font-bold uppercase text-slate-900">Lista de Presença de Treinamento</h1>
              <p className="text-sm text-slate-600 mt-1 uppercase font-semibold">Segurança e Saúde no Trabalho - NRs</p>
            </div>
          </div>

          <div className="flex flex-col text-sm">
            <div className="flex border-b border-slate-900">
              <div className="w-2/3 p-2 border-r border-slate-900">
                <span className="font-bold mr-2">Treinamento:</span> {data.nr} - {data.titulo}
              </div>
              <div className="w-1/3 p-2">
                <span className="font-bold mr-2">Carga Horária:</span> {data.workload ? `${data.workload}h` : '___h'}
              </div>
            </div>
            <div className="flex border-b border-slate-900">
              <div className="w-1/2 p-2 border-r border-slate-900">
                <span className="font-bold mr-2">Instrutor:</span> {data.instructorName || '__________________________'}
              </div>
              <div className="w-1/2 p-2">
                <span className="font-bold mr-2">Data:</span> ___/___/______
              </div>
            </div>
            
            {/* Full Programmatic Content */}
            <div className="p-3 border-b border-slate-900 bg-slate-50">
              <span className="font-bold block mb-2 uppercase text-xs tracking-wider">Conteúdo Programático Completo:</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {contentSlides.map((slide, idx) => (
                    <div key={idx} className="text-[10px] leading-tight text-slate-700 flex items-start gap-1">
                        <span>•</span>
                        <span>{slide.titulo}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-slate-900 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-900 p-2 w-10 text-center">#</th>
              <th className="border border-slate-900 p-2 text-left">Nome Completo do Colaborador</th>
              <th className="border border-slate-900 p-2 w-32 text-center">CPF/ID</th>
              <th className="border border-slate-900 p-2 w-48 text-center">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((_, idx) => (
              <tr key={idx}>
                <td className="border border-slate-900 p-2 text-center text-slate-500 h-8 md:h-10">{idx + 1}</td>
                <td className="border border-slate-900 p-2"></td>
                <td className="border border-slate-900 p-2"></td>
                <td className="border border-slate-900 p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 flex justify-between text-xs text-slate-500 break-inside-avoid">
            <div className="max-w-md">
                <p className="italic">
                    "Declaro que recebi o treinamento de segurança descrito acima, compreendendo os riscos e as medidas de prevenção necessárias para a execução das minhas atividades."
                </p>
            </div>
            <div className="text-right mt-6">
                <div className="w-64 border-t border-slate-400 pt-1 text-center font-medium">
                    Assinatura do Instrutor Responsável
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AttendanceList;