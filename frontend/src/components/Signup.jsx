import {Link} from 'react-router-dom';
import React, { useState } from 'react';

function Signup(props) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    return (
        <div>
            <h1>Create Your Account</h1>
            <div className="form">
                <form>
                    <div>
                        <input name="query" />
                    </div>
                    <div>
                        <input name="query" />
                    </div>
                        
                    <button type="submit">Sign Up</button>
                </form>
            </div>
            <div className = "pages">
                <h2>Already have an account?</h2>
                <Link className='link' to='/login'>
                    Log in
                </Link>
                <Link className='link' to='/'>
                    Return Home
                </Link>
            </div>
        </div>
    );
}

export default Signup;