import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupStart, signupFailure, signupSuccess } from '../redux/user/userSlice.js';
import OAuth from '../_components/OAuth.jsx';

function SignIn() {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const { error, loading } = useSelector(state => state.user);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      dispatch(signupStart());
      const response = await fetch('/api/auth/signin', {
        // withCredentials: true,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success === false) {
        dispatch(signupFailure(data.message));
        return;
      }
      dispatch(signupSuccess(data));
      navigate('/');
      console.log(data);
    } catch (error) {
      dispatch(signupFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
        <input
          type="text"
          placeholder="email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading' : ' Sign In'}
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>dont have an account</p>
        <Link to={'/sign-up'}>
          <span className="text-blue-700">Sign up</span>
        </Link>
      </div>
      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
}

export default SignIn;
