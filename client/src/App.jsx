import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Header from './_components/Header';
import About from './pages/About';
import PrivateRoute from './_components/PrivateRoute.jsx';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { app } from './firebaseConfig.js';
import { setFirebaseUser } from './redux/firebaseUser/firebaseUserSlice.js';
import CreateListing from './pages/CreateListing.jsx';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth(app);

    // Listen for user state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        // Re-dispatch user data to Redux
        dispatch(
          setFirebaseUser({
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL,
            id: user.uid,
          }),
        );
      }
    });

    return () => {
      // Clean up listener on unmount
      unsubscribe();
    };
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-listing" element={<CreateListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
