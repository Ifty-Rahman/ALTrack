import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css/App.css";
import { useAuth } from "./contexts/AuthContext.js";
import Landing from "./pages/Landing.jsx";
import Discover from "./pages/Discover.jsx";
import UserList from "./pages/Userlist.jsx";
import Browse from "./pages/Browse.jsx";
import NavBar from "./components/NavBar.jsx";
import ProfilePage from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Dock from "./components/Dock.jsx";
import Search from "./pages/Search.jsx";
import Details from "./pages/Details.jsx";
import {
  MdDashboard,
  MdExplore,
  MdList,
  MdPerson,
  MdLogin,
  MdHome,
} from "react-icons/md";

const loginUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${import.meta.env.VITE_ANILIST_CLIENT_ID}&response_type=token`;

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("anilist_token");
  return {
    headers: token
      ? {
          ...headers,
          Authorization: `Bearer ${token}`,
        }
      : headers,
  };
});

const client = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: "https://graphql.anilist.co" })),
  cache: new InMemoryCache({
    typePolicies: {
      Page: { keyFields: [] },
    },
  }),
});

function DockWrapper() {
  const { authToken } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1440);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = useNavigate();

  const dockItems = [
    ...(authToken
      ? [
          {
            label: "Dashboard",
            icon: <MdDashboard size={28} />,
            onClick: () => navigate("/Dashboard"),
            className: "dock-item-dashboard",
          },
          {
            label: "Discover",
            icon: <MdExplore size={28} />,
            onClick: () => navigate("/Discover"),
            className: "dock-item-discover",
          },
          {
            label: "Lists",
            icon: <MdList size={28} />,
            onClick: () => navigate("/Userlist"),
            className: "dock-item-lists",
          },
        ]
      : [
          {
            label: "Home",
            icon: <MdHome size={28} />,
            onClick: () => navigate("/Landing"),
            className: "dock-item-landing",
          },
          {
            label: "Discover",
            icon: <MdExplore size={28} />,
            onClick: () => navigate("/Discover"),
            className: "dock-item-discover",
          },
        ]),
    authToken
      ? {
          label: "Profile",
          icon: <MdPerson size={28} />,
          onClick: () => navigate("/Profile"),
          className: "dock-item-profile",
        }
      : {
          label: "Login with AniList",
          icon: <MdLogin size={28} />,
          onClick: () => (window.location.href = loginUrl),
          className: "dock-item-login",
        },
  ];

  return (
    <Dock
      items={dockItems}
      magnification={isMobile ? 0 : 70}
      distance={isMobile ? 0 : 200}
      panelHeight={50}
      dockHeight={256}
      baseItemSize={50}
      spring={
        isMobile
          ? { mass: 1, stiffness: 1000, damping: 1000 }
          : { mass: 0.0000000001, stiffness: 1000, damping: 5 }
      }
    />
  );
}

function App() {
  const { authToken } = useAuth();
  return (
    <>
      <main className="app">
        <ApolloProvider client={client}>
          <NavBar />
          <Routes>
            <Route path="/" element={authToken ? <Dashboard /> : <Landing />} />
            <Route path="/Landing" element={<Landing />} />
            <Route path="/Discover" element={<Discover />} />
            <Route path="/Browse" element={<Browse />} />
            <Route path="/Search" element={<Search />} />
            <Route path="/Userlist" element={<UserList />} />
            <Route path="/Profile" element={<ProfilePage />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Details" element={<Details />} />
          </Routes>
          <DockWrapper />
        </ApolloProvider>
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
