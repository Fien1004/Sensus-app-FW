const DOUBT_KEYWORDS = [
    'weet het zo niet',
    'weet het zo niet goed',
    'niet goed',
    'ik weet het zo niet',
    'ik weet het zo niet goed'];
const DENIAL_KEYWORDS = ['valt wel mee', 'geen probleem', 'iedereen doet dit', 'zo erg is het niet', 'valt eigenlijk wel mee', 'is geen issue'];
const MOTIVATION_KEYWORDS = ['wil veranderen', 'beter doen', 'volgende keer', 'ik wil stoppen', 'ik ga het proberen', 'ik wil eraan werken'];
const EMOTIONAL_KEYWORDS = ['verdrietig', 'boos', 'gestrest', 'gespannen', 'overweldigd', 'teleurgesteld', 'machteloos', 'bang', 'angstig', 'frustratie'];

export function detectIntent(text, sentiment, confidence) {
  // Onduidelijk: input too short
  if (text.length < 5) {
    return 'onduidelijk';
  }

  const lowerText = text.toLowerCase();

  // Twijfel: check keywords
  if (DOUBT_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return 'twijfel';
  }

  // Ontkenning: check keywords
  if (DENIAL_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return 'ontkenning';
  }

  // Motivatie: check keywords
  if (MOTIVATION_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return 'motivatie';
  }

  // Emotioneel: keyword match or negative sentiment with high confidence
  if (EMOTIONAL_KEYWORDS.some(keyword => lowerText.includes(keyword)) || (sentiment === 'NEGATIVE' && confidence > 0.7)) {
    return 'emotioneel';
  }

  // Onduidelijk: no match found
  return 'onduidelijk';
}
