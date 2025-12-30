import { GoogleGenAI } from "@google/genai";
import { TrainingData, TrainingOptions } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um assistente especializado em Segurança do Trabalho, treinamentos corporativos e conformidade legal com as Normas Regulamentadoras brasileiras.
Sua tarefa é gerar conteúdos completos, fiéis, estruturados e 100% alinhados ao conteúdo programático obrigatório das NRs do Ministério do Trabalho.

VALIDAÇÃO INICIAL (CRÍTICO):
Verifique se o tema solicitado refere-se a uma Norma Regulamentadora (NR) oficial brasileira ou um tema estritamente ligado à Segurança do Trabalho.
Se o tema for aleatório (ex: "Bolo de Cenoura", "Futebol", "Marketing"), retorne APENAS um JSON com o campo "error": "O tema solicitado não é uma Norma Regulamentadora (NR) válida ou relacionada à Segurança do Trabalho.".

REGRAS GERAIS DE CONTEÚDO:
Nunca invente conteúdo normativo.
Use apenas tópicos e obrigações presentes nas Normas Regulamentadoras oficiais.
Sempre gere o treinamento com base no conteúdo programático obrigatório da NR solicitada.

FORMATAÇÃO DE TÍTULOS:
NUNCA coloque numeração de slides nos títulos (Ex: NÃO USE "Slide 1: Introdução"). Use apenas "Introdução".
NUNCA coloque "Capa" como título do primeiro slide. Use o Título Oficial do Treinamento.

Estrutura sempre fixa da apresentação:
Slide 1 — Título Oficial do Treinamento (Não escreva "Capa")
Slide 2 — Objetivos do treinamento
Slide 3 — Referências normativas e versão da NR
Slides seguintes — Conteúdo programático obrigatório exatamente conforme a NR
Se solicitado: Slide de Estudo de Casos
Se solicitado: Slide de Quiz/Avaliação
Se solicitado: Slide de Glossário
Slide final — Conclusão e QR Code de materiais extras

Saída SEMPRE em formato estruturado para montagem de PPTX, seguindo o seguinte JSON:
{
  "titulo": "",
  "nr": "",
  "versao_nr": "",
  "descricao_geral": "",
  "slides": [
    {
      "titulo": "",
      "conteudo": [
        "ponto 1",
        "ponto 2"
      ],
      "notas_instrutor": "",
      "sugestao_imagem": "Descrição da imagem em português",
      "image_prompt": "Detailed description of the image in English for AI generation, photorealistic style, 4k"
    }
  ],
  "referencias": "",
  "observacoes_legais": "",
  "qr_code_conteudo": "",
  "error": null
}

IMPORTANTE SOBRE IMAGENS:
Para cada slide, gere um campo "image_prompt" com uma descrição visual detalhada em INGLÊS.
Este prompt será usado por uma IA geradora de imagens.
O estilo deve ser: "Photorealistic, professional safety training context, high quality, cinematic lighting".

IMPORTANTE SOBRE CARGA HORÁRIA:
A quantidade de slides DEVE ser proporcional à carga horária.
Siga rigorosamente a instrução de quantidade de slides fornecida no prompt do usuário.

As cores temáticas da apresentação devem ser branco e a cor escolhida pelo usuário.
Todos os itens obrigatórios da NR devem aparecer.

CHECK DE CONFORMIDADE (OBRIGATÓRIO)
Antes de gerar a saída final, verifique:
O tema é uma NR válida?
Todos os itens obrigatórios da NR estão presentes?
Os títulos NÃO possuem numeração (Ex: "Slide 1")?
O "image_prompt" está em inglês?
`;

// Função auxiliar para retry com backoff exponencial
async function generateWithRetry(model: any, params: any, retries = 3, delay = 2000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(params);
    } catch (error: any) {
      const msg = error.message || '';
      const isOverloaded = msg.includes('503') || msg.includes('overloaded') || msg.includes('429');
      
      // Se for a última tentativa, lança o erro para ser tratado pelo fallback de modelo
      if (i === retries - 1) throw error;

      if (isOverloaded) {
        console.warn(`Model overloaded (503). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Aumenta o tempo de espera progressivamente
        continue;
      }
      
      // Se for outro erro, lança imediatamente
      throw error;
    }
  }
}

