import {Link, useNavigate} from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { socket } from "../socket";

function Login({ setUser }) {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const defaultData = {
            username: '',
            password: '',
    }

    const [formData, setFormData] = useState(defaultData);

    const handleChange = (e) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
    };

    const handleSubmit = async (e) => {
            e.preventDefault();

            if (loading) return;

            setLoading(true);
            try {
                
                const response = await axios.post("/user/login", formData, { withCredentials: true }, {
                    headers: { "Content-Type": "application/json" }
                });
                console.log("Login successful:", response.data);
                alert("Login successful!");
                setUser(response.data)
                setFormData(defaultData); 
                socket.connect();
                navigate(`/`);
            } catch (err) {
                console.error(err.response?.data?.error);
                alert(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
  return (
    <div>
        <h1>Sign in</h1>
        <div className="form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                        id="username"
                        name="username"
                        className="form-input"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                        id="password"
                        name="password"
                        type="password"
                        className="form-input"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        />
                    </div>
                    <br></br>
                    <button type="submit" disabled={loading}>Login</button>
                </form>
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