import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import VideoCard from '../components/videoCard';
import UploadVideo from '../modals/UploadVideo';
import type { Video } from '../interfaces';
import { getAllVideos } from '../services/VideoService';
import VideoPlayer from '../components/videoPlayer';
import { useAuth } from '../hooks/useAuth';
import { LoginButton } from '../components/Login';
import NotificationCard from '../components/NotificationCard';

const API_URL = import.meta.env.VITE_API_URL;

const Home: React.FC = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const {user} = useAuth()
    const [notification, setNotification] = useState<{
        isVisible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        isVisible: false,
        message: '',
        type: 'info'
    });

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
    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({
            isVisible: true,
            message,
            type
        });
    };
    const hideNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };
    const handleVideoUploaded = (videoId: string) => {
        // Show initial notification
        showNotification('Video uploaded! Processing in progress...', 'info');
        
        // Set up SSE connection
        const sse = new EventSource(`${API_URL}/video/sse/${videoId}`);
        
        sse.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('SSE message received:', data);
            
            if (data.status === 'uploaded') {
                showNotification('Video uploaded and processed successfully!', 'success');
                sse.close();
                // Refresh video list
                getAllVideos().then(fetchedVideos => {
                    setVideos(fetchedVideos.data.videos);
                });
            }
        };
        
        sse.onerror = (error) => {
            console.error('SSE error:', error);
            showNotification('Connection error. Please check upload status.', 'error');
            sse.close();
        };
    };
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
                        {videos.map((video, index) => {
                            return (
                                <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <VideoCard
                                        {...video}
                                        onClick={() => setSelectedVideo(video)}
                                    />
                                </div>
                            );
                        })}
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
            onVideoUploaded={handleVideoUploaded}
        />
        <NotificationCard
            message={notification.message}
            type={notification.type}
            isVisible={notification.isVisible}
            onClose={hideNotification}
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
                    src={`${API_URL}/video/manifest/${selectedVideo.filepath}`}
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