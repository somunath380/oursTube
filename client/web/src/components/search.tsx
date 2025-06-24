import { useState } from 'react';
import { searchVideos, getAllVideos } from '../services/VideoService';
import type { Video } from '../interfaces';

interface SearchProps {
  setVideos: (videos: Video[]) => void;
  setLoading: (loading: boolean) => void;
}

const Search = ({ setVideos, setLoading }: SearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (searchQuery.trim() === '') {
        const fetchedVideos = await getAllVideos();
        setVideos(fetchedVideos.data.videos);
      } else {
        const result = await searchVideos(searchQuery);
        setVideos(result.data.videos);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center flex-grow-1 mx-5">
      <form className="d-flex w-50" onSubmit={handleSearch}>
        <input
          className="form-control text-white border-secondary white-placeholder"
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-dark ms-2" type="submit">
          <i className="bi bi-search"></i>
        </button>
        <button className="btn btn-dark ms-2" type="button">
          <i className="bi bi-mic"></i>
        </button>
      </form>
    </div>
  );
};

export default Search;