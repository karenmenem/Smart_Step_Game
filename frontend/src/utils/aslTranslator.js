let cachedResources = null;
let resourceMap = { words: {}, numbers: {}, operations: {} };

export const loadASLResources = async () => {
  if (cachedResources) {
    return cachedResources;
  }

  try {
    const response = await fetch('http://localhost:5000/api/asl/resources');
    if (response.ok) {
      const resources = await response.json();
      cachedResources = resources;
      resources.forEach(resource => {
        const path = `/asl/${resource.type}s/${resource.filename}`;
        
        // Add main value
        if (resource.type === 'word') {
          resourceMap.words[resource.value] = path;
        } else if (resource.type === 'number') {
          resourceMap.numbers[resource.value] = path;
        } else if (resource.type === 'operation') {
          resourceMap.operations[resource.value] = path;
        }

        // Add aliases
        if (resource.aliases) {
          const aliases = JSON.parse(resource.aliases);
          aliases.forEach(alias => {
            if (resource.type === 'operation') {
              resourceMap.operations[alias] = path;
            }
          });
        }
      });

      return resources;
    }
  } catch (error) {
    console.error('Failed to load ASL resources from API:', error);
  }

  return null;
};

const getWordVideoPath = (word) => {
  if (resourceMap.words[word]) {
    return resourceMap.words[word];
  }
 
  const cleanWord = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `/asl/words/${cleanWord}.mp4`;
};

const getNumberVideoPath = (number) => {
  if (resourceMap.numbers[number]) {
    return resourceMap.numbers[number];
  }
  return `/asl/numbers/${number}.mp4`;
};

const getOperationVideoPath = (operation) => {
  // Try cached resources first
  if (resourceMap.operations[operation]) {
    return resourceMap.operations[operation];
  }
  
  const operationMap = {
    'plus': 'plus.mp4',
    'add': 'plus.mp4',
    '+': 'plus.mp4',
    'minus': 'minus.mp4',
    'subtract': 'subtract.mp4',
    '-': 'minus.mp4'
  };
  const filename = operationMap[operation] || `${operation}.mp4`;
  return `/asl/operations/${filename}`;
};

const hasWordVideo = (word) => {
  return getWordVideoPath(word);
};

export const ASL_RESOURCES = {
  numbers: new Proxy({}, {
    get: function(target, prop) {
      return getNumberVideoPath(prop);
    }
  }),
  
  operations: new Proxy({}, {
    get: function(target, prop) {
      return getOperationVideoPath(prop);
    }
  }),
  
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
      
      // If aslType is sentence and signs array is empty, fall through to auto-generation
      if (aslType === 'sentence' && Array.isArray(signs) && signs.length > 0) {
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
