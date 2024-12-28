import { questions_en } from './questions';
import { questions_tr } from './questions_tr';
import { questions_es } from './questions_es';
import { questions_fr } from './questions_fr';

export const getQuestions = (language = 'en', difficulty, mode, type) => {
  let selectedQuestions;
  
  // Select language questions
  switch (language.toLowerCase()) {
    case 'tr':
      selectedQuestions = questions_tr;
      break;
    case 'es':
      selectedQuestions = questions_es;
      break;
    case 'fr':
      selectedQuestions = questions_fr;
      break;
    default:
      selectedQuestions = questions_en;
  }

  // Safely access nested properties with fallback to English
  try {
    const questions = selectedQuestions?.[difficulty]?.[mode]?.[type] || 
                     questions_en[difficulty][mode][type];
    
    if (!questions || questions.length === 0) {
      return questions_en[difficulty][mode][type];
    }
    
    return questions;
  } catch (error) {
    console.log(`Falling back to English for ${difficulty}, ${mode}, ${type}`);
    return questions_en[difficulty][mode][type];
  }
}; 