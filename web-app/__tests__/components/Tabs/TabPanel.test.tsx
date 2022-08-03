import React from 'react';
import renderer from 'react-test-renderer';
import TabPanel from '../../../components/Tabs/TabPanel';

describe('TabPanel component', () => {
  test('it renders properly when active is true', () => {
    const tree = renderer
      .create(
        <TabPanel active>
          <p>Tab Panel</p>
        </TabPanel>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when active is false', () => {
    const tree = renderer
      .create(
        <TabPanel active={false}>
          <p>Tab Panel</p>
        </TabPanel>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
