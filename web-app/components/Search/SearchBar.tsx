import React, { useContext } from 'react';
import { CloseIcon } from '../Icons';
import { SearchBarContext } from './SearchBarContext';
import SearchBarInput from './SearchBarInput';

const SearchBar: React.FunctionComponent = () => {
  const { isOpen, toggleOpen } = useContext<SearchBar.Context>(SearchBarContext);

  if (isOpen) {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 z-20 flex-col transition-opacity">
        <div className="flex bg-white py-5 px-10 items-center">
          <SearchBarInput onEnterKeyDown={toggleOpen} />
          <CloseIcon className="ml-5" onClick={toggleOpen} />
        </div>
      </div>
    );
  }
  return null;
};

export default SearchBar;
