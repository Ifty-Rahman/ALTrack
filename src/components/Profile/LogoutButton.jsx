import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import { FiLogOut, FiGithub } from "react-icons/fi";
import "../../css/LogoutButtton.css";

function LogOut() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="profile">
      <button type="button" onClick={handleLogout} className="logout-btn">
        <FiLogOut className="btn-icon" aria-hidden="true" />
        Log out
      </button>
      <a
        href="https://github.com/Ifty-Rahman/ALTrack"
        target="_blank"
        rel="noopener noreferrer"
        className="github-btn"
      >
        <FiGithub className="btn-icon" aria-hidden="true" />
        GitHub
      </a>
    </div>
  );
}

export default LogOut;
