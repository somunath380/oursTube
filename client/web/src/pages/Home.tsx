import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import VideoCard from '../components/videoCard';
import UploadVideo from '../modals/uploadVideo';
import { mockVideos } from '../data';
import type { Video } from '../interfaces';

const Home: React.FC = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);

    return (
        <div className="min-vh-100">
            <Navbar onUpload={() => setShowUploadModal(true)} />
            {/* <--------Videos Grid here -------->*/}
            <div className="container-fluid px-4 mt-5">
                <div className="row g-4">
                    {mockVideos.map((video: Video, index: number) => (
                        <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <VideoCard {...video} />
                        </div>
                    ))}
                </div>
            </div>
            <UploadVideo 
                isOpen={showUploadModal} 
                onClose={() => setShowUploadModal(false)} 
            />
        </div>
    );
};

export default Home; 