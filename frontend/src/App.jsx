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
import GameEdit from './components/GameEdit.jsx'
import GameList from './components/GameList.jsx'
import { useEffect } from "react";
import { socket } from "./socket.js";

const App = () => {
  // Listens for notifications on backend
  useEffect(() => {
    socket.on("notification", (data) => {
      alert(data.message);
    });

    return () => socket.off("notification");
  }, []);

  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/users' element={<UserList/>}/>
        <Route path='/users/:id' element={<User/>}/>
        <Route path ='users/edit/:id/' element={<UserEdit/>}/>
        <Route path="/teams" element={<TeamList />} />
        <Route path="/teams/new" element={<TeamForm mode="create" />} />
        <Route path="/teams/:id" element={<Team />} />
        <Route path="/teams/:id/edit" element={<TeamForm mode="edit" />} />
        <Route path='/games' element={<GameList/>}/>
        <Route path='/games/:id' element={<Game/>}/>
        <Route path='/games/add' element={<GameEdit/>}/>
        <Route path='/games/edit/:id' element={<GameEdit/>}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;