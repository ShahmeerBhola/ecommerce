import React, { useState } from 'react';

export const SearchBarContext = React.createContext<SearchBar.Context>({
  isOpen: false,
  toggleOpen: (): void => console.log('hello'),
});

const SearchBarProvider: React.FunctionComponent = ({ children }) => {
  const [isOpen, updateOpen] = useState<boolean>(false);
  const toggleOpen = (): void => {
    const bodyElementClasses = (document.querySelector('body') as HTMLBodyElement).classList;
    const scrollDisabledClass = 'overflow-hidden';

    if (!isOpen) {
      window.scrollTo(0, 0); // prevents if user is just slightly scrolled down then clicks scroll icon
      bodyElementClasses.add(scrollDisabledClass);
    } else {
      bodyElementClasses.remove(scrollDisabledClass);
    }

    updateOpen(!isOpen);
  };

  return <SearchBarContext.Provider value={{ isOpen, toggleOpen }}>{children}</SearchBarContext.Provider>;
};

export default SearchBarProvider;
