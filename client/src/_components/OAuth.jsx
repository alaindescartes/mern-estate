import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebaseConfig.js';
import { useDispatch } from 'react-redux';
import { signupSuccess } from '../redux/user/userSlice.js';
import { useNavigate } from 'react-router-dom';

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);
      const dataToSend = {
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      };
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      dispatch(signupSuccess(data));
      navigate('/');
    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };
  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="bg-red-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
    >
      continue with Google
    </button>
  );
};
export default OAuth;
