import PptxGenJS from "pptxgenjs";
import { TrainingData, ThemeColor } from "../types";

const hexColors: Record<ThemeColor, { main: string; light: string; text: string }> = {
  emerald: { main: "059669", light: "ECFDF5", text: "064E3B" },
  blue: { main: "2563EB", light: "EFF6FF", text: "1E40AF" },
  amber: { main: "D97706", light: "FFFBEB", text: "92400E" },
  rose: { main: "E11D48", light: "FFF1F2", text: "9F1239" },
};

// Helper to fetch image and convert to Base64 with TIMEOUT
const getImageBase64 = async (prompt: string, seed: number): Promise<string | null> => {
  const timeoutMs = 4000; // 4 seconds timeout per image
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const encodedPrompt = encodeURIComponent(prompt);
    // Matching the URL pattern used in SlideViewer
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&model=flux&seed=${seed}`;
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) return null;
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // If it times out or fails (CORS, network), we just return null so PPT generation continues
    console.warn("Skipping image for PPT due to error/timeout:", error);
    return null;
  }
};

export const exportToPPTX = async (data: TrainingData, theme: ThemeColor) => {
  const pptx = new PptxGenJS();
  const colors = hexColors[theme];

  pptx.layout = "LAYOUT_16x9";
  
  // Set Metadata
  pptx.title = data.titulo;
  pptx.subject = data.nr;
  pptx.author = data.instructorName || "NR Safety Gen";

  // Pre-fetch all images in parallel to speed up generation
  const imagePromises = data.slides.map((slide, index) => {
    // Only fetch for content slides or if there is a prompt
    const prompt = slide.image_prompt || slide.titulo + ' work safety training';
    return getImageBase64(prompt, index);
  });

  // Use Promise.all to wait, but individual failures won't stop the process because getImageBase64 catches errors
  const images = await Promise.all(imagePromises);

  // --- SLIDES GENERATION ---
  data.slides.forEach((slide, index) => {
    const isCover = index === 0;
    const pptSlide = pptx.addSlide();
    const slideImage = images[index];

    // Background Styling
    if (isCover) {
        // Cover Slide Style
        pptSlide.background = { color: colors.light };
        
        // Strip on the left
        pptSlide.addShape(pptx.ShapeType.rect, { 
            x: 0, y: 0, w: '5%', h: '100%', 
            fill: { color: colors.main } 
        });

        // Title
        pptSlide.addText(slide.titulo, {
            x: '10%', y: '30%', w: '80%',
            fontSize: 44, bold: true, color: '1E293B', fontFace: 'Arial'
        });

        // Subtitle / NR
        pptSlide.addText(data.nr, {
            x: '10%', y: '20%', w: '80%',
            fontSize: 24, bold: true, color: colors.main, fontFace: 'Arial'
        });

        // Metadata: Instructor & Workload
        let metaY = '65%';
        if (data.instructorName) {
             pptSlide.addText(`Instrutor: ${data.instructorName}`, {
                x: '10%', y: metaY, fontSize: 14, color: '64748B'
            });
            // @ts-ignore - string arithmetic approximation
            metaY = '70%'; 
        }
        if (data.workload) {
             pptSlide.addText(`Carga Horária: ${data.workload} horas`, {
                x: '10%', y: metaY, fontSize: 14, color: '64748B'
            });
        }
        
    } else {
        // Content Slide Style
        
        // Header Bar
        pptSlide.addShape(pptx.ShapeType.rect, { 
            x: 0, y: 0, w: '100%', h: '15%', 
            fill: { color: colors.main } 
        });
        
        // Title
        pptSlide.addText(slide.titulo, {
            x: 0.5, y: 0.3, w: '90%',
            fontSize: 28, bold: true, color: 'FFFFFF', fontFace: 'Arial'
        });

        // Content Bullets
        pptSlide.addText(slide.conteudo.map(line => ({ text: line, options: { breakLine: true } })), {
            x: 0.5, y: 1.2, w: '60%', h: '75%',
            fontSize: 18, color: '334155', bullet: true, paraSpaceAfter: 10
        });

        // IMAGE PLACEMENT
        if (slideImage) {
            // Embed the fetched base64 image
            pptSlide.addImage({
                data: slideImage,
                x: '65%', y: 1.2, w: '30%', h: 3.5, // Adjusted height to fit well
                sizing: { type: 'contain', w: '30%', h: 3.5 }
            });
        } else {
            // Fallback if image failed to load: Text Box
            pptSlide.addShape(pptx.ShapeType.rect, {
                x: '65%', y: 1.2, w: '30%', h: '50%',
                fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1' }
            });
            
            pptSlide.addText("Sugestão de Imagem:\n" + slide.sugestao_imagem, {
                 x: '66%', y: 1.3, w: '28%',
                 fontSize: 10, color: '94A3B8', align: 'center'
            });
        }

        // Footer
        pptSlide.addShape(pptx.ShapeType.line, { 
             x: 0.5, y: '90%', w: '90%', h: 0, 
             line: { color: 'E2E8F0', width: 1 } 
        });

        pptSlide.addText(`NR Safety Gen - ${data.nr}`, {
            x: 0.5, y: '92%', fontSize: 10, color: '94A3B8'
        });
    }

    // Instructor Notes (Hidden in presentation mode)
    if (slide.notas_instrutor) {
        pptSlide.addNotes(slide.notas_instrutor);
    }
  });

  return pptx.writeFile({ fileName: `Treinamento_${data.nr.replace(/\s+/g, '_')}.pptx` });
};

export const exportCertificateToPPTX = async (data: TrainingData, theme: ThemeColor) => {
    const pptx = new PptxGenJS();
    // A4 Landscape layout
    pptx.layout = 'LAYOUT_A4'; 
    const colors = hexColors[theme];

    // --- SLIDE 1: FRONT ---
    const front = pptx.addSlide();
    
    // Background and Border
    front.background = { color: 'FFFFFF' };
    
    // Outer Border
    front.addShape(pptx.ShapeType.rect, {
        x: 0.2, y: 0.2, w: '96%', h: '94%',
        line: { color: colors.main, width: 3 }, fill: { color: 'FFFFFF' }
    });
    // Inner Thin Border
    front.addShape(pptx.ShapeType.rect, {
        x: 0.3, y: 0.3, w: '94%', h: '92%',
        line: { color: colors.main, width: 1, dashType: 'solid' }
    });

    // Header Title
    front.addText("CERTIFICADO", {
        x: 0, y: 1.0, w: '100%',
        fontSize: 48, bold: true, color: colors.text, fontFace: 'Times New Roman', align: 'center',
        charSpacing: 5
    });

    front.addText("Certificamos para os devidos fins que", {
        x: 0, y: 2.0, w: '100%',
        fontSize: 18, color: '64748B', fontFace: 'Arial', align: 'center', italic: true
    });

    // Student Name Line
    front.addShape(pptx.ShapeType.line, {
        x: '15%', y: 3.2, w: '70%', h: 0,
        line: { color: 'CBD5E1', width: 1 }
    });
    front.addText("(Nome do Colaborador)", {
        x: 0, y: 3.3, w: '100%',
        fontSize: 12, color: '94A3B8', align: 'center'
    });

    // Course Info
    front.addText("Concluiu com êxito o treinamento de capacitação em:", {
        x: 0, y: 3.8, w: '100%',
        fontSize: 14, color: '475569', align: 'center'
    });

    front.addText(`${data.nr} - ${data.titulo}`, {
        x: '10%', y: 4.2, w: '80%',
        fontSize: 24, bold: true, color: '1E293B', align: 'center'
    });

    front.addText(`Carga Horária Total: ${data.workload || "____"} horas`, {
        x: 0, y: 5.2, w: '100%',
        fontSize: 16, color: '475569', align: 'center'
    });

    // Signatures
    // Instructor
    front.addShape(pptx.ShapeType.line, {
        x: '15%', y: 6.5, w: '30%', h: 0,
        line: { color: '94A3B8', width: 1 }
    });
    front.addText(data.instructorName || "Instrutor Responsável", {
        x: '15%', y: 6.6, w: '30%',
        fontSize: 12, bold: true, align: 'center'
    });
    
    // Student
    front.addShape(pptx.ShapeType.line, {
        x: '55%', y: 6.5, w: '30%', h: 0,
        line: { color: '94A3B8', width: 1 }
    });
    front.addText("Colaborador", {
        x: '55%', y: 6.6, w: '30%',
        fontSize: 12, bold: true, align: 'center'
    });

    // --- SLIDE 2: BACK (CONTENT) ---
    const back = pptx.addSlide();
    
    // Header
    back.addText("Conteúdo Programático", {
        x: 0.5, y: 0.5, w: '50%',
        fontSize: 20, bold: true, color: '1E293B'
    });
    back.addShape(pptx.ShapeType.line, {
        x: 0.5, y: 0.9, w: '90%', h: 0,
        line: { color: 'E2E8F0', width: 2 }
    });

    // Content Columns
    const contentText = data.slides
        .filter(s => s.conteudo && s.conteudo.length > 0)
        .map(s => ({
            text: s.titulo + "\n" + s.conteudo.map(c => "• " + c).join("\n"),
            options: { fontSize: 10, breakLine: true } 
        }));

    // Simple 2-column layout logic (primitive)
    const midPoint = Math.ceil(contentText.length / 2);
    const col1 = contentText.slice(0, midPoint).map(i => i.text).join("\n\n");
    const col2 = contentText.slice(midPoint).map(i => i.text).join("\n\n");

    back.addText(col1, {
        x: 0.5, y: 1.2, w: '45%', h: '80%',
        fontSize: 10, color: '334155', valign: 'top'
    });

    back.addText(col2, {
        x: '50%', y: 1.2, w: '45%', h: '80%',
        fontSize: 10, color: '334155', valign: 'top'
    });

    return pptx.writeFile({ fileName: `Certificado_${data.nr.replace(/\s+/g, '_')}.pptx` });
};