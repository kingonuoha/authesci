'use client';
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch }) => {
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = event.currentTarget.search.value;
    onSearch(query);
  };

  return (
    <form className="navbar-search relative" onSubmit={handleSearch}>
      <label htmlFor="job-search-input" className="sr-only">{placeholder}</label>
      <input
        type="text"
        name="search"
        id="job-search-input"
        placeholder={placeholder}
        className="form-control bg-neutral-100 dark:bg-neutral-700 border-none rounded-full ps-6 pe-12 h-12"
      />
      <button type="submit" className="absolute top-1/2 right-4 -translate-y-1/2" aria-label="Search">
        <Search className="icon" aria-hidden="true" />
      </button>
    </form>
  );
};

export default SearchBar;
