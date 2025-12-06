import './App.css';
import Home from './components/Home';
import Signup from "./components/Signup"
import Login from "./components/Login"
import NotFound from './components/NotFound';
import User from './components/User'
import UserList from './components/UserList'
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;