import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { constructUrl, modifyQueryParam } from '../../utils';

type Props = {
  altStyle?: boolean;
  onEnterKeyDown?: () => void;
};

const SearchBarInput: React.FunctionComponent<Props> = ({ altStyle = false, onEnterKeyDown }) => {
  const router = useRouter();
  const [searchValue, updateSearchValue] = useState<string>(router.query.s as string);

  const dontRedirectToSearchPageRoutes = [
    '/category/[slug]',
    '/category/[slug]/[brandSlug]',
    '/category/[slug]/brands',
  ];

  const handleSearchQueryChange = ({ currentTarget: { value } }: Forms.ChangeEvent): void => updateSearchValue(value);
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      if (dontRedirectToSearchPageRoutes.includes(router.route)) {
        modifyQueryParam(router, 's', searchValue);
      } else {
        router.push(constructUrl({ page: 'search', queryParams: { s: searchValue } }));
      }

      if (onEnterKeyDown) {
        onEnterKeyDown();
      }
    }
  };

  let className = 'text-sm p-3 focus:outline-none w-full border-solid';
  if (altStyle) {
    className += ' bg-transparent text-white placeholder-white h-25px border-b-2 border-white';
  } else {
    className += ' text-gray-902 placeholder-gray-902 h-50px border-b-3 border-gray-300"';
  }

  return (
    <input
      className={className}
      type="text"
      name="search"
      placeholder="Enter your search term"
      value={searchValue}
      onChange={handleSearchQueryChange}
      onKeyDown={handleKeyDown}
    />
  );
};

export default SearchBarInput;
