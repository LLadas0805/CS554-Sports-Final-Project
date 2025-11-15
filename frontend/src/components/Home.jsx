import {Link} from 'react-router-dom';

function Home(props) {
  return (
    <div>
        <h1>Welcome to Sports Finder</h1>
        <div className = "pages">
          <h2>Discover Local Teams, Players, Games and More!</h2>
          <Link className='link' to='/login'>
            Sign in
          </Link>
          <Link className='link' to='/signup'>
            Create an Account
          </Link>
        </div>
    </div>
  );
}

export default Home;