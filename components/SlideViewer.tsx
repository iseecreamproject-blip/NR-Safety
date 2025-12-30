import React, { useState } from 'react';
import { Slide, ThemeColor } from '../types';
import { ChevronLeft, ChevronRight, BookOpen, Image as ImageIcon, Loader2, Clock, User } from 'lucide-react';

interface SlideViewerProps {
  slides: Slide[];
  theme: ThemeColor;
  instructorName?: string;
  companyLogo?: string;
  workload?: string;
}

const themeStyles: Record<ThemeColor, { 
  bg: string; 
  text: string; 
  border: string; 
  btnBg: string;
  btnText: string;
  accent: string;
  lightBg: string;
  gradient: string;
}> = {
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    btnBg: 'bg-emerald-100',
    btnText: 'text-emerald-700',
    accent: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    gradient: 'from-emerald-600 to-emerald-800',
  },
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-800',
    border: 'border-blue-200',
    btnBg: 'bg-blue-100',
    btnText: 'text-blue-700',
    accent: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    gradient: 'from-blue-600 to-blue-800',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-800',
    border: 'border-amber-200',
    btnBg: 'bg-amber-100',
    btnText: 'text-amber-700',
    accent: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    gradient: 'from-amber-500 to-amber-700',
  },
  rose: {
    bg: 'bg-rose-600',
    text: 'text-rose-800',
    border: 'border-rose-200',
    btnBg: 'bg-rose-100',
    btnText: 'text-rose-700',
    accent: 'bg-rose-500',
    lightBg: 'bg-rose-50',
    gradient: 'from-rose-600 to-rose-800',
  },
};

const SlideViewer: React.FC<SlideViewerProps> = ({ slides, theme, instructorName, companyLogo, workload }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;
  const styles = themeStyles[theme];

  const nextSlide = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(prev => prev + 1);
      setImageLoaded(false);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setImageLoaded(false);
    }
  };

  if (!currentSlide) return null;

  // Pollinations.ai URL for real-time generation
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(currentSlide.image_prompt || currentSlide.titulo + ' work safety training')}?width=1024&height=768&nologo=true&model=flux&seed=${currentIndex}`;

  const isCover = currentIndex === 0;

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in">
      {/* Controls Header */}
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center z-10 relative shadow-sm h-16">
        <div className="flex items-center gap-2">
            {/* Dot indicators */}
            <div className="flex gap-1">
            {slides.map((_, idx) => (
                <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? `${styles.bg} w-6` : 'bg-slate-300 w-1.5'
                }`}
                />
            ))}
            </div>

          {companyLogo && !isCover && (
            <img src={companyLogo} alt="Logo" className="h-6 ml-6 object-contain opacity-80" />
          )}
        </div>
        <div className="flex items-center gap-2">
           <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showNotes ? styles.btnBg + ' ' + styles.btnText : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen size={16} />
            {showNotes ? 'Ocultar Notas' : 'Ver Notas'}
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Content */}
        <div className="flex-1 flex flex-col relative bg-white overflow-y-auto">
          {/* Key forces re-render of animation when index changes */}
          <div key={currentIndex} className="p-8 md:p-12 flex flex-col flex-1 relative animate-slide-in">
            
            {/* Watermark Logo for Cover */}
            {isCover && companyLogo && (
              <div className="absolute top-8 right-8">
                <img src={companyLogo} alt="Company Logo" className="h-16 object-contain" />
              </div>
            )}

            {/* Header Line */}
            <div className={`w-24 h-2 ${styles.bg} mb-8 rounded-full`}></div>

            <h2 className={`${isCover ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'} font-bold text-slate-800 mb-8 leading-tight`}>
              {currentSlide.titulo}
            </h2>

            <div className="space-y-5 text-slate-700 text-lg flex-1">
              {currentSlide.conteudo.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${styles.accent} mt-2.5 shrink-0`} />
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            
            {/* Metadata on Cover Slide */}
            {isCover && (
               <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {instructorName && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className={`p-2 rounded-full ${styles.btnBg}`}>
                        <User size={20} className={styles.btnText} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">Instrutor</p>
                        <p className="font-medium">{instructorName}</p>
                      </div>
                    </div>
                  )}
                  {workload && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className={`p-2 rounded-full ${styles.btnBg}`}>
                        <Clock size={20} className={styles.btnText} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">Carga Horária</p>
                        <p className="font-medium">{workload} horas</p>
                      </div>
                    </div>
                  )}
               </div>
            )}

            {/* Footer Prompt */}
            {!isCover && (
                <div className="mt-12 pt-6 border-t border-slate-100 flex items-center gap-3 text-slate-400 text-sm italic">
                <ImageIcon size={16} />
                <span>Sugestão visual: {currentSlide.sugestao_imagem}</span>
                </div>
            )}
            
            {/* Instructor Name Footer (Small) */}
            {!isCover && instructorName && (
                <div className="absolute bottom-2 right-6 text-xs text-slate-300 font-medium">
                   Instrutor: {instructorName}
                </div>
            )}

          </div>
        </div>

        {/* Right: Image Panel */}
        <div className="w-full md:w-[45%] bg-slate-900 relative overflow-hidden flex items-center justify-center group">
            {/* Image Overlay Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t ${styles.gradient} opacity-20 z-10 pointer-events-none mix-blend-overlay`}></div>
            
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-0">
                <Loader2 className="text-slate-600 animate-spin" size={32} />
              </div>
            )}
            
            <img 
              src={imageUrl} 
              alt={currentSlide.sugestao_imagem}
              className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error("Image failed to load");
              }}
            />
            
             <div className="absolute bottom-4 right-6 text-white font-bold text-6xl opacity-20 pointer-events-none select-none z-20">
              NR
            </div>
        </div>

        {/* Notes Panel (Overlay) */}
        {showNotes && (
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-80 bg-yellow-50 border-l border-yellow-200 p-6 overflow-y-auto shadow-xl z-30 animate-in slide-in-from-right duration-300">
            <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <BookOpen size={18} /> Notas do Instrutor
            </h3>
            <p className="text-yellow-900/90 text-sm leading-relaxed whitespace-pre-line font-medium">
              {currentSlide.notas_instrutor}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-white p-4 border-t border-slate-200 flex justify-between items-center z-10 relative">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </button>

        <span className="text-sm font-medium text-slate-400">
            {currentIndex + 1} / {totalSlides}
        </span>

        <button
          onClick={nextSlide}
          disabled={currentIndex === totalSlides - 1}
          className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={24} className="text-slate-700" />
        </button>
      </div>
    </div>
  );
};

export default SlideViewer;