import React from 'react';
import renderer from 'react-test-renderer';
import StorePage from '../../pages/store';
import { ToastProvider, generateMockCategory } from '../utils';

describe('StorePage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <StorePage categories={[generateMockCategory(1), generateMockCategory(2), generateMockCategory(3)]} />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
