import React from 'react';
import renderer from 'react-test-renderer';
import Layout from '../../../components/Layout/Layout';
import { ToastProvider } from '../../utils';

describe('Layout component', () => {
  const title = 'My Title';

  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Layout title={title}>
            <div>
              <p>Content</p>
            </div>
          </Layout>
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when transparentNavOnTopOfPage is false', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Layout title={title} transparentNavOnTopOfPage={false}>
            <div>
              <p>Content</p>
            </div>
          </Layout>
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when transparentNavOnTopOfPage is true', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Layout title={title} transparentNavOnTopOfPage>
            <div>
              <p>Content</p>
            </div>
          </Layout>
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when useContainer is false', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Layout title={title} useContainer={false}>
            <div>
              <p>Content</p>
            </div>
          </Layout>
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when useContainer is true', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Layout title={title} useContainer>
            <div>
              <p>Content</p>
            </div>
          </Layout>
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when bgColor prop is provided', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Layout title={title} bgColor="gray-500">
            <div>
              <p>Content</p>
            </div>
          </Layout>
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
