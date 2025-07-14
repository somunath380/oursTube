import { useState } from 'react';
import { Link } from 'react-router-dom';
import Search from '../search/search';
import type { NavbarProps } from '../../interfaces/navbar';
import Profile from '../../pages/Profile';

const Navbar = ({ onUpload, setVideos, setLoading }: NavbarProps) => {
    const [showProfile, setShowProfile] = useState(false);
    const [mobileSearchActive, setMobileSearchActive] = useState(false);
    const [mobileSearchValue, setMobileSearchValue] = useState('');

  // Mobile search submit handler
    const handleMobileSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setVideos([]); // Optionally clear videos while searching
        // You can call your searchVideos service here if you want instant search
        setLoading(false);
        setMobileSearchActive(false);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-3">
            <div className="container-fluid">
                <div className={"w-100 d-flex align-items-center d-lg-none" + (mobileSearchActive ? '' : ' d-none')} style={{ minHeight: 56 }}>
                    <button className="btn btn-dark p-1 me-2" onClick={() => setMobileSearchActive(false)}>
                        <i className="bi bi-arrow-left" style={{ fontSize: 22 }}></i>
                    </button>
                    <form onSubmit={handleMobileSearch} className="flex-grow-1 d-flex align-items-center" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary rounded-pill ps-3 pe-5"
                            placeholder="Search"
                            value={mobileSearchValue}
                            onChange={e => setMobileSearchValue(e.target.value)}
                            style={{ height: 40 }}
                        />
                            <button type="submit" className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center px-3" style={{ border: 'none', background: 'none' }}>
                            <i className="bi bi-search" style={{ fontSize: 20, color: '#fff' }}></i>
                        </button>
                    </form>
                </div>
                <div className={mobileSearchActive ? 'd-none d-lg-flex w-100' : 'd-flex w-100 align-items-center justify-content-between'} style={{ minHeight: 56 }}>
                    <div className="d-flex align-items-center">
                        <Link to="/" className="navbar-brand d-flex align-items-center">
                            <svg height="24" viewBox="0 0 90 20" focusable="false" style={{ fill: '#0066ff' }}>
                                <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#0066ff"></path>
                                <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
                            </svg>
                            <span className="ms-2 fw-bold">OursTube</span>
                        </Link>
                    </div>
                    <div className="flex-grow-1 mx-3 d-none d-lg-block">
                        <Search setVideos={setVideos} setLoading={setLoading} />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-dark d-lg-none" onClick={() => setMobileSearchActive(true)}>
                            <i className="bi bi-search" style={{ fontSize: 22 }}></i>
                        </button>
                        <button className="btn btn-dark d-lg-none" onClick={onUpload}>
                            <i className="bi bi-plus-lg" style={{ fontSize: 22 }}></i>
                        </button>
                        <button className="btn btn-dark d-none d-lg-flex align-items-center" onClick={onUpload}>
                            <i className="bi bi-plus-lg" style={{ fontSize: 22 }}></i>
                            <span className="d-none d-md-inline ms-1">Create</span>
                        </button>
                        <button className="btn btn-dark d-none d-lg-flex">
                            <i className="bi bi-bell" style={{ fontSize: 22 }}></i>
                        </button>
                        <button className="btn btn-dark rounded-circle d-none d-lg-flex" onClick={() => setShowProfile(true)}>
                            <i className="bi bi-person-circle" style={{ fontSize: 22 }}></i>
                        </button>
                    </div>
                </div>
                {showProfile && <Profile onClose={() => setShowProfile(false)} />}
            </div>
        </nav>
    );
};

export default Navbar; 