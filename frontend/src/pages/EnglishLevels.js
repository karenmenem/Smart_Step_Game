import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, api } from "../api/auth";

function EnglishLevels() {
	const navigate = useNavigate();
	const { topic } = useParams(); // e.g., comprehension, grammar, vocabulary, picture match
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [levelAccess, setLevelAccess] = useState({
		beginner: {
			level1: { allowed: true },
			level2: { allowed: false, reason: 'Complete Sublevel 1 with 80% or higher' }
		},
		intermediate: {
			level1: { allowed: false, reason: 'Complete Beginner levels first' },
			level2: { allowed: false, reason: 'Complete Intermediate Sublevel 1 first' }
		},
		advanced: {
			level1: { allowed: false, reason: 'Complete Intermediate levels first' },
			level2: { allowed: false, reason: 'Complete Advanced Sublevel 1 first' }
		}
	});

	useEffect(() => {
		if (auth.isAuthenticated()) {
			const userData = auth.getCurrentUser();
			setUser(userData);
			checkLevelAccess(userData);
		} else {
			navigate("/login");
		}
	}, [navigate, topic]);

	const checkLevelAccess = async (userData) => {
		if (!userData?.child?.id) return;
		
		setLoading(true);
		try {
			// Map topics to activity IDs (actual IDs in database)
			// Comprehension: 43,44,46,47,49,50 (Beginner 43,44 / Intermediate 46,47 / Advanced 49,50)
			const activityIds = {
				comprehension: {
					beginner: [43, 44],
					intermediate: [46, 47],
					advanced: [49, 50]
				}
			};

			const ids = activityIds[topic] || activityIds.comprehension;

			// Check access for each level
			const [
				beginnerL2,
				intermediateL1,
				intermediateL2,
				advancedL1,
				advancedL2
			] = await Promise.all([
				api.checkLevelAccess(userData.child.id, ids.beginner[1]),
				api.checkLevelAccess(userData.child.id, ids.intermediate[0]),
				api.checkLevelAccess(userData.child.id, ids.intermediate[1]),
				api.checkLevelAccess(userData.child.id, ids.advanced[0]),
				api.checkLevelAccess(userData.child.id, ids.advanced[1])
			]);

			setLevelAccess({
				beginner: {
					level1: { allowed: true }, // Always accessible
					level2: beginnerL2.success && beginnerL2.allowed ? beginnerL2 : { allowed: false, reason: beginnerL2.reason || 'Complete Sublevel 1 first' }
				},
				intermediate: {
					level1: intermediateL1.success && intermediateL1.allowed ? intermediateL1 : { allowed: false, reason: intermediateL1.reason || 'Complete Beginner Sublevel 2 first' },
					level2: intermediateL2.success && intermediateL2.allowed ? intermediateL2 : { allowed: false, reason: intermediateL2.reason || 'Complete Intermediate Sublevel 1 first' }
				},
				advanced: {
					level1: advancedL1.success && advancedL1.allowed ? advancedL1 : { allowed: false, reason: advancedL1.reason || 'Complete Intermediate Sublevel 2 first' },
					level2: advancedL2.success && advancedL2.allowed ? advancedL2 : { allowed: false, reason: advancedL2.reason || 'Complete Advanced Sublevel 1 first' }
				}
			});
		} catch (error) {
			console.error('Error checking level access:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		auth.logout();
		navigate("/");
	};

	const getTopicDetails = () => {
		const topics = {
			comprehension: {
				title: "Reading Comprehension",
				emoji: "📖",
				description: "Read passages and answer questions to test understanding!",
				color: "#7f7fd5",
				beginnerStats: [
					{ icon: "📚", text: "Short passages with direct questions" },
					{ icon: "⭐", text: "Earn stars for every correct answer" },
					{ icon: "🎯", text: "Score 80%+ to unlock next sublevel" },
					{ icon: "📝", text: "2 sublevels, 10 questions each" }
				]
			},
			grammar: {
				title: "Grammar",
				emoji: "✏️",
				description: "Practice sentence structure and grammar rules!",
				color: "#43cea2",
				beginnerStats: [
					{ icon: "📝", text: "Simple sentence patterns and structures" },
					{ icon: "🔤", text: "Learn parts of speech and word order" },
					{ icon: "🎯", text: "Score 80%+ to unlock next sublevel" },
					{ icon: "📚", text: "2 sublevels, 10 questions each" }
				]
			},			vocabulary: {
				title: "Vocabulary",
				emoji: "🧠",
				description: "Learn new words and meanings!",
				color: "#f7971e",
				beginnerStats: [
					{ icon: "📖", text: "Common everyday words and meanings" },
					{ icon: "🔍", text: "Picture clues and context hints" },
					{ icon: "🎯", text: "Score 80%+ to unlock next sublevel" },
					{ icon: "📚", text: "2 sublevels, 10 questions each" }
				]
			},
			picture_match: {
				title: "Picture Match",
				emoji: "🎯",
				description: "Match images with words!",
				color: "#831ef7ff",
				beginnerStats: [
					{ icon: "🖼️", text: "Match simple pictures with words" },
					{ icon: "🎨", text: "Visual learning with colorful images" },
					{ icon: "🎯", text: "Score 80%+ to unlock next sublevel" },
					{ icon: "📚", text: "2 sublevels, 10 questions each" }
				]
			}
		};
		return topics[topic] || topics.comprehension;
	};

	const topicInfo = getTopicDetails();

	return (
		<div className="math-levels-layout">
			{/* Header */}
			<header className="math-levels-header">
				<div className="math-levels-header-content">
					<div className="math-levels-logo">
						<h1>Smart<span className="logo-accent">Step</span></h1>
					</div>

					<nav className="math-levels-nav">
						<button className="math-levels-nav-btn" onClick={() => navigate("/subjects")}>
							← Back to Subjects
						</button>
						<button className="math-levels-nav-btn" onClick={() => navigate("/")}>
							🏠 Home
						</button>
						{user && (
							<>
								<div className="math-levels-user-info">
									{user.child?.profile_picture ? (
										<img
											src={`http://localhost:5000/${user.child.profile_picture}`}
											alt="Profile"
											className="math-levels-profile-avatar"
											onError={(e) => {
												e.target.style.display = 'none';
											}}
										/>
									) : (
										<div className="math-levels-avatar">
											{(user.child?.name || user.parent?.email || 'U').charAt(0).toUpperCase()}
										</div>
									)}
									<span className="math-levels-welcome-text">Hi, {user.child?.name || user.parent?.email}!</span>
								</div>
								<button className="math-levels-logout-btn" onClick={handleLogout}>
									Logout
								</button>
							</>
						)}
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<main className="math-levels-main">
				<div className="math-levels-title-section">
					<div className="operation-header">
						<div className="operation-icon" style={{ color: topicInfo.color }}>
							{topicInfo.emoji}
						</div>
						<div>
							<h1 className="math-levels-main-title">{topicInfo.title} Adventure! 🎯</h1>
							<p className="math-levels-subtitle">{topicInfo.description}</p>
						</div>
					</div>
				</div>

				<div className="levels-container">
					{/* Beginner Level */}
					<div className="level-card beginner-card active">
						<div className="level-header">
							<div className="level-icon">🌱</div>
							<div className="level-info">
								<h2 className="level-title">Beginner</h2>
								<p className="level-description">Perfect for starting your {topicInfo.title.toLowerCase()} journey!</p>
							</div>
						</div>

						<div className="level-content">
							<div className="level-stats">
								{topicInfo.beginnerStats.map((stat, index) => (
									<div key={index} className="stat-item">
										<span className="stat-icon">{stat.icon}</span>
										<span className="stat-text">{stat.text}</span>
									</div>
								))}
							</div>

							<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
								<button 
									className="level-btn start-btn"
									onClick={() => navigate(`/english/${topic || 'comprehension'}/quiz/beginner/1`)}
									style={{ backgroundColor: '#43e97b' }}
									disabled={loading}
								>
									📚 Sublevel 1: Basic {topicInfo.title}
								</button>
								<button 
									className={`level-btn ${levelAccess.beginner.level2.allowed ? 'start-btn' : 'locked-btn'}`}
									onClick={() => {
										if (levelAccess.beginner.level2.allowed) {
											navigate(`/english/${topic || 'comprehension'}/quiz/beginner/2`);
										} else {
											alert(levelAccess.beginner.level2.reason || 'Complete Sublevel 1 with 80% or higher to unlock');
										}
									}}
									style={{ backgroundColor: levelAccess.beginner.level2.allowed ? '#4facfe' : '#ccc' }}
									disabled={loading || !levelAccess.beginner.level2.allowed}
								>
									{levelAccess.beginner.level2.allowed ? '🎯' : '🔒'} Sublevel 2: Intermediate {topicInfo.title}
								</button>
							</div>
						</div>
					</div>

				{/* Intermediate Level */}
				<div className={`level-card intermediate-card ${levelAccess.intermediate.level1.allowed ? 'active' : 'locked'}`}>
					{!levelAccess.intermediate.level1.allowed && (
						<div className="lock-overlay">
							<div className="lock-icon">🔒</div>
						</div>
					)}

					<div className="level-header">
						<div className="level-icon">⚡</div>
						<div className="level-info">
							<h2 className="level-title">Intermediate</h2>
							<p className="level-description">Challenge yourself with harder {topicInfo.title.toLowerCase()}!</p>
						</div>
					</div>						<div className="level-content">
							<div className="level-stats">
								<div className="stat-item">
									<span className="stat-icon">🎯</span>
									<span className="stat-text">More challenging content</span>
								</div>
								<div className="stat-item">
									<span className="stat-icon">🏆</span>
									<span className="stat-text">2 sublevels to master</span>
								</div>
							</div>

							<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
								<button 
									className={`level-btn ${levelAccess.intermediate.level1.allowed ? 'start-btn' : 'locked-btn'}`}
									onClick={() => {
										if (levelAccess.intermediate.level1.allowed) {
											navigate(`/english/${topic || 'comprehension'}/quiz/intermediate/1`);
										} else {
											alert(levelAccess.intermediate.level1.reason || 'Complete Beginner levels first');
										}
									}}
									style={{ backgroundColor: levelAccess.intermediate.level1.allowed ? '#fbbf24' : '#ccc' }}
									disabled={loading || !levelAccess.intermediate.level1.allowed}
								>
									{levelAccess.intermediate.level1.allowed ? '📚' : '🔒'} Sublevel 1: Advanced {topicInfo.title}
								</button>
								<button 
									className={`level-btn ${levelAccess.intermediate.level2.allowed ? 'start-btn' : 'locked-btn'}`}
									onClick={() => {
										if (levelAccess.intermediate.level2.allowed) {
											navigate(`/english/${topic || 'comprehension'}/quiz/intermediate/2`);
										} else {
											alert(levelAccess.intermediate.level2.reason || 'Complete Intermediate Sublevel 1 first');
										}
									}}
									style={{ backgroundColor: levelAccess.intermediate.level2.allowed ? '#f59e0b' : '#ccc' }}
									disabled={loading || !levelAccess.intermediate.level2.allowed}
								>
									{levelAccess.intermediate.level2.allowed ? '🎯' : '🔒'} Sublevel 2: Expert {topicInfo.title}
								</button>
							</div>
						</div>
					</div>

				{/* Advanced Level */}
				<div className={`level-card advanced-card ${levelAccess.advanced.level1.allowed ? 'active' : 'locked'}`}>
					{!levelAccess.advanced.level1.allowed && (
						<div className="lock-overlay">
							<div className="lock-icon">🔒</div>
						</div>
					)}						<div className="level-header">
							<div className="level-icon">🏆</div>
							<div className="level-info">
								<h2 className="level-title">Advanced</h2>
								<p className="level-description">Master the most challenging {topicInfo.title.toLowerCase()}!</p>
							</div>
						</div>

						<div className="level-content">
							<div className="level-stats">
								<div className="stat-item">
									<span className="stat-icon">🚀</span>
									<span className="stat-text">Expert level challenges</span>
								</div>
								<div className="stat-item">
									<span className="stat-icon">👑</span>
									<span className="stat-text">Become a master</span>
								</div>
							</div>

							<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
								<button 
									className={`level-btn ${levelAccess.advanced.level1.allowed ? 'start-btn' : 'locked-btn'}`}
									onClick={() => {
										if (levelAccess.advanced.level1.allowed) {
											navigate(`/english/${topic || 'comprehension'}/quiz/advanced/1`);
										} else {
											alert(levelAccess.advanced.level1.reason || 'Complete Intermediate levels first');
										}
									}}
									style={{ backgroundColor: levelAccess.advanced.level1.allowed ? '#ef4444' : '#ccc' }}
									disabled={loading || !levelAccess.advanced.level1.allowed}
								>
									{levelAccess.advanced.level1.allowed ? '📚' : '🔒'} Sublevel 1: Master {topicInfo.title}
								</button>
								<button 
									className={`level-btn ${levelAccess.advanced.level2.allowed ? 'start-btn' : 'locked-btn'}`}
									onClick={() => {
										if (levelAccess.advanced.level2.allowed) {
											navigate(`/english/${topic || 'comprehension'}/quiz/advanced/2`);
										} else {
											alert(levelAccess.advanced.level2.reason || 'Complete Advanced Sublevel 1 first');
										}
									}}
									style={{ backgroundColor: levelAccess.advanced.level2.allowed ? '#dc2626' : '#ccc' }}
									disabled={loading || !levelAccess.advanced.level2.allowed}
								>
									{levelAccess.advanced.level2.allowed ? '🎯' : '🔒'} Sublevel 2: Champion {topicInfo.title}
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

export default EnglishLevels;