import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/bundle';
import { FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking, FaShare } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Listing = () => {
  const { listingId } = useParams();
  const { currentUser } = useSelector(state => state.user);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (res.status === 200) {
          setListing(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600 animate-pulse">
          Loading<span className="dot-animate">...</span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <p className="text-lg font-semibold text-red-600 border border-red-400 bg-red-100 p-4 rounded-md shadow-sm">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
    );
  }

  return (
    listing && (
      <main className="w-full bg-gray-50">
        {/* Swiper Carousel */}
        <Swiper
          navigation
          modules={[Navigation]}
          className="rounded-lg overflow-hidden shadow-lg mb-6"
        >
          {listing.imageUrls.map(url => (
            <SwiperSlide key={url}>
              <div
                className="h-[500px] w-full"
                style={{
                  background: `url(${url}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Share Button */}
        <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
          <FaShare
            className="text-slate-500"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          />
        </div>
        {copied && (
          <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
            Link copied!
          </p>
        )}

        {/* Listing Details */}
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            {listing.name} - $
            {listing.offer
              ? listing.discountPrice.toLocaleString()
              : listing.regularPrice.toLocaleString()}
            {listing.type === 'rent' && ' / month'}
          </h1>
          <p className="flex items-center text-gray-600 text-sm mb-4">
            <FaMapMarkerAlt className="text-green-700 mr-2" />
            {listing.address}
          </p>
          <div className="flex gap-4 mb-4">
            <span className="bg-red-900 text-white px-4 py-1 rounded-md">
              {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            {listing.offer && (
              <span className="bg-green-900 text-white px-4 py-1 rounded-md">
                ${(+listing.regularPrice - +listing.discountPrice).toLocaleString()} OFF
              </span>
            )}
          </div>
          <p className="mb-4">
            <span className="font-semibold text-lg">Description: </span>
            {listing.description}
          </p>
          <ul className="flex flex-wrap gap-4">
            <li className="flex items-center gap-2">
              <FaBed className="text-lg" />
              {listing.bedrooms} {listing.bedrooms > 1 ? 'Beds' : 'Bed'}
            </li>
            <li className="flex items-center gap-2">
              <FaBath className="text-lg" />
              {listing.bathrooms} {listing.bathrooms > 1 ? 'Baths' : 'Bath'}
            </li>
            <li className="flex items-center gap-2">
              <FaParking className="text-lg" />
              {listing.parking ? 'Parking Spot' : 'No Parking'}
            </li>
            <li className="flex items-center gap-2">
              <FaChair className="text-lg" />
              {listing.furnished ? 'Furnished' : 'Unfurnished'}
            </li>
          </ul>
          {currentUser && listing.userRef !== currentUser._id && !contact && (
            <button
              onClick={() => setContact(true)}
              className="bg-slate-700 text-white mt-4 rounded-lg uppercase hover:opacity-95 p-3"
            >
              Contact Landlord
            </button>
          )}
        </div>
      </main>
    )
  );
};

export default Listing;
