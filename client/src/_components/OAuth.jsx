import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { signupStart, signupSuccess, signupFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebaseConfig.js';
import { setFirebaseUser } from '../redux/firebaseUser/firebaseUserSlice.js';

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      // Indicate loading in your Redux state
      dispatch(signupStart());

      // Initialize Firebase Auth
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      // 1. Set session persistence to local:
      //    - This ensures the user remains logged in after a browser restart.
      await setPersistence(auth, browserLocalPersistence);

      // 2. Trigger Google Sign-In with a popup
      const result = await signInWithPopup(auth, provider);

      // 3. Extract user details from the sign-in result
      const user = {
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        id: result.user.uid,
      };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photoUrl: result.user.photoURL,
        }),
      });

      const data = await res.json();

      // 4. Dispatch success action to store user data in Redux
      dispatch(signupSuccess(data));
      dispatch(setFirebaseUser(user));

      // 5. Navigate to a protected route (e.g., Profile page)
      navigate('/profile');
    } catch (error) {
      console.error('Google sign-in failed:', error);
      dispatch(signupFailure(error.message));
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="bg-red-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
    >
      Continue with Google
    </button>
  );
};

export default OAuth;
