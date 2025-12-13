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

  function handleGithub() {
    window.open("https://github.com/Ifty-Rahman/ALTrack", "_blank");
  }

  return (
    <div className="profile">
      <button onClick={handleLogout} className="logout-btn">
        <FiLogOut className="btn-icon" />
        Logout
      </button>
      <button onClick={handleGithub} className="github-btn">
        <FiGithub className="btn-icon" />
        Github
      </button>
    </div>
  );
}

export default LogOut;
