import {Link} from 'react-router-dom';

function NotFound({message = "Page Not Found"}) {
  return (
    <div>
        <h1>404 - {message}</h1>
        <Link className='link' to='/'>
          Return Home
        </Link>
    </div>
  );
}

export default NotFound;