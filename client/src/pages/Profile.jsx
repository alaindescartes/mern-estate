import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { app } from '../firebaseConfig.js';
import { updateUserStart, updateUserSuccess, updateUserFailure } from '../redux/user/userSlice.js';

function Profile() {
  const { currentUser, loading, error } = useSelector(state => state.user);
  const firebaseUser = useSelector(state => state.firebaseUser.firebaseUser);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [updateSuccess, setUpdateSuccess] = useState(false);

  async function handleFileUpload(selectedFile) {
    // Ensure Firebase user is available
    if (!firebaseUser) {
      console.error('Firebase user is not authenticated. Cannot proceed with file upload.');
      setFileUploadError(true);
      alert('You must be logged in to upload files.');
      return;
    }

    let fileToUpload = selectedFile;

    // Compress image if applicable
    if (fileToUpload.type.startsWith('image/')) {
      try {
        const options = {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1920, // Max dimensions
          useWebWorker: true,
        };

        fileToUpload = await imageCompression(fileToUpload, options);
      } catch (compressionError) {
        console.error('Compression failed; proceeding with original file:', compressionError);
      }
    }

    // Use Firebase Storage for uploading
    const storage = getStorage(app);
    const fileName = `${firebaseUser.id}_${Date.now()}_${fileToUpload.name}`; // Include firebaseUser.uid
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercentage(prevProgress => {
          if (Math.round(progress) !== prevProgress) {
            return Math.round(progress);
          }
          return prevProgress;
        });
      },
      error => {
        setFileUploadError(true);
        console.error('Error during upload:', error);
        switch (error.code) {
          case 'storage/unauthorized':
            alert('You do not have permission to upload this file.');
            break;
          case 'storage/canceled':
            alert('Upload canceled by the user.');
            break;
          case 'storage/unknown':
            alert('An unknown error occurred.');
            break;
          default:
            alert('Upload failed.');
        }
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prevFormData => ({ ...prevFormData, avatar: url }));
          setFilePercentage(100);
          console.log('File uploaded successfully:', url);
        } catch (err) {
          console.error('Error fetching download URL:', err);
        }
      },
    );
  }
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 200) {
        const data = await res.json();
        dispatch(updateUserSuccess(data.results));
        setUpdateSuccess(true);
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error('HTTP Error:', errorData);
        dispatch(updateUserFailure(errorData.message || 'An error occurred'));
        return;
      }
    } catch (error) {
      dispatch(updateUserFailure(error.message || 'Network error occurred'));
    }
  }
  // console.log(currentUser);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          onChange={e => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={formData?.avatar || currentUser.avatar}
          alt="profile image"
          onClick={() => fileRef.current.click()}
        />

        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">Error Image Upload</span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePercentage}%`}</span>
          ) : filePercentage === 100 ? (
            <span className="text-green-700">Image Successfully Uploaded</span>
          ) : (
            ''
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          className="border p-3 rounded-lg"
          id="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          type="text"
          defaultValue={currentUser.email}
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
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'updating...' : 'update'}
        </button>
      </form>
      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete Account</span>
        <span className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
      <p className="text-sm text-red-700 mt-5">{error ? error : ''}</p>
      <p className="text-sm text-green-700 mt-5">
        {updateSuccess ? 'User updated successfully' : ''}
      </p>
    </div>
  );
}

export default Profile;
