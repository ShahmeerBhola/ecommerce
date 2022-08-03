import React from 'react';
import renderer from 'react-test-renderer';
import Tab from '../../../components/Tabs/Tab';

describe('Tab component', () => {
  const onClick = (): void => console.log('hello');

  test('it renders properly when selected is true', () => {
    const tree = renderer
      .create(
        <Tab selected onClick={onClick}>
          <p>Tab 1</p>
        </Tab>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when select is false', () => {
    const tree = renderer
      .create(
        <Tab selected={false} onClick={onClick}>
          <p>Tab 1</p>
        </Tab>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