export const generateTrainingContent = async (topic: string, options: TrainingOptions): Promise<TrainingData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Add user options to the prompt
  let customRequest = `Tópico solicitado: ${topic}.\n`;
  
  if (options.workload) {
    const hours = parseInt(options.workload);
    let quantityInstruction = "Gere cerca de 10 a 15 slides."; 
    
    if (!isNaN(hours)) {
        if (hours >= 40) {
            quantityInstruction = "Gere um curso extensivo e muito completo com mais de 50 slides detalhados.";
        } else if (hours >= 16) {
            quantityInstruction = "Gere um curso detalhado com entre 30 a 45 slides.";
        } else if (hours >= 8) {
            quantityInstruction = "Gere um curso padrão com entre 20 a 30 slides.";
        } else if (hours >= 4) {
            quantityInstruction = "Gere um curso conciso com entre 15 a 20 slides.";
        }
    }
    
    customRequest += `Carga Horária Planejada: ${options.workload} horas.\n`;
    customRequest += `IMPORTANTE: ${quantityInstruction} Ajuste a profundidade e a quantidade de slides para preencher esta duração com qualidade.\n`;
  } else {
    customRequest += `Carga Horária: Não especificada. Gere um treinamento padrão de 15 a 20 slides.\n`;
  }

  const optionalSections = [];
  if (options.includeCaseStudies) optionalSections.push("Estudos de Caso práticos");
  if (options.includeQuiz) optionalSections.push("Quiz de Avaliação com 3 perguntas");
  if (options.includeGlossary) optionalSections.push("Glossário de termos técnicos");

  if (optionalSections.length > 0) {
    customRequest += `\nPor favor, INCLUA obrigatoriamente as seguintes seções opcionais no treinamento: ${optionalSections.join(', ')}.`;
  } else {
    customRequest += `\nNão inclua seções opcionais extras (como quiz ou glossário) a menos que façam parte do conteúdo obrigatório da norma.`;
  }

  // Lista de modelos para tentar em ordem de preferência
  // Se o principal (2.5 flash) estiver ocupado, tenta o Lite.
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash-lite-preview-02-05"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
        console.log(`Tentando gerar com modelo: ${modelName}`);
        
        const response = await generateWithRetry(ai.models, {
            model: modelName,
            contents: customRequest,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                temperature: 0.2, 
            },
        }, 3, 3000); // 3 tentativas por modelo, delay inicial de 3s

        let text = response.text;
        if (!text) throw new Error("No content generated");

        // Clean up markdown code blocks
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();

        try {
            const data = JSON.parse(text) as TrainingData;
            return {
                ...data,
                instructorName: options.instructorName,
                instructorQualifications: options.instructorQualifications,
                companyLogo: options.companyLogo,
                workload: options.workload
            };
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            throw new Error("Formato inválido recebido da IA.");
        }

    } catch (error: any) {
        console.warn(`Falha no modelo ${modelName}:`, error.message);
        lastError = error;
        // Se o erro for 503/Overloaded, o loop continua para o próximo modelo da lista
        const isOverloaded = error.message?.includes('503') || error.message?.includes('overloaded');
        if (!isOverloaded) {
             // Se não for sobrecarga (ex: API Key inválida), para imediatamente
             throw error;
        }
    }
  }

  // Se chegou aqui, todos os modelos falharam
  console.error("Todos os modelos falharam.");
  throw lastError || new Error("Não foi possível gerar o treinamento no momento. Servidores ocupados.");
};