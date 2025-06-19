import React from 'react';
import Navbar from '../components/Navbar';
import VideoCard from '../components/videoCard';
import { mockVideos } from '../data';
import type { Video } from '../interfaces';

const Home: React.FC = () => {
    return (
        <div className="min-vh-100">
            <Navbar />
            {/* Videos Grid */}
            <div className="container-fluid px-4 mt-5">
                <div className="row g-4">
                    {mockVideos.map((video: Video, index: number) => (
                        <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <VideoCard {...video} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home; 