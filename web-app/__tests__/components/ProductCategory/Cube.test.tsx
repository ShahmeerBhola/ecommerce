import React from 'react';
import renderer from 'react-test-renderer';
import Cube from '../../../components/ProductCategory/Cube';

describe('ProductCategory Cube component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <Cube
          size="250"
          category={{
            id: 5,
            name: 'Test Category',
            description: 'This is our test category',
            slug: 'test-category',
            image: {
              id: 45,
              name: 'my-image.png',
              src: 'my-image.png',
              alt: 'my image',
            },
            menu_order: 1,
            count: 5,
          }}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
