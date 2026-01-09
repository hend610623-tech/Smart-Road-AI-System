
import React, { useState, useEffect } from 'react';
import { Coordinates } from '../types';
import { LoaderIcon, PinIcon } from './Icons';

const MapView: React.FC = () => {
    const [location, setLocation] = useState<Coordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setIsLoading(false);
            return;
        }

        const success = (position: GeolocationPosition) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            setIsLoading(false);
            setError(null);
        };

        const errorCallback = (err: GeolocationPositionError) => {
            setError(`Unable to retrieve your location: ${err.message}`);
            setIsLoading(false);
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        const watchId = navigator.geolocation.watchPosition(success, errorCallback, options);

        return () => navigator.geolocation.clearWatch(watchId);

    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                    <LoaderIcon className="w-12 h-12 mb-4" />
                    <p>Fetching your location...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-red-400 p-4">
                    <PinIcon className="w-12 h-12 mb-4 text-red-500" />
                    <p className="text-center">{error}</p>
                </div>
            );
        }

        if (location) {
            // Increased zoom level to 18 for more specific location detail.
            const mapSrc = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=18&output=embed`;
            return (
                <iframe
                    title="Live User Location Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={mapSrc}
                ></iframe>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col h-full bg-background">
             <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Live Map</h2>
                <p className="text-sm text-gray-300">Your current location is shown below.</p>
            </div>
            <div className="flex-grow bg-background">
                {renderContent()}
            </div>
        </div>
    );
};

export default MapView;