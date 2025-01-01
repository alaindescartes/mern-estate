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
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Create a listing</h1>
      <form className="flex flex-col sm:flex-row gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 flex-1 ">
          <input
            type={'text'}
            placeholder={'Name'}
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleInputChange}
            value={formData.name}
          />{' '}
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleInputChange}
            value={formData.description}
          />{' '}
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            maxLength="62"
            minLength="10"
            required
            onChange={handleInputChange}
            value={formData.address}
          />
          <div className=" flex gap-6 flex-wrap ">
            <div className=" flex gap-2">
              <input
                type="checkbox"
                className="w-5 "
                id="sale"
                onChange={handleInputChange}
                checked={formData.type === 'sale'}
              />
              <span>Sell</span>
            </div>
            <div className=" flex gap-2">
              <input
                type="checkbox"
                className="w-5 "
                id="rent"
                onChange={handleInputChange}
                checked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className=" flex gap-2">
              <input
                type="checkbox"
                className="w-5 "
                id="parking"
                onChange={handleInputChange}
                checked={formData.parking}
              />
              <span>Parking Spot</span>
            </div>
            <div className=" flex gap-2">
              <input
                type="checkbox"
                className="w-5 "
                id="furnished"
                onChange={handleInputChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className=" flex gap-2">
              <input
                type="checkbox"
                className="w-5 "
                id="offer"
                onChange={handleInputChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 ">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleInputChange}
                value={formData.bedrooms}
              />
              <p>Bedrooms</p>
            </div>
            <div className="flex items-center gap-2 ">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleInputChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2 ">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleInputChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center ">
                <p>Regular Price</p>
                <span className="text-sm">($/Month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2 ">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="1000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleInputChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center ">
                  <p>Discount Price</p>
                  <span className="text-sm">($/Month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:{' '}
            <span className="font-normal text-gray-600 ml-2">
              the first image will be the cover(max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              type={'file'}
              id="images"
              accept="image/*"
              multiple
              className="p-3 border border-gray-300 rounded w-full"
              onChange={event => setFiles(event.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className="text-sm text-red-700 text-center">
            {imageUploadError.error ? imageUploadError.message : ''}
          </p>
          {formData.imageUrls?.length > 0 &&
            formData.imageUrls.map((imageUrl, index) => (
              <div className="flex justify-between p-3 border items-center" key={index}>
                <img
                  alt="listing image"
                  src={imageUrl}
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  onClick={() => handleImageDeletion(index)}
                  type="button"
                  className="p-3 rounded-lg hover:opacity-75 text-red-700 uppercase"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="uppercase p-3 bg-slate-700  text-white rounded-lg hover:opacity-95 disabled:opacity-80"
          >
            {loading ? 'Creating listing...' : 'Create listing'}
          </button>
          <p className="text-sm text-red-700 text-center">{error ? error : ''}</p>
        </div>
      </form>
    </main>
  );
};
export default CreateListing;
