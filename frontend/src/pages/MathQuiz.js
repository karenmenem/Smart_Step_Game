import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, api } from "../api/auth";
import ASLPlayer from "../components/ASLPlayer";

function MathQuiz() {
  const navigate = useNavigate();
  const { operation, level, sublevel } = useParams();
  
  // Get timer duration based on difficulty level
  const getTimerDuration = () => {
    if (level === 'beginner') return 30;      // 30 seconds
    if (level === 'intermediate') return 60;  // 1 minute
    if (level === 'advanced') return 90;      // 1.5 minutes
    return 30; // default
  };
  
  // Get operation display text
  const getOperationDisplay = () => {
    const operationMap = {
      'addition': '➕ Addition',
      'subtraction': '➖ Subtraction',
      'multiplication': '✖️ Multiplication',
      'division': '➗ Division'
    };
    return operationMap[operation] || '➕ Addition';
  };
  
  // Get level display text
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
      
      // Fetch questions from database
      loadQuizData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      
      // Map operation, level, and sublevel to activity IDs
      let activityId = 7; // Default to Addition Beginner Level 1
      
      if (operation === 'addition') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 8 : 7; // 7 or 8
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 11 : 10; // 10 or 11
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 14 : 13; // 13 or 14
        }
      } else if (operation === 'subtraction') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 17 : 16; // 16 or 17
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 20 : 19; // 19 or 20
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 23 : 22; // 22 or 23
        }
      } else if (operation === 'multiplication') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 26 : 25; // 25 or 26
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 29 : 28; // 28 or 29
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 32 : 31; // 31 or 32
        }
      } else if (operation === 'division') {
        if (level === 'beginner') {
          activityId = sublevel === '2' ? 35 : 34; // 34 or 35
        } else if (level === 'intermediate') {
          activityId = sublevel === '2' ? 38 : 37; // 37 or 38
        } else if (level === 'advanced') {
          activityId = sublevel === '2' ? 41 : 40; // 40 or 41
        }
      }
      
      // Check if child has access to this level
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
        setQuestions(questionsResponse.data);
      } else {
        console.error('Failed to load questions, using fallback');
        setQuestions(getFallbackQuestions());
      }
      
      if (activityResponse.success) {
        setActivityInfo(activityResponse.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading quiz data:', error);
      setQuestions(getFallbackQuestions());
      setLoading(false);
    }
  };

  const getFallbackQuestions = () => {
    // Fallback questions in case API fails
    return [
      {
        id: 1,
        question: "What is 2 + 3?",
        aslSigns: [2, 3],
        options: ["4", "5", "6", "7"],
        correct: "5"
      },
      {
        id: 2,
        question: "What is 1 + 4?",
        aslSigns: [1, 4],
        options: ["3", "4", "5", "6"],
        correct: "5"
      },
      {
        id: 3,
        question: "What is 3 + 2?",
        aslSigns: [3, 2],
        options: ["4", "5", "6", "7"],
        correct: "5"
      },
      {
        id: 4,
        question: "What is 4 + 1?",
        aslSigns: [4, 1],
        options: ["3", "4", "5", "6"],
        correct: "5"
      },
      {
        id: 5,
        question: "What is 2 + 2?",
        aslSigns: [2, 2],
        options: ["3", "4", "5", "6"],
        correct: "4"
      },
      {
        id: 6,
        question: "What is 3 + 3?",
        aslSigns: [3, 3],
        options: ["5", "6", "7", "8"],
        correct: "6"
      },
      {
        id: 7,
        question: "What is 1 + 6?",
        aslSigns: [1, 6],
        options: ["6", "7", "8", "9"],
        correct: "7"
      },
      {
        id: 8,
        question: "What is 5 + 2?",
        aslSigns: [5, 2],
        options: ["6", "7", "8", "9"],
        correct: "7"
      },
      {
        id: 9,
        question: "What is 4 + 3?",
        aslSigns: [4, 3],
        options: ["6", "7", "8", "9"],
        correct: "7"
      },
      {
        id: 10,
        question: "What is 2 + 6?",
        aslSigns: [2, 6],
        options: ["7", "8", "9", "10"],
        correct: "8"
      }
    ];
  };

  // ASL number signs with animated descriptions
  const aslNumbers = {
    1: { name: "ONE", description: "Index finger extended" },
    2: { name: "TWO", description: "Peace sign" },
    3: { name: "THREE", description: "Thumb, index, middle" },
    4: { name: "FOUR", description: "Four fingers up" },
    5: { name: "FIVE", description: "Open hand" },
    6: { name: "SIX", description: "Pinky and thumb" }
  };

  // Timer countdown
  useEffect(() => {
    if (!questions || questions.length === 0) return;
    
    if (timeLeft > 0 && !showResult && !quizComplete && !timerPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timeLeft, showResult, quizComplete, questions, timerPaused]);

  // Generate hints based on question
  const generateHints = (question) => {
    const text = question.question || question.text || "";
    const isWordProblem = text.length > 50;
    
    if (isWordProblem) {
      // Word problem hints
      return [
        "💡 Read the problem carefully and identify the numbers.",
        "💡 What operation do you need? Look for keywords like 'total', 'altogether', 'in all'.",
        "💡 Write down the numbers and add them step by step. Start with the first two numbers."
      ];
    } else {
      // Number problem hints
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

  const handleNextQuestion = () => {
    if (!questions || questions.length === 0 || !questions[currentQuestion]) {
      console.error('No question available at current index');
      return;
    }
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }

    // Track answer for this question
    const answerRecord = {
      questionId: questions[currentQuestion].id,
      selectedAnswer: selectedAnswer,
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
        // Quiz complete - save results to database
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

      // Save quiz attempt
      const result = await api.saveQuizAttempt({
        childId: user.child.id,
        activityId: activityId,
        score: finalScore,
        maxScore: maxScore,
        answers: allAnswers
      });

      // Save progress for level locking and award achievements
      const progressResult = await api.saveProgress({
        childId: user.child.id,
        activityId: activityId,
        score: finalScore,
        maxScore: maxScore
      });

      // Store achievement/points info for display
      if (progressResult.success) {
        setPointsEarned(progressResult.pointsEarned || 0);
        setNewAchievements(progressResult.newAchievements || []);
        setTotalPoints(progressResult.totalPoints || 0);
      }

      if (result.success) {
        console.log('Quiz results saved successfully:', result.data);
        
        // Update user's total points in session storage
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

  // Auto-play question when component mounts or question changes - DISABLED
  // Students can click the speaker button to hear the question
  // useEffect(() => {
  //   if (!questions || questions.length === 0) return;
  //   
  //   const timer = setTimeout(() => {
  //     if (!showResult && !quizComplete && audioEnabled && questions[currentQuestion]) {
  //       speakQuestion();
  //     }
  //   }, 500);
  //
  //   return () => clearTimeout(timer);
  // }, [currentQuestion, showResult, quizComplete, audioEnabled, questions]);

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

            {/* New Achievements Display */}
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
                  onClick={handleNextQuestion}
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
                  : `The correct answer is ${questions[currentQuestion].correct}`}
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