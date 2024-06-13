import React, { useState } from 'react';
import Add from "../img/images.png";
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

const Login = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setErr(true);
    }
  };

  return (
    <div className='FormContainer'>
      <div className='FormWrapper'>
        <span className='logo'>Lama Chat</span>
        <span className='title'>Login</span>

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder='Email' />
          <input type="password" placeholder='Password' />
          
          <button>Sign In</button>
          
          {err && <span>Invalid email or password. Please try again.</span>}
        </form>

        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
