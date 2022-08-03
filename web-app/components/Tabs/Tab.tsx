import React from 'react';

type Props = {
  selected: boolean;
  onClick: () => void;
};

const Tab: React.FunctionComponent<Props> = ({ children, selected, onClick }) => (
  <div
    className={`text-white font-bold py-2 px-4 uppercase cursor-pointer ${selected ? 'bg-red-100' : ''}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export default Tab;
