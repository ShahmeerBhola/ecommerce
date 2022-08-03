import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { CartIcon } from '../Cart';
import { PhotoContainer } from '../Container';
import { SearchBarContext, SearchBarInput } from '../Search';
import { HamburgerMenuIcon, MagnifyingGlassIcon } from '../Icons';
import Text from '../Text';
import Logo from '../Logo';
import { constructUrl } from '../../utils';
import { menu as menuLinks } from '../../config';

type Props = {
  transparent: boolean;
  title?: string;
};

const Header: React.FunctionComponent<Props> = ({ transparent, title }) => {
  const [navIsOpen, updateNavOpenState] = useState<boolean>(false);
  const { toggleOpen: toggleSearchBarOpen } = useContext<SearchBar.Context>(SearchBarContext);

  const handleMobileHamburgerIconClick = (): void => updateNavOpenState(!navIsOpen);

  return (
    <header className={`w-full text-white z-10 ${transparent ? ' absolute top-0 inset-x-0' : ''}`}>
      <PhotoContainer image={!transparent ? 'header_background.jpg' : ''} containerPaddingY="py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center">
            <div className="hidden md:flex items-center">
              {menuLinks.map(({ url, text }) => (
                <Link key={url.page} href={constructUrl(url)}>
                  <a className="mr-10">{text}</a>
                </Link>
              ))}
            </div>
            <div className="mr-10">
              <CartIcon />
            </div>
            <HamburgerMenuIcon className={`md:hidden flex cursor-pointer`} onClick={handleMobileHamburgerIconClick} />
            <div className="hidden md:flex cursor-pointer h-25px w-25px">
              <MagnifyingGlassIcon onClick={toggleSearchBarOpen} />
            </div>
          </div>
        </div>
        {title && (
          <div className="w-full md:w-1/2 mt-8">
            <Text color="text-white" weight="font-bold" size="text-3xl" className="uppercase">
              {title}
            </Text>
          </div>
        )}
      </PhotoContainer>
      {navIsOpen && (
        <div className="flex flex-col md:hidden bg-gray-600 pb-8 px-5">
          <div className="mt-8">
            <SearchBarInput altStyle />
          </div>
          {menuLinks.map(({ url, text }) => (
            <div key={url.page} className="mt-8 flex items-center">
              <div className="border-solid border-l-2 border-red-100 mr-3 h-5"></div>
              <Link href={constructUrl(url)}>
                <a className="mr-10">{text}</a>
              </Link>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
