import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockImage } from '../../utils';
import Image from '../../../components/Product/Image';

describe('Product Image component', () => {
  const productImage = generateMockImage();

  test('it renders properly when passed an image', () => {
    const tree = renderer.create(<Image image={productImage} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when image is null', () => {
    const tree = renderer.create(<Image image={null} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when wrapperClassName is provided', () => {
    const tree = renderer.create(<Image image={null} wrapperClassName="wrapper-hello-there" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when className is provided', () => {
    const tree = renderer.create(<Image image={null} className="hello-there" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
