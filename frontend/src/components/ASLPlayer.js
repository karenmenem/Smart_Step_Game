import React, { useState, useEffect } from 'react';
import { getASLFromQuestion, isASLComplete, getMissingASLResources } from '../utils/aslTranslator';
import '../styles/ASLPlayer.css';

/**
 * ASL Player Component
 * Displays ASL signs in sequence - supports videos, images, and built-in signs
 */
const ASLPlayer = ({ question }) => {
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (question) {
      console.log('ASLPlayer - Received question:', question);
      const aslSequence = getASLFromQuestion(question);
      console.log('ASLPlayer - Generated sequence LENGTH:', aslSequence.length);
      console.log('ASLPlayer - First 5 items:', aslSequence.slice(0, 5));
      console.log('ASLPlayer - Full sequence:', aslSequence);
      setSequence(aslSequence);
      setCurrentIndex(0);
    }
  }, [question]);

  // Auto-advance for non-video signs (text/fingerspelling)
  useEffect(() => {
    if (!sequence || sequence.length === 0) return;
    
    const currentSign = sequence[currentIndex];
    
    // If current sign doesn't have a video resource, auto-advance after 1.5 seconds
    if (currentSign && !currentSign.resource && currentSign.type !== 'video') {
      const timer = setTimeout(() => {
        if (currentIndex < sequence.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0); // Loop back to start
        }
      }, 1500); // 1.5 seconds per word
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, sequence]);

  // Videos auto-play and advance via onEnded event - no manual controls needed

  if (!sequence || sequence.length === 0) {
    return (
      <div className="asl-player-empty">
        <p>No ASL translation available</p>
      </div>
    );
  }

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
