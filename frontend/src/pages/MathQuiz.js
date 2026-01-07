import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, api } from "../api/auth";
import ASLPlayer from "../components/ASLPlayer";
import { loadASLResources } from "../utils/aslTranslator";


const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function MathQuiz() {
  const navigate = useNavigate();
  const { operation, level, sublevel } = useParams();
  
 
  const getTimerDuration = () => {
    if (level === 'beginner') return 30;      
    if (level === 'intermediate') return 60;  
    if (level === 'advanced') return 90;      
    return 30; 
  };
  
  
  const getOperationDisplay = () => {
    const operationMap = {
      'addition': '➕ Addition',
      'subtraction': '➖ Subtraction',
      'multiplication': '✖️ Multiplication',
      'division': '➗ Division'
    };
    return operationMap[operation] || '➕ Addition';
  };
  
 
  const getLevelDisplay = () => {
    const levelMap = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    return `🌱 ${levelMap[level] || 'Beginner'} Level ${sublevel || '1'}`;
  };
  
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimerDuration());
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityInfo, setActivityInfo] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const userData = auth.getCurrentUser();
      const currentChild = auth.getCurrentChild();
      setUser({ ...userData, child: currentChild });
      
      // asl men l backend
      loadASLResources().then(() => {
        console.log('ASL resources loaded for MathQuiz');
      }).catch(err => {
        console.error('Failed to load ASL resources:', err);
      });
      
      // get ques from db
      loadQuizData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      
      // Map operation, level, and sublevel to activity IDs
      let activityId = 7; // beginner 1
      
      if (operation === 'addition') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 8 : 7; 
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 11 : 10; 
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 14 : 13; 
        }
      } else if (operation === 'subtraction') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 17 : 16; 
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 20 : 19; 
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 23 : 22; 
        }
      } else if (operation === 'multiplication') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 26 : 25; 
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 29 : 28; 
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 32 : 31; 
        }
      } else if (operation === 'division') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 35 : 34; 
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 38 : 37; 
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 41 : 40; 
        }
      }
      
      
      if (user?.child?.id) {
        const accessCheck = await api.checkLevelAccess(user.child.id, activityId);
        if (accessCheck.success && !accessCheck.allowed) {
          alert(accessCheck.reason || 'You need to complete the previous level first with 80% or higher!');
          navigate(`/math/${operation}`);
          return;
        }
      }
      
      const [questionsResponse, activityResponse] = await Promise.all([
        api.getQuestions(activityId),
        api.getActivity(activityId)
      ]);
      
      console.log('Activity ID:', activityId);
      console.log('Questions Response:', questionsResponse);
      
      if (questionsResponse.success && questionsResponse.data.length > 0) {
        const shuffledQuestions = shuffleArray(questionsResponse.data).map(q => ({
          ...q,
          options: q.options ? shuffleArray([...q.options]) : q.options
        }));
        setQuestions(shuffledQuestions);
      } else {
        console.error('Failed to load questions from database');
        alert('Unable to load quiz questions. Please try again later.');
        navigate(`/math/${operation}`);
        return;
      }
      
      if (activityResponse.success) {
        setActivityInfo(activityResponse.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading quiz data:', error);
      alert('An error occurred while loading the quiz. Please try again.');
      navigate(`/math/${operation}`);
      setLoading(false);
    }
  };

  // timer countdown
  useEffect(() => {
    if (!questions || questions.length === 0) return;
    
    if (timeLeft > 0 && !showResult && !quizComplete && !timerPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timeLeft, showResult, quizComplete, questions, timerPaused]);

  // keyboard support for arduino
  useEffect(() => { // runs when dependancies change
    if (!questions || questions.length === 0 || quizComplete) return;

    const handleKeyPress = (e) => {
      const key = e.key.toUpperCase();
      const currentOptions = questions[currentQuestion]?.options || [];
      
      // enter key triggers continue...
      if (e.key === 'Enter' && showResult && !quizComplete) {
        e.preventDefault();
        console.log('⏎ Enter pressed → Moving to next question');
        handleNextQuestion();
        return;
      }
      
      
      const keyMap = { 'A': 3, 'B': 1, 'C': 2, 'D': 0 };
      
      if (keyMap.hasOwnProperty(key) && currentOptions[keyMap[key]] && !showResult) {
        const selectedOption = currentOptions[keyMap[key]];
        console.log(`🎮 Arduino Button ${key} pressed → Selecting: ${selectedOption}`);
        handleAnswerSelect(selectedOption);
        // auto submit after pressing 
        setTimeout(() => {
          handleNextQuestion(selectedOption);
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [questions, currentQuestion, showResult, quizComplete]);

  
  const generateHints = (question) => {
    const text = question.question || question.text || "";
    const isWordProblem = text.length > 50;
    
    if (isWordProblem) {
      
      return [
        "💡 Read the problem carefully and identify the numbers.",
        "💡 What operation do you need? Look for keywords like 'total', 'altogether', 'in all'.",
        "💡 Write down the numbers and add them step by step. Start with the first two numbers."
      ];
    } else {
     
      const numbers = text.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        const num1 = parseInt(numbers[0]);
        const num2 = parseInt(numbers[1]);
        return [
          "💡 Break the problem into smaller parts.",
          `💡 Start with ${num1}. Now add ${num2} to it. You can count up!`,
          `💡 Think: ${num1} + ${num2} = ? Try adding the ones place first, then the tens.`
        ];
      }
      return [
        "💡 Take your time and read the question again.",
        "💡 Try counting on your fingers or using objects to help.",
        "💡 Look at the answer choices - which one makes sense?"
      ];
    }
  };

  const handleHelpClick = () => {
    setShowHintModal(true);
    setTimerPaused(true);
    setCurrentHintLevel(0);
  };

  const handleNextHint = () => {
    if (currentHintLevel < 2) {
      setCurrentHintLevel(currentHintLevel + 1);
    }
  };

  const handleCloseHint = () => {
    setShowHintModal(false);
    setTimerPaused(false);
    setCurrentHintLevel(0);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = (answerOverride = null) => {
    if (!questions || questions.length === 0 || !questions[currentQuestion]) {
      console.error('No question available at current index');
      return;
    }
    
    // Prevent duplicate calls
    if (showResult) {
      console.log('⚠️ Already showing result, ignoring duplicate call');
      return;
    }
    
    const actualAnswer = answerOverride !== null ? answerOverride : selectedAnswer;
    const isCorrect = actualAnswer === questions[currentQuestion].correct;
    console.log('🔍 Answer Check:', { 
      selectedAnswer: actualAnswer, 
      correctAnswer: questions[currentQuestion].correct, 
      isCorrect,
      match: actualAnswer === questions[currentQuestion].correct
    });
    
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }

    // Send Arduino feedback ONCE
    console.log('📤 Sending Arduino feedback:', isCorrect ? 'CORRECT' : 'WRONG');
    fetch('http://localhost:5001/api/quiz/arduino-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect })
    }).catch(err => console.log('Arduino feedback failed:', err));

    // track answers
    const answerRecord = {
      questionId: questions[currentQuestion].id,
      selectedAnswer: actualAnswer,
      isCorrect: isCorrect,
      pointsEarned: isCorrect ? (questions[currentQuestion].points || 10) : 0,
      timeTaken: getTimerDuration() - timeLeft
    };
    setAnswers([...answers, answerRecord]);

    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer("");
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(getTimerDuration());
      } else {
        // quiz complete
        saveQuizResults(newScore, [...answers, answerRecord]);
        setQuizComplete(true);
      }
    }, 2000);
  };

  const saveQuizResults = async (finalScore, allAnswers) => {
    try {
      if (!user?.child?.id) {
        console.error('No child ID found');
        return;
      }

      // Use the same activity ID calculation as in loadQuizData
      let activityId = 7;
      if (operation === 'addition') {
        if (level === 'beginner') {
          activityId = 6 + parseInt(sublevel || 1);
        } else if (level === 'intermediate') {
          activityId = 9 + parseInt(sublevel || 1);
        } else if (level === 'advanced') {
          activityId = 12 + parseInt(sublevel || 1);
        }
      } else if (operation === 'subtraction') {
        if (level === 'beginner') {
          activityId = 15 + parseInt(sublevel || 1);
        } else if (level === 'intermediate') {
          activityId = 18 + parseInt(sublevel || 1);
        } else if (level === 'advanced') {
          activityId = 21 + parseInt(sublevel || 1);
        }
      } else if (operation === 'multiplication') {
        if (level === 'beginner') {
          activityId = 24 + parseInt(sublevel || 1);
        } else if (level === 'intermediate') {
          activityId = 27 + parseInt(sublevel || 1);
        } else if (level === 'advanced') {
          activityId = 30 + parseInt(sublevel || 1);
        }
      } else if (operation === 'division') {
        if (level === 'beginner') {
          activityId = 33 + parseInt(sublevel || 1);
        } else if (level === 'intermediate') {
          activityId = 36 + parseInt(sublevel || 1);
        } else if (level === 'advanced') {
          activityId = 39 + parseInt(sublevel || 1);
        }
      }
      
      const maxScore = questions.length;

      
      const result = await api.saveQuizAttempt({
        childId: user.child.id,
        activityId: activityId,
        score: finalScore,
        maxScore: maxScore,
        answers: allAnswers
      });

      
      const progressResult = await api.saveProgress({
        childId: user.child.id,
        activityId: activityId,
        score: finalScore,
        maxScore: maxScore
      });

      // store achie
      if (progressResult.success) {
        setPointsEarned(progressResult.pointsEarned || 0);
        setNewAchievements(progressResult.newAchievements || []);
        setTotalPoints(progressResult.totalPoints || 0);
      }

      if (result.success) {
        console.log('Quiz results saved successfully:', result.data);
        
        // update
        if (result.data.passed) {
          const updatedUser = { ...user };
          if (updatedUser.child) {
            updatedUser.child.totalPoints = (updatedUser.child.totalPoints || 0) + (activityInfo?.points || 100);
          }
          setUser(updatedUser);
          sessionStorage.setItem('userData', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
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
    if (!questions || questions.length === 0 || !questions[currentQuestion]) return;
    
    if ('speechSynthesis' in window) {
      // If already playing, stop it
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }
      
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsPlaying(true);
      
      const utterance = new SpeechSynthesisUtterance(questions[currentQuestion].question);
      utterance.rate = 0.8; // Slightly slower for kids
      utterance.pitch = 1.2; // Higher pitch for friendly voice
      utterance.volume = 1.0;
      
      
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


  if (!user || loading) {
    return (
      <div className="quiz-layout">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '24px',
          color: '#4A90E2'
        }}>
          <div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>⏳</div>
            <div>Loading quiz questions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-layout">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '24px',
          color: '#E74C3C'
        }}>
          <div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>⚠️</div>
            <div>No questions available for this quiz.</div>
            <button 
              onClick={() => navigate(`/math/${operation}`)} 
              style={{ 
                marginTop: '20px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
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
            
            {/* Points Display */}
            {pointsEarned > 0 && (
              <div style={{
                backgroundColor: '#FFA500',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                margin: '20px 0',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                🌟 +{pointsEarned} Points Earned!
                <div style={{ fontSize: '14px', marginTop: '5px', fontWeight: 'normal' }}>
                  Total Points: {totalPoints}
                </div>
              </div>
            )}

            
            {newAchievements && newAchievements.length > 0 && (
              <div style={{
                backgroundColor: '#FFD700',
                color: '#333',
                padding: '15px',
                borderRadius: '10px',
                margin: '20px 0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏆 New Achievement{newAchievements.length > 1 ? 's' : ''}!</div>
                {newAchievements.map((ach, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    margin: '5px 0',
                    fontWeight: 'bold'
                  }}>
                    {ach.name}
                  </div>
                ))}
              </div>
            )}
            
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="help-btn" 
                onClick={handleHelpClick}
                disabled={showResult || quizComplete}
                title="Get a hint"
              >
                💡 Help
              </button>
              <span className="timer">⏰ {timeLeft}s</span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="question-container">
          {!showResult && questions[currentQuestion] ? (
            <>
              <div className="question-header">
                <h2 className="question-title">{getLevelDisplay()}</h2>
                <div className="question-operation">{getOperationDisplay()}</div>
              </div>
              
              <div className="question-card">
                {/* ASL Player - Shows ASL translation for any question */}
                {questions[currentQuestion] && (questions[currentQuestion].aslSigns || questions[currentQuestion].aslVideoUrl || questions[currentQuestion].aslImageUrl) && (
                  <ASLPlayer 
                    question={questions[currentQuestion]}
                    autoPlay={false}
                    showControls={true}
                  />
                )}
                
                <div className="question-text-container">
                  <h3 className="question-text">
                    {questions[currentQuestion].question}
                  </h3>
                  <button 
                    className={`speaker-btn ${isPlaying ? 'playing' : ''} ${!audioEnabled ? 'audio-off' : 'audio-on'}`}
                    onClick={speakQuestion}
                    onContextMenu={(e) => { e.preventDefault(); toggleAudio(); }}
                    title={
                      !audioEnabled ? "� Audio is off - right-click to enable" : 
                      isPlaying ? "🔊 Click to stop | Right-click to disable audio" : 
                      "� Click to hear the question | Right-click to disable audio"
                    }
                  >
                    {!audioEnabled ? '🔇' : (isPlaying ? '🔊' : '🔈')}
                  </button>
                </div>
                
                <div className="options-grid">
                  {(questions[currentQuestion]?.options || []).map((option, index) => (
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
                  onClick={() => handleNextQuestion(selectedAnswer)}
                  disabled={!selectedAnswer}
                >
                  {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </button>
              </div>
            </>
          ) : questions[currentQuestion] ? (
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
                  : "Try again! Think carefully about your answer."}
              </p>
            </div>
          ) : null}
        </div>
      </main>

      {/* Hint Modal */}
      {showHintModal && questions[currentQuestion] && (
        <div className="hint-modal-overlay" onClick={handleCloseHint}>
          <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hint-modal-header">
              <h3>💡 Need Help?</h3>
              <button className="hint-close-btn" onClick={handleCloseHint}>✕</button>
            </div>
            
            <div className="hint-modal-content">
              <p className="hint-text">{generateHints(questions[currentQuestion])[currentHintLevel]}</p>
              
              <div className="hint-level-indicator">
                {[0, 1, 2].map(level => (
                  <span 
                    key={level} 
                    className={`hint-dot ${level <= currentHintLevel ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="hint-modal-footer">
              {currentHintLevel < 2 ? (
                <button className="hint-next-btn" onClick={handleNextHint}>
                  Next Hint →
                </button>
              ) : (
                <button className="hint-got-it-btn" onClick={handleCloseHint}>
                  Got it! ✓
                </button>
              )}
            </div>
            
            <p className="hint-timer-note">⏸️ Timer paused while viewing hints</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MathQuiz;