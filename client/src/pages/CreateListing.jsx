import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebaseConfig.js';
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom';

const CreateListing = () => {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    type: 'rent',
    bathrooms: 1,
    bedrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const fireBaseUser = useSelector(state => state.firebaseUser.firebaseUser);
  const [imageUploadError, setImageUploadError] = useState({ error: false, message: '' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector(state => state.user.currentUser);
  const navigate = useNavigate();

  function handleInputChange(event) {
    if (event.target.id === 'sale' || event.target.id === 'sale') {
      setFormData({ ...formData, type: event.target.id });
    }
    if (
      event.target.id === 'parking' ||
      event.target.id === 'furnished' ||
      event.target.id === 'offer'
    ) {
      setFormData({ ...formData, [event.target.id]: event.target.checked });
    }
    if (
      event.target.type === 'number' ||
      event.target.type === 'text' ||
      event.target.type === 'textarea'
    ) {
      setFormData({ ...formData, [event.target.id]: event.target.value });
    }
  }

  async function compressImage(file) {
    try {
      const options = {
        maxSizeMB: 1, // Maximum size in MB
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true, // Enable web workers for better performance
      };

      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      const compressedFile = await imageCompression(file, options);

      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

      return compressedFile;
    } catch (error) {
      console.error('Image compression error:', error);
      return file;
    }
  }
  async function storeImage(file) {
    return new Promise(async (resolve, reject) => {
      try {
        const compressedFile = await compressImage(file); // Compress the image

        const storage = getStorage(app);
        const fileName = `${fireBaseUser.id}_${new Date().getTime()}_${compressedFile.name}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          error => {
            console.error('Upload error:', error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then(downloadURL => {
                resolve(downloadURL);
              })
              .catch(error => {
                console.error('Error getting download URL:', error);
                reject(error);
              });
          },
        );
      } catch (error) {
        console.error('Store image error:', error);
        reject(error);
      }
    });
  }

  function handleImageSubmit() {
    // Convert files from FileList to an array
    const fileArray = Array.from(files);

    if (fileArray.length > 0 && fileArray.length + (formData.imageUrls?.length || 0) <= 6) {
      setUploading(true);
      setImageUploadError({ error: false, message: '' });
      const promises = fileArray.map(file => storeImage(file));

      Promise.all(promises)
        .then(urls => {
          setFormData(prevFormData => ({
            ...prevFormData,
            imageUrls: (prevFormData.imageUrls || []).concat(urls),
          }));
          setImageUploadError({ error: false, message: '' });
          setUploading(false);
        })
        .catch(error => {
          setImageUploadError({ error: true, message: error.message });
          setUploading(false);
        });
    } else {
      setImageUploadError({
        error: true,
        message:
          'Invalid number of images. Ensure at least one file is selected and no more than 6 images total.',
      });
      setUploading(false);
    }
  }

  function handleImageDeletion(index) {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (formData.imageUrls.length < 1) {
        setError('you must upload at least one image');
        return;
      }

      if (+formData.regularPrice < +formData.discountPrice) {
        setError('Discount price must be lower than regular price');
        return;
      }
      setLoading(true);
      setError(false);

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });

      if (res.status === 201) {
        const data = await res.json();
        console.log('listing: ', data);
        setLoading(false);
        navigate(`/listing/${data._id}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        setLoading(false);
        setError(errorData.message);
        return;
      }
    } catch (error) {
      console.log('error when updating listing', error);
      setLoading(false);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center my-8 text-gray-800">Create a Listing</h1>
      <form className="flex flex-col sm:flex-row gap-8" onSubmit={handleSubmit}>
        {/* Left Section */}
        <div className="flex flex-col gap-6 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleInputChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="description"
            required
            onChange={handleInputChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="address"
            maxLength="62"
            minLength="10"
            required
            onChange={handleInputChange}
            value={formData.address}
          />
          <div className="flex flex-wrap gap-6">
            {[
              { id: 'sale', label: 'Sell', checked: formData.type === 'sale' },
              { id: 'rent', label: 'Rent', checked: formData.type === 'rent' },
              { id: 'parking', label: 'Parking Spot', checked: formData.parking },
              { id: 'furnished', label: 'Furnished', checked: formData.furnished },
              { id: 'offer', label: 'Offer', checked: formData.offer },
            ].map(option => (
              <label key={option.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={option.id}
                  className="w-5 h-5 accent-blue-500"
                  onChange={handleInputChange}
                  checked={option.checked}
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { id: 'bedrooms', label: 'Bedrooms', value: formData.bedrooms, min: 1, max: 10 },
              { id: 'bathrooms', label: 'Baths', value: formData.bathrooms, min: 1, max: 10 },
              {
                id: 'regularPrice',
                label: 'Regular Price',
                value: formData.regularPrice,
                min: 50,
                max: 1000000,
              },
            ].map(field => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="number"
                  id={field.id}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={field.min}
                  max={field.max}
                  required
                  onChange={handleInputChange}
                  value={field.value}
                />
                <span className="text-gray-700">{field.label}</span>
              </div>
            ))}
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="1000000"
                  required
                  onChange={handleInputChange}
                  value={formData.discountPrice}
                />
                <span className="text-gray-700">Discount Price</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-6 flex-1">
          <p className="font-semibold text-gray-800">
            Images:
            <span className="font-normal text-gray-500 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={event => setFiles(event.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-white bg-blue-600 rounded-lg uppercase hover:bg-blue-700 transition disabled:opacity-80"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className="text-sm text-red-600 text-center">
            {imageUploadError.error ? imageUploadError.message : ''}
          </p>
          {formData.imageUrls?.length > 0 &&
            formData.imageUrls.map((imageUrl, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt="listing image"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleImageDeletion(index)}
                  type="button"
                  className="p-2 text-red-600 rounded-lg hover:opacity-75 uppercase font-semibold"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="p-3 bg-blue-600 text-white rounded-lg uppercase hover:bg-blue-700 transition disabled:opacity-80"
          >
            {loading ? 'Creating listing...' : 'Create Listing'}
          </button>
          <p className="text-sm text-red-600 text-center">{error || ''}</p>
        </div>
      </form>
    </main>
  );
};
export default CreateListing;
