export type ThemeColor = 'emerald' | 'blue' | 'amber' | 'rose';

export interface TrainingOptions {
  theme: ThemeColor;
  includeQuiz: boolean;
  includeCaseStudies: boolean;
  includeGlossary: boolean;
  instructorName: string;
  instructorQualifications: string;
  companyLogo: string;
  workload: string; // e.g. "8" or "4"
}

export interface Slide {
  titulo: string;
  conteudo: string[];
  notas_instrutor: string;
  sugestao_imagem: string;
  image_prompt: string; // Prompt in English for image generation
}

export interface TrainingData {
  titulo: string;
  nr: string;
  versao_nr: string;
  descricao_geral: string;
  slides: Slide[];
  referencias: string;
  observacoes_legais: string;
  qr_code_conteudo: string;
  // Metadata fields injected after generation
  instructorName?: string;
  instructorQualifications?: string;
  companyLogo?: string;
  workload?: string;
  // Error handling
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}