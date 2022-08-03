import React from 'react';
import renderer from 'react-test-renderer';
import RequestQuotePage from '../../pages/request_quote';
import { ToastProvider } from '../utils';

describe('RequestQuotePage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <RequestQuotePage />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
