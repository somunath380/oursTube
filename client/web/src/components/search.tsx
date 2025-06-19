import React from 'react';

const Search = () => {
  return (
    <div className="d-flex justify-content-center flex-grow-1 mx-5">
    <form className="d-flex w-50">
        <input 
            className="form-control bg-dark text-white border-secondary" 
            type="search" 
            placeholder="Search" 
            aria-label="Search"
        />
        <button className="btn btn-outline-secondary ms-2" type="submit">
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