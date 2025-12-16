import './App.css';
import Home from './components/Home';
import Signup from "./components/Signup";
import Login from "./components/Login";
import NotFound from './components/NotFound';
import User from './components/User';
import UserEdit from './components/UserEdit';
import UserList from './components/UserList';
import TeamList from './components/TeamList';
import Team from './components/Team';
import TeamForm from './components/TeamForm';
import {Route, Link, Routes} from 'react-router-dom';
import Game from './components/Game.jsx'
import GameEdit from './components/GameEdit'
import GameList from './components/GameList'
import UserOnlyRoute from './components/UserOnlyRoute'
import { useEffect, useState  } from "react";
import { socket } from "./socket.js";
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listens for notifications and logins on backend
  useEffect(() => {
    const fetchData = async () => {
      const {data: loggedData} = await axios.get("http://localhost:3000/user/auth", {
        withCredentials: true
      });
      if (loggedData.loggedIn) setUser(loggedData.user);
      setLoading(false);
    };

    socket.on("notification", (data) => {
      if (data.message) alert(data.message);
    });

    fetchData();

    return () => socket.off("notification");
  }, []);


  if (loading) {
    return null;
  } else {
    return (
      <div className='App'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login setUser={setUser}/>} />

          <Route
            path="/users"
            element={
              <UserOnlyRoute user={user}>
                <UserList />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/users/:id"
            element={
              <UserOnlyRoute user={user}>
                <User />
              </UserOnlyRoute>
            }
          />

          <Route
            path="users/edit/:id/"
            element={
              <UserOnlyRoute user={user}>
                <UserEdit />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/teams"
            element={
              <UserOnlyRoute user={user}>
                <TeamList />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/teams/new"
            element={
              <UserOnlyRoute user={user}>
                <TeamForm mode="create" />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/teams/:id"
            element={
              <UserOnlyRoute user={user}>
                <Team />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/teams/:id/edit"
            element={
              <UserOnlyRoute user={user}>
                <TeamForm mode="edit" />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/games"
            element={
              <UserOnlyRoute user={user}>
                <GameList />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/games/:id"
            element={
              <UserOnlyRoute user={user}>
                <Game />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/games/add"
            element={
              <UserOnlyRoute user={user}>
                <GameEdit />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/games/edit/:id"
            element={
              <UserOnlyRoute user={user}>
                <GameEdit />
              </UserOnlyRoute>
            }
          />
        

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }
};

export default App;