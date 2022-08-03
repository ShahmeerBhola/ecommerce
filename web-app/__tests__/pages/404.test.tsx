import React from 'react';
import renderer from 'react-test-renderer';
import NotFoundPage from '../../pages/404';
import { ToastProvider } from '../utils';

describe('404Page component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <NotFoundPage />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
