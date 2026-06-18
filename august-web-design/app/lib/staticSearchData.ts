'use client';

export interface StaticSearchData {
  hits: Array<{
    id: number;
    name: string;
    slug: string;
    type: string;
  }>;
  estimatedTotalHits: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
}

export const staticSearchData: Record<string, StaticSearchData> = {
  en: {
    hits: [
      { id: 1, name: "Paracetamol", slug: "paracetamol", type: "Medication" },
      { id: 2, name: "Ibuprofen", slug: "ibuprofen", type: "Medication" },
      { id: 3, name: "Common Cold", slug: "common-cold", type: "Condition" },
      { id: 4, name: "Flu", slug: "flu", type: "Condition" },
      { id: 5, name: "Blood Test", slug: "blood-test", type: "Test" },
      { id: 6, name: "X-Ray", slug: "x-ray", type: "Test" },
      { id: 7, name: "Headache", slug: "headache", type: "Symptom" },
      { id: 8, name: "Fever", slug: "fever", type: "Symptom" }
    ],
    estimatedTotalHits: 8,
    limit: 20,
    offset: 0,
    processingTimeMs: 0
  },
  es: {
    hits: [
      { id: 1, name: "Paracetamol", slug: "paracetamol", type: "Medicamento" },
      { id: 2, name: "Ibuprofeno", slug: "ibuprofen", type: "Medicamento" },
      { id: 3, name: "Resfriado Común", slug: "common-cold", type: "Condición" },
      { id: 4, name: "Gripe", slug: "flu", type: "Condición" },
      { id: 5, name: "Análisis de Sangre", slug: "blood-test", type: "Prueba" },
      { id: 6, name: "Radiografía", slug: "x-ray", type: "Prueba" },
      { id: 7, name: "Dolor de Cabeza", slug: "headache", type: "Síntoma" },
      { id: 8, name: "Fiebre", slug: "fever", type: "Síntoma" }
    ],
    estimatedTotalHits: 8,
    limit: 20,
    offset: 0,
    processingTimeMs: 0
  }, 
  fr: {
    hits: [
      { id: 1, name: "Paracetamol", slug: "paracetamol", type: "Médicament" },
      { id: 2, name: "Ibuprofen", slug: "ibuprofen", type: "Médicament" },
      { id: 3, name: "Grippe", slug: "grippe", type: "Maladie" },
      { id: 4, name: "Fievre", slug: "fievre", type: "Symptôme" },
      { id: 5, name: "Test sanguin", slug: "test-sanguin", type: "Test" },
      { id: 6, name: "Radiographie", slug: "radiographie", type: "Test" },
      { id: 7, name: "Douleur de tête", slug: "douleur-de-tete", type: "Symptôme" },
      { id: 8, name: "Fièvre", slug: "fievre", type: "Symptôme" }
    ],
    estimatedTotalHits: 8,
    limit: 20,
    offset: 0,
    processingTimeMs: 0
  }
};
