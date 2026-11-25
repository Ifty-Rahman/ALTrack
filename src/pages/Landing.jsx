import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import {
  MdDashboard,
  MdExplore,
  MdList,
  MdSearch,
  MdFavorite,
  MdCopyright,
  MdEmail,
} from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import { FaGithub } from "react-icons/fa";
import "../css/Landing.css";
import { LOGIN_URL } from "../utils/auth.js";


function Landing() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const handleGetStarted = () => {
    if (authToken) {
      navigate("/Dashboard");
    } else {
      window.location.href = LOGIN_URL;
    }
  };

  const handleBrowse = () => {
    navigate("/Discover");
  };

  const features = [
    {
      icon: <MdDashboard size={32} />,
      title: "Dashboard",
      description:
        "Track your current anime and manga with inline progress updates and score editing.",
    },
    {
      icon: <MdExplore size={32} />,
      title: "Discover",
      description:
        "Browse trending, popular, and seasonal anime and manga to find your next favorite.",
    },
    {
      icon: <MdSearch size={32} />,
      title: "Search",
      description:
        "Quickly find any anime or manga title and add it directly to your list.",
    },
    {
      icon: <CgDetailsMore size={32} />,
      title: "Details",
      description:
        "View comprehensive information about any title including synopsis, characters, staff, and related content.",
    },
    {
      icon: <MdList size={32} />,
      title: "Lists",
      description:
        "Organize your anime and manga collections with customizable list statuses.",
    },
    {
      icon: <MdFavorite size={32} />,
      title: "Favorites",
      description:
        "Mark your favorite titles and view detailed information including characters and staff.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Login with AniList",
      description:
        "Connect your AniList account to sync your anime and manga lists.",
    },
    {
      number: "2",
      title: "Discover & Search",
      description:
        "Browse trending titles or search for specific anime and manga you want to track.",
    },
    {
      number: "3",
      title: "Manage Your Lists",
      description:
        "Add titles to your list, update progress, and rate your favorites as you watch or read.",
    },
    {
      number: "4",
      title: "Track Your Progress",
      description:
        "Use the Dashboard to quickly access and update your current anime and manga.",
    },
  ];

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="hero-brand">ALTrack</span>
          </h1>
          <p className="hero-description">
            Your personal AniList companion for tracking anime and manga.
            Discover new titles, manage your watchlist, and keep your progress
            organized in one sleek interface.
          </p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={handleGetStarted}>
              {authToken ? "Go to Dashboard" : "Get Started"}
            </button>
            <button className="hero-cta" onClick={handleBrowse}>
              Browse Titles
            </button>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-guide">
        <h2 className="section-title">How to Use</h2>
        <div className="guide-steps">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="cta-title">Ready to Start Tracking?</h2>
        <p className="cta-description">
          Join ALTrack today and take control of your anime and manga journey.
        </p>
        <button className="cta-button" onClick={handleGetStarted}>
          {authToken ? (
            "Go to Dashboard"
          ) : (
            <span>
              <img
                src="/Anilist.svg"
                alt="AniList"
                style={{ width: "30px", height: "30px" }}
              />
              Login with AniList
            </span>
          )}
        </button>
      </section>

      <footer className="landing-footer">
        <div className="footer-copy">
          <MdCopyright aria-hidden="true" />
          <span>2025 Ifty Rahman</span>
        </div>
        <div className="footer-links">
          <a
            className="footer-link"
            href="https://github.com/Ifty-Rahman/ALTracker"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub aria-hidden="true" />
            <span>GitHub</span>
          </a>
          <a className="footer-link" href="mailto:Ifty09rahman@gmail.com">
            <MdEmail aria-hidden="true" />
            <span>Email</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
