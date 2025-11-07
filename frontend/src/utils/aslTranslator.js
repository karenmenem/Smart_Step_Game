
export const ASL_RESOURCES = {
  
  numbers: {
    0: '/asl/numbers/0.mp4',
    1: '/asl/numbers/1.mp4',
    2: '/asl/numbers/2.mp4',
    3: '/asl/numbers/3.mp4',
    4: '/asl/numbers/4.mp4',
    5: '/asl/numbers/5.mp4',
    6: '/asl/numbers/6.mp4',
    7: '/asl/numbers/7.mp4',
    8: '/asl/numbers/8.mp4',
    9: '/asl/numbers/9.mp4',
  },
  
  
  operations: {
    'plus': '/asl/operations/plus.mp4',
    'add': '/asl/operations/plus.mp4',
    '+': '/asl/operations/plus.mp4',
    'minus': '/asl/operations/minus.mp4',
    'subtract': '/asl/operations/minus.mp4',
    '-': '/asl/operations/minus.mp4',
    'times': '/asl/operations/times.mp4',
    'multiply': '/asl/operations/times.mp4',
    '×': '/asl/operations/times.mp4',
    '*': '/asl/operations/times.mp4',
    'divide': '/asl/operations/divide.mp4',
    '÷': '/asl/operations/divide.mp4',
    '/': '/asl/operations/divide.mp4',
    'equals': '/asl/operations/equals.mp4',
    '=': '/asl/operations/equals.mp4',
  },
  
  
  words: {
    
    'what': '/asl/words/what.mp4',
    'who': '/asl/words/who.mp4',
    'where': '/asl/words/where.mp4',
    'when': '/asl/words/when.mp4',
    'why': '/asl/words/why.mp4',
    'how': '/asl/words/how.mp4',
    
    
    'is': '/asl/words/is.mp4',
    'are': '/asl/words/are.mp4',
    'was': '/asl/words/was.mp4',
    'were': '/asl/words/were.mp4',
    'have': '/asl/words/have.mp4',
    'has': '/asl/words/has.mp4',
    'go': '/asl/words/go.mp4',
    'run': '/asl/words/run.mp4',
    'jump': '/asl/words/jump.mp4',
    'play': '/asl/words/play.mp4',
    'read': '/asl/words/read.mp4',
    'write': '/asl/words/write.mp4',
    
    
    'i': '/asl/words/i.mp4',
    'you': '/asl/words/you.mp4',
    'he': '/asl/words/he.mp4',
    'she': '/asl/words/she.mp4',
    'we': '/asl/words/we.mp4',
    'they': '/asl/words/they.mp4',
    
    
    'cat': '/asl/words/cat.mp4',
    'dog': '/asl/words/dog.mp4',
    'house': '/asl/words/house.mp4',
    'school': '/asl/words/school.mp4',
    'book': '/asl/words/book.mp4',
    'apple': '/asl/words/apple.mp4',
    'water': '/asl/words/water.mp4',
    
    // Add more as needed
  },
  
  // Punctuation/special
  special: {
    'question': '/asl/special/question.mp4',
    'exclamation': '/asl/special/exclamation.mp4',
    'period': '/asl/special/period.mp4',
  }
};


export const numberToASL = (number) => {
  const numStr = number.toString();
  return numStr.split('').map(digit => ({
    type: 'number',
    value: digit,
    resource: ASL_RESOURCES.numbers[digit] || null,
    display: digit
  }));
};


export const mathExpressionToASL = (expression) => {
  const sequence = [];
  const tokens = expression.match(/\d+|[+\-×÷*/=]|\w+/g) || [];
  
  tokens.forEach(token => {
    if (/^\d+$/.test(token)) {
      
      sequence.push(...numberToASL(token));
    } else if (ASL_RESOURCES.operations[token.toLowerCase()]) {
      
      sequence.push({
        type: 'operation',
        value: token,
        resource: ASL_RESOURCES.operations[token.toLowerCase()],
        display: token
      });
    }
  });
  
  return sequence;
};


