import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';

export default function ListingItem({ listing }) {
  return (
    <div className="bg-white shadow-lg hover:shadow-2xl transition-shadow overflow-hidden rounded-xl w-full sm:w-[330px] m-4 border border-gray-200">
      <Link to={`/listing/${listing._id}`}>
        <div className="relative group">
          <img
            src={
              listing.imageUrls[0] ||
              'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg'
            }
            alt="listing cover"
            className="h-[320px] sm:h-[220px] w-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold py-1 px-2 rounded-md shadow-md">
            {listing.offer ? 'Discount' : 'For Sale'}
          </span>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <p className="truncate text-lg font-semibold text-gray-800">{listing.name}</p>
          <div className="flex items-center gap-1 text-gray-600">
            <MdLocationOn className="h-5 w-5 text-green-700" />
            <p className="text-sm truncate">{listing.address}</p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
          <p className="text-lg text-green-700 mt-2 font-bold">
            $
            {listing.offer
              ? listing.discountPrice.toLocaleString('en-US')
              : listing.regularPrice.toLocaleString('en-US')}
            {listing.type === 'rent' && ' / month'}
          </p>
          <div className="flex items-center gap-6 mt-2 text-sm text-gray-700">
            <span className="font-semibold">
              {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : `${listing.bedrooms} Bed`}
            </span>
            <span className="font-semibold">
              {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : `${listing.bathrooms} Bath`}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
