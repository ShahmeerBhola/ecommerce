import React from 'react';
import renderer from 'react-test-renderer';
import DoesNotExist from '../../../components/Layout/DoesNotExist';
import { ToastProvider } from '../../utils';

describe('DoesNotExist component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <DoesNotExist />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
