import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/bundle';
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import { useParams } from 'react-router-dom';

const Listing = () => {
  SwiperCore.use([Navigation]);
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true);
        const listings = await fetch(`/api/listing/get/${listingId}`);
        const data = await listings.json();
        if (listings.status === 200) {
          console.log('listings ', data);
          setListing(data);
        } else {
          console.log('error getting listings ', data);
          setError(data.message);
        }
      } catch (err) {
        console.log('error getting listings ', err);
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
    listing &&
    !error &&
    !loading && (
      <>
        <Swiper navigation>
          {listing.imageUrls.map(url => (
            <SwiperSlide key={url}>
              <div
                className="h-[500px]"
                style={{
                  background: `url(${url}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
};

export default Listing;
