'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PriceTagAnalysisOutputSchema = z.object({
  productName: z.string().describe('O nome ou descrição do produto impresso na etiqueta, ex: "PRODUTO X - 400G".'),
  retailPrice: z.number().nullable().describe('O preço de varejo (preço normal), ex: 4.89.'),
  wholesalePrice: z.number().nullable().describe('O preço de atacado, ex: 4.69.'),
  wholesaleMinQuantity: z.number().nullable().describe('A quantidade mínima de unidades para ativar o preço de atacado, ex: 6.'),
  specialPrice: z.number().nullable().describe('O preço especial (ex: preço com cartão de crédito da loja, clube de benefícios, etc), ex: 4.50.'),
  specialPriceLabel: z.string().nullable().describe('O nome/descrição da condição do preço especial, ex: "Cartão Crediffato" ou "Clube".'),
});

export type PriceTagAnalysisOutput = z.infer<typeof PriceTagAnalysisOutputSchema>;

export async function analyzePriceTag(imageBase64: string): Promise<PriceTagAnalysisOutput> {
  const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/jpeg';
  const base64Data = match ? match[2] : imageBase64;

  const response = await ai.generate({
    prompt: `Você é um leitor especialista de etiquetas de preço de supermercado brasileiro. 
    Analise a imagem da etiqueta fornecida e extraia o nome do produto e todos os preços disponíveis em formato numérico (ex: 4.50 em vez de "4,50" ou "R$ 4,50").
    Atente-se aos diferentes tipos de preço:
    - Preço de Varejo (normal/único)
    - Preço de Atacado e a quantidade mínima necessária
    - Preço Especial / de Cartão da Loja / de Clube e o nome correspondente.
    Se algum campo não estiver presente ou visível na etiqueta, defina-o como null.`,
    parts: [
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ],
    output: {
      schema: PriceTagAnalysisOutputSchema,
    },
  });

  if (!response.output) {
    throw new Error('Não foi possível analisar a etiqueta de preço.');
  }

  return response.output;
}
