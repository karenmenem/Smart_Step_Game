import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../api/auth";

function MathQuiz() {
  const navigate = useNavigate();
  const { operation, level, sublevel } = useParams();
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const userData = auth.getCurrentUser();
      setUser(userData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ASL number signs with animated descriptions
  const aslNumbers = {
    1: { name: "ONE", description: "Index finger extended" },
    2: { name: "TWO", description: "Peace sign" },
    3: { name: "THREE", description: "Thumb, index, middle" },
    4: { name: "FOUR", description: "Four fingers up" },
    5: { name: "FIVE", description: "Open hand" },
    6: { name: "SIX", description: "Pinky and thumb" }
  };

  // Level 1 Addition Questions (Beginner - numbers 1-10)
  const questions = [
    {
      question: "What is 2 + 3?",
      aslSigns: [2, 3],
      options: ["4", "5", "6", "7"],
      correct: "5"
    },
    {
      question: "What is 1 + 4?",
      aslSigns: [1, 4],
      options: ["3", "4", "5", "6"],
      correct: "5"
    },
    {
      question: "What is 3 + 2?",
      aslSigns: [3, 2],
      options: ["4", "5", "6", "7"],
      correct: "5"
    },
    {
      question: "What is 4 + 1?",
      aslSigns: [4, 1],
      options: ["3", "4", "5", "6"],
      correct: "5"
    },
    {
      question: "What is 2 + 2?",
      aslSigns: [2, 2],
      options: ["3", "4", "5", "6"],
      correct: "4"
    },
    {
      question: "What is 3 + 3?",
      aslSigns: [3, 3],
      options: ["5", "6", "7", "8"],
      correct: "6"
    },
    {
      question: "What is 1 + 6?",
      aslSigns: [1, 6],
      options: ["6", "7", "8", "9"],
      correct: "7"
    },
    {
      question: "What is 5 + 2?",
      aslSigns: [5, 2],
      options: ["6", "7", "8", "9"],
      correct: "7"
    },
    {
      question: "What is 4 + 3?",
      aslSigns: [4, 3],
      options: ["6", "7", "8", "9"],
      correct: "7"
    },
    {
      question: "What is 2 + 6?",
      aslSigns: [2, 6],
      options: ["7", "8", "9", "10"],
      correct: "8"
    }
  ];

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !quizComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, showResult, quizComplete]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer("");
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
      } else {
        setQuizComplete(true);
      }
    }, 2000);
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
    setQuizComplete(false);
    setTimeLeft(30);
  };

  const goToLevels = () => {
    navigate(`/math/${operation}`);
  };

  const speakQuestion = () => {
    if (!audioEnabled) return;
    
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsPlaying(true);
      
      const utterance = new SpeechSynthesisUtterance(questions[currentQuestion].question);
      utterance.rate = 0.8; // Slightly slower for kids
      utterance.pitch = 1.2; // Higher pitch for friendly voice
      utterance.volume = 1.0;
      
      // Use a child-friendly voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('child') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('susan')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        console.log('Speech synthesis error');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in your browser');
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Auto-play question when component mounts or question changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showResult && !quizComplete && audioEnabled) {
        speakQuestion();
      }
    }, 500); // Small delay to ensure component is ready

    return () => clearTimeout(timer);
  }, [currentQuestion, showResult, quizComplete, audioEnabled]);

  if (!user) {
    return <div>Loading...</div>;
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="quiz-layout">
        <header className="quiz-header">
          <div className="quiz-header-content">
            <div className="quiz-logo">
              <h1>Smart<span className="logo-accent">Step</span></h1>
            </div>
            
            <nav className="quiz-nav">
              <button className="quiz-nav-btn" onClick={goToLevels}>
                ← Back to Levels
              </button>
              <button className="quiz-nav-btn" onClick={() => navigate("/")}>
                🏠 Home
              </button>
              {user && (
                <button className="quiz-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              )}
            </nav>
          </div>
        </header>

        <main className="quiz-results">
          <div className="results-card">
            <div className="results-icon">
              {passed ? "🎉" : "💪"}
            </div>
            <h2 className="results-title">
              {passed ? "Congratulations!" : "Keep Trying!"}
            </h2>
            <div className="results-score">
              <div className="score-circle">
                <span className="score-percentage">{percentage}%</span>
                <span className="score-fraction">{score}/{questions.length}</span>
              </div>
            </div>
            <p className="results-message">
              {passed 
                ? "Great job! You've mastered Level 1 Addition!" 
                : "You're getting better! Try again to unlock the next level."}
            </p>
            
            <div className="results-buttons">
              <button className="quiz-btn secondary-btn" onClick={restartQuiz}>
                🔄 Try Again
              </button>
              {passed && (
                <button className="quiz-btn primary-btn" onClick={goToLevels}>
                  🚀 Next Level
                </button>
              )}
              <button className="quiz-btn tertiary-btn" onClick={goToLevels}>
                📚 Back to Levels
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="quiz-layout">
      <header className="quiz-header">
        <div className="quiz-header-content">
          <div className="quiz-logo">
            <h1>Smart<span className="logo-accent">Step</span></h1>
          </div>
          
          <nav className="quiz-nav">
            <button className="quiz-nav-btn" onClick={goToLevels}>
              ← Back to Levels
            </button>
            <button className="quiz-nav-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
            {user && (
              <button className="quiz-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="quiz-main">
        <div className="quiz-progress">
          <div className="progress-info">
            <span className="progress-text">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="timer">⏰ {timeLeft}s</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="question-container">
          {!showResult ? (
            <>
              <div className="question-header">
                <h2 className="question-title">🌱 Beginner Level 1</h2>
                <div className="question-operation">➕ Addition</div>
              </div>
              
              <div className="question-card">
                <div className="question-text-container">
                  <h3 className="question-text">
                    {questions[currentQuestion].question}
                    <span className="inline-asl">
                      <span className="asl-hand" data-number={questions[currentQuestion].aslSigns[0]}>
                        <span className="hand-shape"></span>
                      </span>
                      <span className="plus-sign">+</span>
                      <span className="asl-hand" data-number={questions[currentQuestion].aslSigns[1]}>
                        <span className="hand-shape"></span>
                      </span>
                    </span>
                  </h3>
                  <button 
                    className={`speaker-btn ${isPlaying ? 'playing' : ''} ${!audioEnabled ? 'audio-off' : 'audio-on'}`}
                    onClick={audioEnabled ? speakQuestion : toggleAudio}
                    onContextMenu={(e) => { e.preventDefault(); toggleAudio(); }}
                    disabled={isPlaying}
                    title={audioEnabled ? "🔈 Click to hear the question | Right-click to disable audio" : "🔇 Audio is off - click to enable"}
                  >
                    {!audioEnabled ? '🔇' : (isPlaying ? '🔊' : '🔈')}
                  </button>
                </div>
                
                <div className="options-grid">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-text">{option}</span>
                    </button>
                  ))}
                </div>
                
                <button 
                  className="submit-btn"
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                >
                  {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </button>
              </div>
            </>
          ) : (
            <div className="result-card">
              <div className="result-icon">
                {selectedAnswer === questions[currentQuestion].correct ? "✅" : "❌"}
              </div>
              <h3 className="result-title">
                {selectedAnswer === questions[currentQuestion].correct ? "Correct!" : "Incorrect"}
              </h3>
              <p className="result-message">
                {selectedAnswer === questions[currentQuestion].correct 
                  ? "Great job! You got it right!" 
                  : `The correct answer is ${questions[currentQuestion].correct}`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MathQuiz;