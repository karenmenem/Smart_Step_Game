import Header from "../components/Home/Header";
import SubjectSelector from "../components/Home/SubjectSelector";
import LevelProgress from "../components/Home/LevelProgress";
import AccessibilityBar from "../components/Home/AccessibilityBar";
import AchievementBadges from "../components/Home/AchievementBadges";
import HelpChatButton from "../components/Home/HelpChatButton";

function Home() {
  return (
    <div className="fullscreen">
      <div className="header">
        <Header />
      </div>
      <div className="accessibilityBar">
        <AccessibilityBar />
      </div>
      <div className="mainContainer">
        <div className="subjectSelector">
          <SubjectSelector />
        </div>
        <div className="levelProgress">
          <LevelProgress />
        </div>
        <div className="achievementBadges">
          <AchievementBadges />
        </div>
      </div>
      <div className="helpChatButton">
        <HelpChatButton />
      </div>
    </div>
  );
}

export default Home;
