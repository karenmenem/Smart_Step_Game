import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { auth, api } from "../api/auth";
import ASLPlayer from "../components/ASLPlayer";

function EnglishQuiz() {
	const navigate = useNavigate();
	const { topic, level, sublevel } = useParams();
	const [questions, setQuestions] = useState([]);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState({});
	const [loading, setLoading] = useState(true);
	const [pinnedText, setPinnedText] = useState("");
	const [passageTitle, setPassageTitle] = useState("");
	const [passageAuthor, setPassageAuthor] = useState("");
	const [user, setUser] = useState(null);
	const [timeLeft, setTimeLeft] = useState(60); // 1 minute = 60 seconds
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [quizComplete, setQuizComplete] = useState(false);
	const [score, setScore] = useState(0);
	const [totalPoints, setTotalPoints] = useState(0);
	const [activityId, setActivityId] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [audioEnabled, setAudioEnabled] = useState(true);
	const [isPlayingPassage, setIsPlayingPassage] = useState(false);
	const [showASL, setShowASL] = useState(false); // State to toggle ASL display

	// Memoize the passage question object to prevent re-renders
	const passageQuestion = useMemo(() => ({
		question_text: pinnedText,
		asl_type: 'sentence',
		aslType: 'sentence'
	}), [pinnedText]);

	const handleLogout = () => {
		auth.logout();
		navigate("/login");
	};

	const goToLevels = () => {
		navigate(`/english/${topic}`);
	};

	const speakQuestion = () => {
		if (!audioEnabled) return;
		
		const question = questions[currentQuestion];
		if (!question) return;

		if (isPlaying) {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
			return;
		}

		const text = question.question_text || question.text;
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = 0.9;
		utterance.pitch = 1;
		utterance.volume = 1;

		utterance.onstart = () => setIsPlaying(true);
		utterance.onend = () => setIsPlaying(false);
		utterance.onerror = () => setIsPlaying(false);

		window.speechSynthesis.speak(utterance);
	};

	const toggleAudio = () => {
		setAudioEnabled(!audioEnabled);
		if (isPlaying) {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
		}
		if (isPlayingPassage) {
			window.speechSynthesis.cancel();
			setIsPlayingPassage(false);
		}
	};

	const speakPassage = () => {
		if (!audioEnabled) return;
		if (!pinnedText) return;

		if (isPlayingPassage) {
			window.speechSynthesis.cancel();
			setIsPlayingPassage(false);
			return;
		}

		const fullText = (passageTitle ? passageTitle + '. ' : '') + 
		                 (passageAuthor ? 'By ' + passageAuthor + '. ' : '') + 
		                 pinnedText;
		
		const utterance = new SpeechSynthesisUtterance(fullText);
		utterance.rate = 0.9;
		utterance.pitch = 1;
		utterance.volume = 1;

		utterance.onstart = () => setIsPlayingPassage(true);
		utterance.onend = () => setIsPlayingPassage(false);
		utterance.onerror = () => setIsPlayingPassage(false);

		window.speechSynthesis.speak(utterance);
	};

	useEffect(() => {
		if (!auth.isAuthenticated()) {
			navigate("/login");
		} else {
			// Reset all quiz states when level changes
			setQuestions([]);
			setCurrentQuestion(0);
			setAnswers({});
			setTimeLeft(60);
			setShowResult(false);
			setIsCorrect(false);
			setQuizComplete(false);
			setScore(0);
			setTotalPoints(0);
			setPinnedText("");
			setPassageTitle("");
			setPassageAuthor("");
			setShowASL(false); // Reset ASL display
			
			const userData = auth.getCurrentUser();
			const currentChild = auth.getCurrentChild();
			setUser({ ...userData, child: currentChild });
			loadQuizContent();
		}
	}, [navigate, topic, level, sublevel]);

	// Reset ASL display when moving to a new question
	useEffect(() => {
		setShowASL(false);
	}, [currentQuestion]);

	const loadQuizContent = async () => {
		setLoading(true);
		
		// Fetch pinned text for comprehension from database
		if (topic === "comprehension") {
			try {
				// Convert level name to number: beginner=1, intermediate=2, advanced=3
				const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
				const levelNum = levelMap[level.toLowerCase()] || parseInt(level) || 1;
				const sublevelNum = parseInt(sublevel) || 1;
				
				const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
				const response = await fetch(`${API_URL}/quiz/reading-passage/English/comprehension/${levelNum}/${sublevelNum}`);
				const data = await response.json();
				
				if (data.success && data.data) {
					setPinnedText(data.data.content);
					setPassageTitle(data.data.title || "");
					setPassageAuthor(data.data.author || "");
				} else {
					setPinnedText("No reading passage available for this level.");
					setPassageTitle("");
					setPassageAuthor("");
				}
			} catch (error) {
				console.error('Error fetching reading passage:', error);
				setPinnedText("Error loading reading passage.");
				setPassageTitle("");
				setPassageAuthor("");
			}
		}

		// Load actual questions from database
		try {
			// Map activity names to IDs (temporary solution)
			const activityMap = {
				'Comprehension Beginner - Level 1': 43,
				'Comprehension Beginner - Level 2': 44,
				'Comprehension Intermediate - Level 1': 46,
				'Comprehension Intermediate - Level 2': 47,
				'Comprehension Advanced - Level 1': 49,
				'Comprehension Advanced - Level 2': 50,
			};
			
			// Build activity name from URL parameters
			const topicCap = topic.charAt(0).toUpperCase() + topic.slice(1);
			const levelCap = level.charAt(0).toUpperCase() + level.slice(1);
			const activityName = `${topicCap} ${levelCap} - Level ${sublevel}`;
			
			const currentActivityId = activityMap[activityName];
			setActivityId(currentActivityId);
			
			if (currentActivityId) {
				// Fetch questions for this activity
				const questionsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/quiz/questions/${currentActivityId}`, {
					headers: api.getAuthHeaders()
				});
				const questionsData = await questionsResponse.json();
				
				if (questionsData.success && questionsData.data && questionsData.data.length > 0) {
					// Map database questions to the format expected by the UI
					const loadedQuestions = questionsData.data.map(q => ({
						id: q.id,
						question_text: q.question,
						question_type: q.type,
						options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
						correct_answer: q.correct,
						aslSigns: q.aslSigns || null,
						aslVideoUrl: q.aslVideoUrl || null,
						aslType: q.aslType || 'none'
					}));
					console.log('Loaded questions with ASL data:', loadedQuestions.map(q => ({ 
						id: q.id, 
						text: q.question_text.substring(0, 30), 
						aslType: q.aslType,
						hasAslSigns: !!q.aslSigns,
						hasAslVideo: !!q.aslVideoUrl
					})));
					setQuestions(loadedQuestions);
				} else {
					setQuestions([]);
				}
			} else {
				setQuestions([]);
			}
		} catch (error) {
			console.error('Error loading questions:', error);
			setQuestions([]);
		}

		setLoading(false);
	};

	const handleAnswer = (questionId, answer) => {
		setAnswers({
			...answers,
			[questionId]: answer
		});
	};

	const calculateScore = (currentAnswers) => {
		let correctCount = 0;
		questions.forEach(q => {
			if (currentAnswers[q.id] === q.correct_answer) {
				correctCount++;
			}
		});
		return correctCount;
	};

	const showFeedbackAndMoveNext = () => {
		const question = questions[currentQuestion];
		// Use the latest answers state
		setAnswers(currentAnswers => {
			const userAnswer = currentAnswers[question.id];
			const correct = userAnswer === question.correct_answer;
			
			// Show result
			setIsCorrect(correct);
			setShowResult(true);
			
			// Auto move to next question after 2 seconds
			setTimeout(() => {
				setShowResult(false);
				if (currentQuestion < questions.length - 1) {
					setCurrentQuestion(currentQuestion + 1);
					setTimeLeft(60);
				} else {
					// Last question - show completion screen
					finishQuiz(currentAnswers);
				}
			}, 2000);
			
			return currentAnswers; // Return unchanged to not update state
		});
	};

	const finishQuiz = async (currentAnswers) => {
		const correctAnswers = calculateScore(currentAnswers);
		const percentage = (correctAnswers / questions.length) * 100;
		setScore(correctAnswers);
		setQuizComplete(true);

		// Save quiz progress to backend
		try {
			const childId = user?.child?.id;
			if (childId && activityId) {
				const result = await api.saveQuizAttempt({
					childId: childId,
					activityId: activityId,
					score: correctAnswers,
					maxScore: questions.length,
					percentage: percentage
				});
				console.log('Quiz attempt saved:', result);
			}
		} catch (error) {
			console.error('Error saving quiz attempt:', error);
		}
	};

	const nextQuestion = () => {
		showFeedbackAndMoveNext();
	};

	const previousQuestion = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1);
			setTimeLeft(60); // Reset timer when going back
			setShowResult(false);
		}
	};

	// Timer effect
	useEffect(() => {
		if (loading || questions.length === 0 || showResult) return;

		const timer = setInterval(() => {
			setTimeLeft((prevTime) => {
				if (prevTime <= 1) {
					// Time's up - show feedback then move to next question
					showFeedbackAndMoveNext();
					return 60;
				}
				return prevTime - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [currentQuestion, loading, questions.length, showResult, answers]);

	if (loading) {
		return (
			<div className="quiz-layout">
				<div className="loading-message">Loading quiz...</div>
			</div>
		);
	}

	if (!questions || questions.length === 0) {
		return (
			<div className="quiz-layout">
				<div className="loading-message">No questions available. Please contact your administrator.</div>
			</div>
		);
	}

	const question = questions[currentQuestion];

	if (!question && !quizComplete) {
		return (
			<div className="quiz-layout">
				<div className="loading-message">Error loading question. Please try again.</div>
			</div>
		);
	}

	// Quiz Completion Screen
	if (quizComplete) {
		const percentage = Math.round((score / questions.length) * 100);
		const passed = percentage >= 80;
		const pointsEarned = score * 10; // 10 points per correct answer

		const getNextLevel = () => {
			const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
			const currentLevelNum = levelMap[level.toLowerCase()];
			const currentSublevelNum = parseInt(sublevel);

			if (currentSublevelNum < 2) {
				// Move to next sublevel
				return { level, sublevel: currentSublevelNum + 1 };
			} else if (currentLevelNum < 3) {
				// Move to next level
				const nextLevelName = currentLevelNum === 1 ? 'intermediate' : 'advanced';
				return { level: nextLevelName, sublevel: 1 };
			}
			return null; // No next level
		};

		const nextLevel = getNextLevel();

		return (
			<div className="quiz-layout">
				<header className="quiz-header">
					<div className="quiz-header-content">
						<div className="quiz-logo">
							<h1>Smart<span className="logo-accent">Step</span></h1>
						</div>
						<nav className="quiz-nav">
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
						
						<div className="score-circle">
							<div className="score-percentage">{percentage}%</div>
							<div className="score-fraction">{score}/{questions.length}</div>
						</div>

						<p className="results-message">
							{passed 
								? `Great job! You've mastered ${level} - Level ${sublevel} ${topic}!`
								: `You need 80% or higher to pass. Try again!`
							}
						</p>

						<div className="points-earned">
							<span className="points-icon">⭐</span>
							<span className="points-text">+{pointsEarned} Points Earned!</span>
							<div className="total-points-text">Total Points: {totalPoints + pointsEarned}</div>
						</div>

						<div className="results-actions">
							<button className="retry-btn" onClick={() => window.location.reload()}>
								🔄 Try Again
							</button>
							{passed && nextLevel && (
								<button 
									className="next-level-btn"
									onClick={() => navigate(`/english/${topic}/quiz/${nextLevel.level}/${nextLevel.sublevel}`)}
								>
									🚀 Next Level
								</button>
							)}
							<button className="back-btn" onClick={goToLevels}>
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
						<span className="timer" style={{ 
							color: timeLeft <= 10 ? '#ef4444' : '#10b981',
							fontWeight: 'bold' 
						}}>
							⏰ {timeLeft}s
						</span>
					</div>
					<div className="progress-bar">
						<div 
							className="progress-fill" 
							style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
						/>
					</div>
				</div>
				{/* Pinned Text Section for Comprehension */}
				{pinnedText && (
					<div className="pinned-text-container">
						<div className="pinned-text-header">
							<h3>📖 Reading Passage</h3>
							<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
								<button
									className={`speaker-btn ${isPlayingPassage ? 'playing' : ''} ${!audioEnabled ? 'audio-off' : 'audio-on'}`}
									onClick={speakPassage}
									title={
										!audioEnabled ? "🔇 Audio is off - right-click question speaker to enable" : 
										isPlayingPassage ? "🔊 Click to stop reading passage" : 
										"🔈 Click to hear the passage"
									}
								>
									{!audioEnabled ? '🔇' : (isPlayingPassage ? '🔊' : '🔈')}
								</button>
								<span className="pin-icon">📌</span>
							</div>
						</div>
						
						{/* ASL Player for the passage */}
						<ASLPlayer question={passageQuestion} />
						
						<div className="pinned-text-content">
							{passageTitle && (
								<h4 className="passage-title">{passageTitle}</h4>
							)}
							{passageAuthor && (
								<p className="passage-author">By {passageAuthor}</p>
							)}
							{pinnedText.split('\n').map((line, index) => (
								<p key={index}>{line}</p>
							))}
						</div>
					</div>
				)}

				{/* Question Section */}
				<div className="quiz-card">
					{showResult ? (
						/* Result Feedback Screen */
						<div className="result-feedback-fullscreen">
							<div className="result-icon">
								{isCorrect ? '✅' : '❌'}
							</div>
							<div className="result-text">
								{isCorrect ? 'Correct' : 'Incorrect'}
							</div>
							{isCorrect ? (
								<div className="feedback-message">
									Great job! You got it right!
								</div>
							) : (
								<div className="correct-answer-text">
									The correct answer is {question.correct_answer}
								</div>
							)}
						</div>
					) : (
						/* Question Screen */
						<>
							<div className="question-header">
								<h2 className="question-title">Question {currentQuestion + 1}</h2>
							</div>
							
							<div className="question-content">
								<div className="question-text-container">
									<h3 className="question-text">{question.question_text}</h3>
									<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
										<button 
											className={`speaker-btn ${isPlaying ? 'playing' : ''} ${!audioEnabled ? 'audio-off' : 'audio-on'}`}
											onClick={speakQuestion}
											onContextMenu={(e) => { e.preventDefault(); toggleAudio(); }}
											title={
												!audioEnabled ? "🔇 Audio is off - right-click to enable" : 
												isPlaying ? "🔊 Click to stop | Right-click to disable audio" : 
												"🔈 Click to hear the question | Right-click to disable audio"
											}
										>
									{!audioEnabled ? '🔇' : (isPlaying ? '🔊' : '🔈')}
								</button>
								{/* ASL Toggle Button - Only show if question has ASL */}
								{console.log('Current question:', question, 'ASL Type:', question.aslType)}
								{question.aslType && question.aslType !== 'none' && (
									<button 
										className={`asl-toggle-btn ${showASL ? 'active' : ''}`}
										onClick={() => setShowASL(!showASL)}
										title={showASL ? "Hide ASL video" : "Show ASL video"}
										>
											🤟 ASL
										</button>
									)}
									</div>
								</div>
								
								{/* ASL Player - Shows ASL translation for comprehension questions */}
								{showASL && question && question.aslType && question.aslType !== 'none' && (
									<div className="asl-video-container">
										<ASLPlayer 
											question={question}
										/>
									</div>
								)}
								
								<div className="options-grid">
									{(question.options || []).map((option, index) => {
										const letters = ['A', 'B', 'C', 'D'];
										return (
											<button
												key={index}
												className={`option-btn ${answers[question.id] === option ? 'selected' : ''}`}
												onClick={() => handleAnswer(question.id, option)}
											>
												<span className="option-letter">{letters[index]}.</span> {option}
											</button>
										);
									})}
								</div>
							</div>

							<div className="quiz-navigation" style={{ justifyContent: 'center' }}>
								{currentQuestion < questions.length - 1 ? (
									<button 
										className="quiz-nav-btn next" 
										onClick={nextQuestion}
										disabled={!answers[question.id]}
									>
										Next →
									</button>
								) : (
									<button 
										className="quiz-submit-btn"
										disabled={!answers[question.id]}
										onClick={nextQuestion}
									>
										Finish Quiz
									</button>
								)}
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
}

export default EnglishQuiz;