export const sentenceToASL = (sentence) => {
  const sequence = [];
  
  
  const cleaned = sentence.toLowerCase().replace(/[^\w\s?!.]/g, '');
  const words = cleaned.split(/\s+/);
  
  words.forEach(word => {
    
    const punctuation = word.match(/[?!.]$/);
    const cleanWord = word.replace(/[?!.]$/, '');
    
   
    if (/^\d+$/.test(cleanWord)) {
      sequence.push(...numberToASL(cleanWord));
    }
    
    else if (ASL_RESOURCES.words[cleanWord]) {
      sequence.push({
        type: 'word',
        value: cleanWord,
        resource: ASL_RESOURCES.words[cleanWord],
        display: cleanWord
      });
    }
    // Word not in dictionary - needs fingerspelling or custom video
    else {
      sequence.push({
        type: 'fingerspell',
        value: cleanWord,
        resource: null, // Will need to fingerspell letter by letter
        display: cleanWord,
        needsTranslation: true
      });
    }
    
    // Add punctuation sign
    if (punctuation) {
      const punct = punctuation[0];
      if (punct === '?') {
        sequence.push({
          type: 'special',
          value: 'question',
          resource: ASL_RESOURCES.special.question,
          display: '?'
        });
      }
    }
  });
  
  return sequence;
};

/**
 * Convert any text (auto-detect type) into ASL sequence
 */
export const textToASL = (text) => {
  // Check if it's a math expression
  if (/^[\d\s+\-×÷*/=]+$/.test(text)) {
    return mathExpressionToASL(text);
  }
  
  // Check if it's just a number
  if (/^\d+$/.test(text)) {
    return numberToASL(text);
  }
  
  // Otherwise treat as sentence
  return sentenceToASL(text);
};

/**
 * Get ASL sequence from database format
 * Handles different storage formats:
 * - asl_signs: JSON array of numbers [2, 3, 5]
 * - asl_video_url: JSON array of video URLs
 * - asl_image_url: JSON array of image URLs
 */
export const getASLFromQuestion = (question) => {
  const sequence = [];
  
  // Priority 1: Custom video URLs (handle both snake_case and camelCase)
  const videoUrl = question.asl_video_url || question.aslVideoUrl;
  if (videoUrl) {
    try {
      const urls = typeof videoUrl === 'string' 
        ? JSON.parse(videoUrl)
        : videoUrl;
      
      return urls.map((url, index) => ({
        type: 'video',
        resource: url,
        display: `Video ${index + 1}`
      }));
    } catch (e) {
      console.error('Error parsing asl_video_url:', e);
    }
  }
  
  // Priority 2: Custom image URLs (handle both snake_case and camelCase)
  const imageUrl = question.asl_image_url || question.aslImageUrl;
  if (imageUrl) {
    try {
      const urls = typeof imageUrl === 'string'
        ? JSON.parse(imageUrl)
        : imageUrl;
      
      return urls.map((url, index) => ({
        type: 'image',
        resource: url,
        display: `Image ${index + 1}`
      }));
    } catch (e) {
      console.error('Error parsing asl_image_url:', e);
    }
  }
  
  // Priority 3: ASL signs array (numbers or sentence words) - handle both snake_case and camelCase
  const aslSigns = question.asl_signs || question.aslSigns;
  if (aslSigns) {
    try {
      const signs = typeof aslSigns === 'string'
        ? JSON.parse(aslSigns)
        : aslSigns;
      
      // Check if it's sentence format with words array
      if (signs.words && Array.isArray(signs.words)) {
        return signs.words.map(wordObj => ({
          type: 'word',
          value: wordObj.word,
          resource: wordObj.video,
          display: wordObj.word
        }));
      }
      
      // Legacy format: array of numbers/operations
      return signs.map(sign => {
        if (typeof sign === 'number' || /^\d+$/.test(sign)) {
          return {
            type: 'number',
            value: sign,
            resource: ASL_RESOURCES.numbers[sign],
            display: sign.toString()
          };
        } else {
          return {
            type: 'operation',
            value: sign,
            resource: ASL_RESOURCES.operations[sign.toLowerCase()],
            display: sign
          };
        }
      });
    } catch (e) {
      console.error('Error parsing asl_signs:', e);
    }
  }
  
  // Fallback: Auto-generate from question text
  if (question.question_text) {
    return textToASL(question.question_text);
  }
  
  return sequence;
};

/**
 * Check if ASL translation is complete (no missing resources)
 */
export const isASLComplete = (sequence) => {
  return sequence.every(item => 
    item.resource !== null && !item.needsTranslation
  );
};

/**
 * Get missing ASL resources for a sequence
 */
export const getMissingASLResources = (sequence) => {
  return sequence
    .filter(item => item.resource === null || item.needsTranslation)
    .map(item => ({
      word: item.value,
      type: item.type,
      display: item.display
    }));
};

export default {
  ASL_RESOURCES,
  numberToASL,
  mathExpressionToASL,
  sentenceToASL,
  textToASL,
  getASLFromQuestion,
  isASLComplete,
  getMissingASLResources
};
