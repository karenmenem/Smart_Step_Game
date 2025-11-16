import React, { useState, useEffect } from 'react';
import { getASLFromQuestion, isASLComplete, getMissingASLResources, loadASLResources } from '../utils/aslTranslator';
import '../styles/ASLPlayer.css';

const ASLPlayer = ({ question }) => {
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  // Load ASL resources when component mounts
  useEffect(() => {
    loadASLResources().then(() => {
      console.log('ASL resources loaded in ASLPlayer');
      setResourcesLoaded(true);
    }).catch(err => {
      console.error('Failed to load ASL resources in ASLPlayer:', err);
      setResourcesLoaded(true); // Still set to true to avoid blocking
    });
  }, []);

  useEffect(() => {
    if (question && resourcesLoaded) {
      const aslSequence = getASLFromQuestion(question);
      console.log('ASL Sequence generated:', aslSequence);
      console.log('First item:', aslSequence[0]);
      setSequence(aslSequence);
      setCurrentIndex(0);
    }
  }, [question, resourcesLoaded]);

  useEffect(() => {
    if (!sequence || sequence.length === 0) return;
    
    const currentSign = sequence[currentIndex];
    
    if (currentSign && !currentSign.resource && currentSign.type !== 'video') {
      const timer = setTimeout(() => {
        if (currentIndex < sequence.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, sequence]);

  if (!sequence || sequence.length === 0) {
    console.log('ASLPlayer: No sequence available', { sequence, question });
    return (
      <div className="asl-player-empty">
        <p>No ASL translation available</p>
      </div>
    );
  }
  
  console.log('ASLPlayer rendering with sequence length:', sequence.length, 'currentIndex:', currentIndex);

  const currentSign = sequence[currentIndex];

  return (
    <div className="asl-player">
      {/* Display Area */}
      <div className="asl-display">
        {(currentSign.type === 'video' || currentSign.type === 'word' || currentSign.type === 'operation') && currentSign.resource ? (
          <video
            key={currentIndex}
            className="asl-video"
            autoPlay={true}
            loop={false}
            muted={false}
            onEnded={() => {
              if (currentIndex < sequence.length - 1) {
                setCurrentIndex(currentIndex + 1);
              } else {
                // Restart from beginning when done
                setCurrentIndex(0);
              }
            }}
          >
            <source src={currentSign.resource} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        ) : currentSign.type === 'image' && currentSign.resource ? (
          <img
            src={currentSign.resource}
            alt={`ASL sign for ${currentSign.display}`}
            className="asl-image"
          />
        ) : currentSign.type === 'number' && currentSign.resource ? (
          <div className="asl-built-in">
            {/* For built-in number signs */}
            <video
              key={currentIndex}
              className="asl-video"
              autoPlay={true}
              loop={false}
              muted={false}
              onEnded={() => {
                if (currentIndex < sequence.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                } else {
                  setCurrentIndex(0);
                }
              }}
            >
              <source src={currentSign.resource} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div className="asl-missing">
            <div className="asl-fingerspell">
              {currentSign.type === 'operation' ? (
                <div style={{ 
                  fontSize: '120px', 
                  fontWeight: 'bold',
                  color: '#43e97b',
                  lineHeight: '1',
                  animation: 'pulse 1.5s infinite'
                }}>
                  {currentSign.display === 'plus' ? '+' : 
                   currentSign.display === 'minus' ? '−' :
                   currentSign.display === 'times' ? '×' :
                   currentSign.display === 'divide' ? '÷' :
                   currentSign.display}
                </div>
              ) : (
                <>
                  <h3>{currentSign.display}</h3>
                  <p className="asl-note">
                    {currentSign.type === 'fingerspell' 
                      ? '(Needs fingerspelling)'
                      : '(ASL video not available)'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Current Sign Label - Always show word */}
        <div className="asl-label">
          <span className="asl-text">{currentSign.display}</span>
        </div>
      </div>
    </div>
  );
};

export default ASLPlayer;
