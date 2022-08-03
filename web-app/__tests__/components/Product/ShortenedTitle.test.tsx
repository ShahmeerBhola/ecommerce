import React from 'react';
import renderer from 'react-test-renderer';
import ShortenedTitle from '../../../components/Product/ShortenedTitle';

describe('FeaturedProduct component', () => {
  const title = 'My Product Title';

  test('it renders properly when title length is less than maxLength', () => {
    const tree = renderer.create(<ShortenedTitle title={title} maxLength={50} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when title length is more than maxLength', () => {
    const tree = renderer.create(<ShortenedTitle title={title} maxLength={5} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when fontWeight prop is provided', () => {
    const tree = renderer.create(<ShortenedTitle title={title} fontWeight="extrabold" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when uppercase prop is true', () => {
    const tree = renderer.create(<ShortenedTitle title={title} uppercase />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when uppercase prop is false', () => {
    const tree = renderer.create(<ShortenedTitle title={title} uppercase={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when className prop is provided', () => {
    const tree = renderer.create(<ShortenedTitle title={title} className="my-class-name" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
