import React from 'react';

type Props = {
  active: boolean;
};

const TabPanel: React.FunctionComponent<Props> = ({ active, children }) => (
  <div className={`bg-gray-600 p-5 shadow-2xl ${active ? 'block' : 'hidden'}`}>{children}</div>
);

export default TabPanel;
