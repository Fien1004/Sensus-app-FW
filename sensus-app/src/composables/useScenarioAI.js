import { pipeline, env } from '@xenova/transformers'
import { detectIntent } from '../utils/detectIntent';
import { intentToNode } from '../utils/intentToNode';
import { withLoader } from './useAppLoader';

env.allowRemoteModels = true
env.allowLocalModels = false
env.useBrowserCache = false
env.remoteHost = 'https://huggingface.co'

let classifier = null;

export function useScenarioAI() {
  async function analyzeResponse(text) {
    return withLoader(async () => {
      // Handle empty or too short input
      if (!text || text.length < 5) {
        return {
          sentiment: 'UNKNOWN',
          confidence: 0,
          intent: 'onduidelijk',
          nextNode: intentToNode['onduidelijk'],
        };
      }

      try {
        // Load classifier only once
        if (!classifier) {
          classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
            device: 'wasm',
            dtype: 'q8',
          });
        }

        const result = await classifier(text);

        const sentiment = result[0].label;
        const confidence = result[0].score;

        // Detect intent based on text, sentiment, and confidence
        const intent = detectIntent(text, sentiment, confidence);

        // Get next node from intent mapping
        const nextNode = intentToNode[intent];

        return {
          sentiment,
          confidence,
          intent,
          nextNode,
        };
      } catch (error) {
        console.error('Error analyzing response:', error);
        return {
          sentiment: 'UNKNOWN',
          confidence: 0,
          intent: 'onduidelijk',
          nextNode: intentToNode['onduidelijk'],
        };
      }
    });
  }

  return {
    analyzeResponse,
  };
}
