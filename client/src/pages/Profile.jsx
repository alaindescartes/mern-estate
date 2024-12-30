import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import imageCompression from 'browser-image-compression';
import { app } from '../firebaseConfig.js';

function Profile() {
  const currentUser = useSelector(state => state.user.currentUser);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});

  const auth = getAuth(app);
  console.log(auth.currentUser);
  async function handleFileUpload(selectedFile) {
    let fileToUpload = selectedFile;

    if (fileToUpload.type.startsWith('image/')) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        console.log('Original file size:', (fileToUpload.size / 1024 / 1024).toFixed(2), 'MB');

        fileToUpload = await imageCompression(fileToUpload, options);

        console.log('Compressed file size:', (fileToUpload.size / 1024 / 1024).toFixed(2), 'MB');
      } catch (compressionError) {
        console.error('Compression failed; proceeding with original file:', compressionError);
      }
    }

    const storage = getStorage(app);
    const fileName = `${Date.now()}_${fileToUpload.name}`;
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
        console.log('Error:', error);
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

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4">
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

        <input type="text" placeholder="username" className="border p-3 rounded-lg" id="username" />
        <input type="text" placeholder="email" className="border p-3 rounded-lg" id="email" />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password"
        />
        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">
          Update
        </button>
      </form>
      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete Account</span>
        <span className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
}

export default Profile;
