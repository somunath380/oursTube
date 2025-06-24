import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import VideoCard from '../components/videoCard';
import UploadVideo from '../modals/UploadVideo';
import type { Video } from '../interfaces';
import { getAllVideos } from '../services/VideoService';
import VideoPlayer from '../components/videoPlayer';
import { useAuth } from '../hooks/useAuth';
import { LoginButton } from '../components/Login';

const Home: React.FC = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const {user} = useAuth()

    useEffect(() => {
        if (!user) {
            setLoading(false); // stop loading spinner if not logged in
            return;
        }
        setLoading(true);
        const fetchVideos = async () => {
            try {
                const fetchedVideos = await getAllVideos();
                setVideos(fetchedVideos.data.videos);
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [user]);
    if (!user) {
        return <LoginButton />;
    }
    return (
        <div className="min-vh-100" style={{ paddingTop: '60px' }}>
        <Navbar
            onUpload={() => setShowUploadModal(true)}
            setVideos={setVideos}
            setLoading={setLoading}
        />
        <div className="container-fluid px-4 mt-5" style={{ marginTop: '90px' }}>
            {loading ? (
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            ) : (
            <div className="container-fluid px-4 mt-5">
                {videos.length === 0 ? (
                    <div className="text-center text-secondary" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>
                        No videos found.
                    </div>
                    ) : (
                    <div className="row g-4">
                        {videos.map((video, index) => (
                        <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <VideoCard
                            {...video}
                            onClick={() => setSelectedVideo(video)}
                            />
                        </div>
                        ))}
                    </div>
                    )}
            </div>
            )}
        </div>
        <UploadVideo
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={() => {
                setLoading(true);
                getAllVideos().then(fetchedVideos => {
                setVideos(fetchedVideos.data.videos);
                setLoading(false);
                });
            }}
        />
        {/* Video Modal/Player */}
        {selectedVideo && (
            <div
                className="video-modal-backdrop"
                style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.85)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                }}
                onClick={() => setSelectedVideo(null)}
            >
                <div
                style={{
                    position: 'relative',
                    background: '#181818',
                    borderRadius: 12,
                    boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    width: '900px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 0,
                }}
                onClick={e => e.stopPropagation()}
                >
                <button
                    onClick={() => setSelectedVideo(null)}
                    style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 32,
                    cursor: 'pointer',
                    zIndex: 2,
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    }}
                    aria-label="Close"
                >
                    &times;
                </button>
                <div style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '16/9',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    overflow: 'hidden',
                }}>
                    <VideoPlayer
                    src={`/api/v1/video/manifest/${selectedVideo.filepath}`}
                    controls
                    autoPlay
                    style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '70vh',
                        background: '#000',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                    />
                </div>
                <div style={{
                    width: '100%',
                    padding: '16px 24px',
                    color: '#fff',
                    textAlign: 'left',
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    background: '#181818',
                }}>
                    <h5 style={{ margin: 0 }}>{selectedVideo.title}</h5>
                </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default Home;