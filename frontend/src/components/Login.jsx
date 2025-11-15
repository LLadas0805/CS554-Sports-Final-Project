import {Link} from 'react-router-dom';

function Login(props) {
  return (
    <div>
        <h1>Sign in</h1>
        <div className="form">

        </div>
        <div className = "pages">
            <h2>Don't have an account?</h2>
            <Link className='link' to='/signup'>
                Sign up
            </Link>
            <Link className='link' to='/'>
                Return Home
            </Link>
        </div>
    </div>
  );
}

export default Login;