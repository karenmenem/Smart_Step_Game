
// Cache for ASL resources loaded from API
let cachedResources = null;
let resourceMap = { words: {}, numbers: {}, operations: {} };

// fetch asl
export const loadASLResources = async () => {
  if (cachedResources) {
    console.log('ASL resources already cached:', Object.keys(resourceMap.words).length, 'words');
    return cachedResources;
  }

  try {
    const response = await fetch('http://localhost:5001/api/asl/resources');
    if (response.ok) {
      const resources = await response.json();
      cachedResources = resources;

      
      resources.forEach(resource => {
        const path = `/asl/${resource.type}s/${resource.filename}`;
        
        // Add main value 
        if (resource.type === 'word') {
          resourceMap.words[resource.value.toLowerCase()] = path;
        } else if (resource.type === 'number') {
          resourceMap.numbers[resource.value.toString()] = path;
        } else if (resource.type === 'operation') {
          resourceMap.operations[resource.value.toLowerCase()] = path;
        }

        // Add aliases
        if (resource.aliases) {
          const aliases = JSON.parse(resource.aliases);
          aliases.forEach(alias => {
            if (resource.type === 'operation') {
              resourceMap.operations[alias.toLowerCase()] = path;
            } else if (resource.type === 'word') {
              resourceMap.words[alias.toLowerCase()] = path;
            }
          });
        }
      });

      console.log('ASL resources loaded:', {
        words: Object.keys(resourceMap.words).length,
        numbers: Object.keys(resourceMap.numbers).length,
        operations: Object.keys(resourceMap.operations).length,
        sampleWords: Object.keys(resourceMap.words).slice(0, 10)
      });

      return resources;
    } else {
      console.error('Failed to load ASL resources: HTTP', response.status);
    }
  } catch (error) {
    console.error('Failed to load ASL resources from API:', error);
  }

  return null;
};

const getWordVideoPath = (word) => {
  // Try cached resources first (case-insensitive)
  const lowerWord = word.toLowerCase();
  if (resourceMap.words[lowerWord]) {
    return resourceMap.words[lowerWord];
  }
  // Fallback to dynamic path
  const cleanWord = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `/asl/words/${cleanWord}.mp4`;
};

const getNumberVideoPath = (number) => {
  // Try cached resources first
  const numStr = number.toString();
  if (resourceMap.numbers[numStr]) {
    return resourceMap.numbers[numStr];
  }
  // Fallback to dynamic path
  return `/asl/numbers/${numStr}.mp4`;
};

