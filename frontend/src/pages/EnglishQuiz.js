import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, api } from "../api/auth";

function EnglishQuiz() {
	const navigate = useNavigate();
	const { topic, level, sublevel } = useParams();
	const [questions, setQuestions] = useState([]);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState({});
	const [loading, setLoading] = useState(true);
	const [pinnedText, setPinnedText] = useState("");

	useEffect(() => {
		if (!auth.isAuthenticated()) {
			navigate("/login");
		} else {
			loadQuizContent();
		}
	}, [navigate, topic, level, sublevel]);

	const loadQuizContent = async () => {
		setLoading(true);
		
		// Fetch pinned text for comprehension from database
		if (topic === "comprehension") {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/reading-passages`, {
					headers: api.getAuthHeaders()
				});
				const data = await response.json();
				
				if (data.success) {
					const passage = data.data.find(p => 
						p.subject === "English" && 
						p.topic === "comprehension" && 
						p.level === level && 
						p.sublevel === sublevel
					);
					
					if (passage) {
						setPinnedText(passage.content);
					} else {
						setPinnedText("Reading passage will be displayed here. Please contact your administrator to add content for this level.");
					}
				}
			} catch (error) {
				console.error('Error fetching reading passage:', error);
				setPinnedText("Reading passage will be displayed here.");
			}
		}

		// For now, create sample questions
		const sampleQuestions = [
			{
				id: 1,
				question_text: topic === "comprehension" 
					? "What is the main character's name in the story?"
					: `Sample ${topic} question for ${level} level`,
				question_type: "multiple_choice",
				options: topic === "comprehension"
					? ["Whiskers", "Buddy", "Sarah", "Alex"]
					: ["Option A", "Option B", "Option C", "Option D"],
				correct_answer: topic === "comprehension" ? "Whiskers" : "Option A"
			},
			{
				id: 2,
				question_text: topic === "comprehension"
					? "Where do the main characters live?"
					: `Another ${topic} question for ${level} level`,
				question_type: "multiple_choice",
				options: topic === "comprehension"
					? ["In a forest", "In the same house", "In a garden", "In a school"]
					: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
				correct_answer: topic === "comprehension" ? "In the same house" : "Choice 1"
			}
		];

		setQuestions(sampleQuestions);
		setLoading(false);
	};

	const handleAnswer = (questionId, answer) => {
		setAnswers({
			...answers,
			[questionId]: answer
		});
	};

	const nextQuestion = () => {
		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion(currentQuestion + 1);
		}
	};

	const previousQuestion = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1);
		}
	};

	if (loading) {
		return (
			<div className="english-quiz-layout">
				<div className="loading-message">Loading quiz...</div>
			</div>
		);
	}

	const question = questions[currentQuestion];

	return (
		<div className="english-quiz-layout">
			<header className="english-quiz-header">
				<button className="english-quiz-nav-btn" onClick={() => navigate(-1)}>
					← Back
				</button>
				<h1 className="english-quiz-title">{topic} • {level} • Part {sublevel}</h1>
				<div className="question-progress">
					Question {currentQuestion + 1} of {questions.length}
				</div>
			</header>

			<main className="english-quiz-main">
				{/* Pinned Text Section for Comprehension */}
				{pinnedText && (
					<div className="pinned-text-container">
						<div className="pinned-text-header">
							<h3>📖 Reading Passage</h3>
							<span className="pin-icon">📌</span>
						</div>
						<div className="pinned-text-content">
							{pinnedText.split('\n').map((line, index) => (
								<p key={index}>{line}</p>
							))}
						</div>
					</div>
				)}

				{/* Question Section */}
				<div className="quiz-card">
					<div className="question-header">
						<h2 className="question-title">Question {currentQuestion + 1}</h2>
					</div>
					
					<div className="question-content">
						<p className="question-text">{question.question_text}</p>
						
						<div className="options-container">
							{question.options.map((option, index) => (
								<button
									key={index}
									className={`option-btn ${answers[question.id] === option ? 'selected' : ''}`}
									onClick={() => handleAnswer(question.id, option)}
								>
									{option}
								</button>
							))}
						</div>
					</div>

					<div className="quiz-navigation">
						<button 
							className="quiz-nav-btn prev" 
							onClick={previousQuestion}
							disabled={currentQuestion === 0}
						>
							← Previous
						</button>
						
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
								onClick={() => alert("Quiz completed! (Submission functionality coming soon)")}
							>
								Submit Quiz
							</button>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}

export default EnglishQuiz;
