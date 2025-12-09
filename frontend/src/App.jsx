import './App.css';
import Home from './components/Home';
import Signup from "./components/Signup";
import Login from "./components/Login";
import NotFound from './components/NotFound';
import User from './components/User';
import UserList from './components/UserList';
import TeamList from './components/TeamList';
import Team from './components/Team';
import TeamForm from './components/TeamForm';
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
        <Route path="/teams" element={<TeamList />} />
        <Route path="/teams/new" element={<TeamForm mode="create" />} />
        <Route path="/teams/:id" element={<Team />} />
        <Route path="/teams/:id/edit" element={<TeamForm mode="edit" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;