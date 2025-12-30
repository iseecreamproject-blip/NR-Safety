import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType, BorderStyle, VerticalAlign, HeadingLevel } from "docx";
import { TrainingData } from "../types";

export const exportAttendanceListToDocx = async (data: TrainingData) => {
  // Filter content contentSlides
  const contentSlides = data.slides.filter(s => s.conteudo && s.conteudo.length > 0);

  // Common Border Style
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "000000",
  };
  
  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: "auto",
  };

  // --- HEADER TABLE ---
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          // Logo Cell (Left)
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "LOGO DA EMPRESA", bold: true, size: 20 }),
                ],
              }),
            ],
          }),
          // Title Cell (Right)
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "LISTA DE PRESENÇA DE TREINAMENTO", bold: true, size: 28 }),
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100 },
                children: [
                    new TextRun({ text: "SEGURANÇA E SAÚDE NO TRABALHO - NRs", size: 20 }),
                ]
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // --- INFO TABLE ---
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
            new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [
                    new TextRun({ text: "Treinamento: ", bold: true }),
                    new TextRun({ text: `${data.nr} - ${data.titulo}` })
                ]})],
            }),
            new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [
                    new TextRun({ text: "Carga Horária: ", bold: true }),
                    new TextRun({ text: data.workload ? `${data.workload}h` : "___h" })
                ]})],
            }),
        ]
      }),
      new TableRow({
        children: [
            new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [
                    new TextRun({ text: "Instrutor: ", bold: true }),
                    new TextRun({ text: data.instructorName || "__________________________" })
                ]})],
            }),
            new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [
                    new TextRun({ text: "Data: ", bold: true }),
                    new TextRun({ text: "___/___/______" })
                ]})],
            }),
        ]
      })
    ]
  });

  // --- PROGRAMMATIC CONTENT SECTION ---
  // We'll put this in a table cell to frame it like the HTML
  const contentBullets = contentSlides.map(slide => 
    new Paragraph({
        text: `• ${slide.titulo}`,
        spacing: { after: 50 },
        bullet: { level: 0 }
    })
  );

  const contentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
        new TableRow({
            children: [
                new TableCell({
                    shading: { fill: "F8F9FA" },
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: "CONTEÚDO PROGRAMÁTICO:", bold: true, size: 18 })],
                            spacing: { after: 100 }
                        }),
                        ...contentBullets
                    ]
                })
            ]
        })
    ]
  });

  // --- ATTENDANCE GRID ---
  // Header Row
  const gridHeader = new TableRow({
    tableHeader: true,
    children: [
        new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, shading: { fill: "E9ECEF" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "#", bold: true })] })] }),
        new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, shading: { fill: "E9ECEF" }, children: [new Paragraph({ children: [new TextRun({ text: "Nome Completo", bold: true })] })] }),
        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "E9ECEF" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CPF/ID", bold: true })] })] }),
        new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "E9ECEF" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Assinatura", bold: true })] })] }),
    ]
  });

  // Empty Rows (30 rows)
  const gridRows = Array(30).fill(null).map((_, i) => 
    new TableRow({
        height: { value: 400, rule: "atLeast" }, // Min height for ease of writing
        children: [
            new TableCell({ verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, text: (i + 1).toString() })] }),
            new TableCell({ children: [new Paragraph({})] }),
            new TableCell({ children: [new Paragraph({})] }),
            new TableCell({ children: [new Paragraph({})] }),
        ]
    })
  );

  const attendanceTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [gridHeader, ...gridRows]
  });


  // --- FOOTER SECTION ---
  const disclaimer = new Paragraph({
    text: '"Declaro que recebi o treinamento de segurança descrito acima, compreendendo os riscos e as medidas de prevenção necessárias."',
    italics: true,
    size: 16,
    spacing: { before: 400, after: 400 }
  });

  const signatureLine = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
        new TextRun({ text: "__________________________________________" }),
        new TextRun({ text: "\nAssinatura do Instrutor Responsável", bold: true, break: 1 })
    ]
  });

  // --- ASSEMBLE DOCUMENT ---
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          headerTable,
          new Paragraph({ text: "" }), // Spacer
          infoTable,
          new Paragraph({ text: "" }), // Spacer
          contentTable,
          new Paragraph({ text: "" }), // Spacer
          attendanceTable,
          disclaimer,
          signatureLine
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Lista_Presenca_${data.nr.replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};