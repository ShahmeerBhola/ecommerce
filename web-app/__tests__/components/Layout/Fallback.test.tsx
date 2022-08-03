import React from 'react';
import renderer from 'react-test-renderer';
import Fallback from '../../../components/Layout/Fallback';
import { ToastProvider } from '../../utils';

describe('Fallback component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Fallback />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