const getOperationVideoPath = (operation) => {
  // Try cached resources first (case-insensitive)
  const lowerOp = operation.toLowerCase();
  if (resourceMap.operations[lowerOp]) {
    return resourceMap.operations[lowerOp];
  }
  // Fallback to dynamic path based on common operations
  const operationMap = {
    'plus': 'plus.mp4',
    'add': 'plus.mp4',
    '+': 'plus.mp4',
    'minus': 'minus.mp4',
    'subtract': 'subtract.mp4',
    '-': 'minus.mp4',
    'multiply': 'multiply.mp4',
    'times': 'multiply.mp4',
    '×': 'multiply.mp4',
    '*': 'multiply.mp4',
    'divide': 'divide.mp4',
    'divided': 'divide.mp4',
    '÷': 'divide.mp4',
    '/': 'divide.mp4',
    'equals': 'equals.mp4',
    '=': 'equals.mp4'
  };
  const filename = operationMap[lowerOp] || `${lowerOp}.mp4`;
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
  
  // First, try to use the complete number if we have a video for it
  if (ASL_RESOURCES.numbers[numStr]) {
    return [{
      type: 'number',
      value: numStr,
      resource: ASL_RESOURCES.numbers[numStr],
      display: numStr
    }];
  }
  
  // Otherwise, split into individual digits
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
    
    // Add punctuation sign - check resources first
    if (punctuation) {
      const punct = punctuation[0];
      const punctResource = resourceMap[punct];
      if (punctResource) {
        sequence.push({
          type: 'word',
          value: punct,
          resource: punctResource.filename,
          display: punct
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
  console.log('getASLFromQuestion called with:', question);
  console.log('Question keys:', Object.keys(question));
  console.log('Question text field:', question.question_text);
  console.log('ASL type:', question.asl_type);
  console.log('ASL signs:', question.asl_signs);
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
  
  const aslSigns = question.asl_signs || question.aslSigns; // Gets: '[{"type":"number","value":"2"},{"type":"operation","value":"plus"},{"type":"number","value":"3"}]'

  const aslType = question.asl_type || question.aslType;
  
  if (aslSigns) {
    try {
      const signs = typeof aslSigns === 'string'
        ? JSON.parse(aslSigns)
        : aslSigns;
      
      // If aslType is sentence and signs array is empty, fall through to auto-generation
      if (aslType === 'sentence' && Array.isArray(signs) && signs.length === 0) {
        // Empty array - skip to auto-generation below
      } else if (aslType === 'sentence' && Array.isArray(signs) && signs.length > 0) {
        console.log('Processing sentence ASL signs:', signs);
        const wordSequence = signs.map(word => {
          const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          const resource = resourceMap.words[cleanWord] || ASL_RESOURCES.words[cleanWord] || null;
          console.log(`Looking up word "${word}" -> cleanWord: "${cleanWord}" -> resource:`, resource);
          return {
            type: 'word',
            value: word,
            resource: resource,
            display: word,
            needsTranslation: !resource
          };
        });
        console.log('Word sequence result:', wordSequence);
        return wordSequence;
      } else if (signs.words && Array.isArray(signs.words)) {
        return signs.words.map(wordObj => ({
          type: 'word',
          value: wordObj.word,
          resource: wordObj.video,
          display: wordObj.word
        }));
      } else if (Array.isArray(signs) && signs.length > 0) {
        // Handle new structured format: [{type: 'word', value: 'what'}, {type: 'number', value: '10'}]
        if (typeof signs[0] === 'object' && signs[0].type && signs[0].value) {
          return signs.map(item => {
            if (item.type === 'number') {
              return {
                type: 'number',
                value: item.value,
                resource: ASL_RESOURCES.numbers[item.value],
                display: item.value.toString()
              };
            } else if (item.type === 'operation') {
              return {
                type: 'operation',
                value: item.value,
                resource: ASL_RESOURCES.operations[item.value.toLowerCase()],
                display: item.value
              };
            } else if (item.type === 'word') {
              return {
                type: 'word',
                value: item.value,
                resource: ASL_RESOURCES.words[item.value.toLowerCase()],
                display: item.value,
                needsTranslation: !ASL_RESOURCES.words[item.value.toLowerCase()]
              };
            }
            return null;
          }).filter(item => item !== null);
        }
        
        // Handle old format: ["what", "is", "6", "plus", "2"] - auto-detect types
        return signs.map(sign => {
          const signStr = sign.toString().toLowerCase();
          
          // Check if it's a number
          if (typeof sign === 'number' || /^\d+$/.test(sign)) {
            return {
              type: 'number',
              value: sign,
              resource: ASL_RESOURCES.numbers[sign],
              display: sign.toString()
            };
          }
          // Check if it's an operation (plus, minus, etc.)
          else if (ASL_RESOURCES.operations[signStr]) {
            return {
              type: 'operation',
              value: sign,
              resource: ASL_RESOURCES.operations[signStr],
              display: sign
            };
          }
          // Otherwise treat as a word (what, is, how, many, etc.)
          else {
            return {
              type: 'word',
              value: sign,
              resource: ASL_RESOURCES.words[signStr],
              display: sign,
              needsTranslation: !ASL_RESOURCES.words[signStr]
            };
          }
        });
      }
    } catch (e) {
      console.error('Error parsing asl_signs:', e);
    }
  }
  
  // Fallback: Auto-generate from question text
  if (question.question_text || question.question) {
    const questionText = question.question_text || question.question;
    console.log('Auto-generating ASL from question text:', questionText);
    return textToASL(questionText);
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
