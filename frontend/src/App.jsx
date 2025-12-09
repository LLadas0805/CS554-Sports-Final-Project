import './App.css';
import Home from './components/Home';
import Signup from "./components/Signup"
import Login from "./components/Login"
import NotFound from './components/NotFound';
import User from './components/User'
import UserList from './components/UserList'
import UserEdit from './components/UserEdit'
import Game from './components/Game.jsx'
import GameEdit from './components/GameEdit.jsx'
import GameList from './components/GameList.jsx'
import {Route, Link, Routes} from 'react-router-dom';

const App = () => {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/users' element={<UserList/>}/>
        <Route path='/users/:id' element={<User/>}/>
        <Route path='users/edit/:id' element={<UserEdit/>}/>
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
