
const getWordVideoPath = (word) => {
  const cleanWord = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `/asl/words/${cleanWord}.mp4`;
};

const hasWordVideo = (word) => {
  return getWordVideoPath(word);
};

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
    10: '/asl/numbers/10.mp4',
    11: '/asl/numbers/11.mp4',
    12: '/asl/numbers/12.mp4',
    13: '/asl/numbers/13.mp4',
    14: '/asl/numbers/14.mp4',
    15: '/asl/numbers/15.mp4',
    16: '/asl/numbers/16.mp4',
    17: '/asl/numbers/17.mp4',
    18: '/asl/numbers/18.mp4',
    19: '/asl/numbers/19.mp4',
    20: '/asl/numbers/20.mp4',
    21: '/asl/numbers/21.mp4',
    22: '/asl/numbers/22.mp4',
    23: '/asl/numbers/23.mp4',
    24: '/asl/numbers/24.mp4',
    25: '/asl/numbers/25.mp4',
    26: '/asl/numbers/26.mp4',
    27: '/asl/numbers/27.mp4',
    28: '/asl/numbers/28.mp4',
    29: '/asl/numbers/29.mp4',
    30: '/asl/numbers/30.mp4',
    40: '/asl/numbers/40.mp4',
    50: '/asl/numbers/50.mp4',
    60: '/asl/numbers/60.mp4',
    70: '/asl/numbers/70.mp4',
    80: '/asl/numbers/80.mp4',
    90: '/asl/numbers/90.mp4',
    100: '/asl/numbers/100.mp4',
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
  
  words: new Proxy({}, {
    get: function(target, prop) {
      return getWordVideoPath(prop);
    }
  }),
  
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
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  
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
    else {
      sequence.push({
        type: 'fingerspell',
        value: cleanWord,
        resource: null,
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

export const textToASL = (text) => {
  if (/^[\d\s+\-×÷*/=]+$/.test(text)) {
    return mathExpressionToASL(text);
  }
  
  if (/^\d+$/.test(text)) {
    return numberToASL(text);
  }
  
  return sentenceToASL(text);
};

export const getASLFromQuestion = (question) => {
  const sequence = [];
  
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
  
  const aslSigns = question.asl_signs || question.aslSigns;
  const aslType = question.asl_type || question.aslType;
  
  if (aslSigns) {
    try {
      const signs = typeof aslSigns === 'string'
        ? JSON.parse(aslSigns)
        : aslSigns;
      
      if (aslType === 'sentence' && Array.isArray(signs)) {
        const wordSequence = signs.map(word => {
          const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          const resource = ASL_RESOURCES.words[cleanWord] || null;
          return {
            type: 'word',
            value: word,
            resource: resource,
            display: word,
            needsTranslation: !resource
          };
        });
        return wordSequence;
      }
      
      if (signs.words && Array.isArray(signs.words)) {
        return signs.words.map(wordObj => ({
          type: 'word',
          value: wordObj.word,
          resource: wordObj.video,
          display: wordObj.word
        }));
      }
      
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
