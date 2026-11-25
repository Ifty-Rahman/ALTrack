import PageState from "./PageState.jsx";
import { redirectToLogin } from "../utils/auth.js";

function SignedOutState({ message }) {
  return (
    <div className="Not-Logged-In">
      <PageState
        title="Log in to continue"
        message={message}
        actions={[
          { label: "Log in with AniList", onClick: redirectToLogin },
          { label: "Browse Discover", to: "/Discover" },
        ]}
      />
    </div>
  );
}

export default SignedOutState;
