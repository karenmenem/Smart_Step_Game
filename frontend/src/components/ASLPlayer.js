import React, { useState, useEffect } from 'react';
import { getASLFromQuestion, isASLComplete, getMissingASLResources } from '../utils/aslTranslator';
import '../styles/ASLPlayer.css';

/**
 * ASL Player Component
 * Displays ASL signs in sequence - supports videos, images, and built-in signs
 */
const ASLPlayer = ({ question, autoPlay = false, showControls = true }) => {
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.5); // seconds per sign

  useEffect(() => {
    if (question) {
      const aslSequence = getASLFromQuestion(question);
      setSequence(aslSequence);
      setCurrentIndex(0);
      
      if (autoPlay && aslSequence.length > 0) {
        setIsPlaying(true);
      }
    }
  }, [question, autoPlay]);

  useEffect(() => {
    if (isPlaying && sequence.length > 0) {
      const timer = setTimeout(() => {
        if (currentIndex < sequence.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsPlaying(false);
          setCurrentIndex(0);
        }
      }, playbackSpeed * 1000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentIndex, sequence, playbackSpeed]);

  const handlePlay = () => {
    if (currentIndex === sequence.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentIndex < sequence.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!sequence || sequence.length === 0) {
    return (
      <div className="asl-player-empty">
        <p>No ASL translation available</p>
      </div>
    );
  }

  const currentSign = sequence[currentIndex];
  const complete = isASLComplete(sequence);
  const missing = getMissingASLResources(sequence);

  return (
    <div className="asl-player">
      {/* Display Area */}
      <div className="asl-display">
        {currentSign.type === 'video' && currentSign.resource ? (
          <video
            key={currentIndex}
            className="asl-video"
            autoPlay={isPlaying}
            loop={!isPlaying}
            muted={false}
            onEnded={() => {
              if (isPlaying && currentIndex < sequence.length - 1) {
                setCurrentIndex(currentIndex + 1);
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
        ) : currentSign.resource ? (
          <div className="asl-built-in">
            {/* For built-in number/word signs */}
            <video
              key={currentIndex}
              className="asl-video"
              autoPlay={isPlaying}
              loop={!isPlaying}
              muted={false}
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

        {/* Current Sign Label */}
        <div className="asl-label">
          <span className="asl-text">{currentSign.display}</span>
          <span className="asl-type">({currentSign.type})</span>
        </div>
      </div>

      {/* Sequence Progress */}
      <div className="asl-sequence">
        {sequence.map((sign, index) => (
          <div
            key={index}
            className={`asl-sequence-item ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
            onClick={() => setCurrentIndex(index)}
          >
            {sign.display}
          </div>
        ))}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="asl-controls">
          <button 
            className="asl-control-btn"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ⏮️ Previous
          </button>
          
          {isPlaying ? (
            <button className="asl-control-btn primary" onClick={handlePause}>
              ⏸️ Pause
            </button>
          ) : (
            <button className="asl-control-btn primary" onClick={handlePlay}>
              ▶️ Play
            </button>
          )}
          
          <button className="asl-control-btn" onClick={handleRestart}>
            🔄 Restart
          </button>
          
          <button 
            className="asl-control-btn"
            onClick={handleNext}
            disabled={currentIndex === sequence.length - 1}
          >
            Next ⏭️
          </button>
        </div>
      )}



      {/* Missing Resources Warning */}
      {!complete && missing.length > 0 && (
        <div className="asl-warning">
          <p>⚠️ Missing ASL resources for: {missing.map(m => m.word).join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default ASLPlayer;
