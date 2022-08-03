import React from 'react';
import renderer from 'react-test-renderer';
import Slider from '../../components/Slider';

// was getting this error when using 0.26.1, bumping down to 0.25.2 fixed it
// cannot read property 'querySelectorAll'
// https://github.com/akiran/react-slick/issues/1830
describe('Slider component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <Slider>
          <div>
            <p>Slide 1</p>
          </div>
          <div>
            <p>Slide 2</p>
          </div>
          <div>
            <p>Slide 3</p>
          </div>
        </Slider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when infinite is true', () => {
    const tree = renderer
      .create(
        <Slider infinite>
          <div>
            <p>Slide 1</p>
          </div>
          <div>
            <p>Slide 2</p>
          </div>
          <div>
            <p>Slide 3</p>
          </div>
        </Slider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when infinite is false', () => {
    const tree = renderer
      .create(
        <Slider infinite={false}>
          <div>
            <p>Slide 1</p>
          </div>
          <div>
            <p>Slide 2</p>
          </div>
          <div>
            <p>Slide 3</p>
          </div>
        </Slider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when slidesToShow is non-default', () => {
    const tree = renderer
      .create(
        <Slider slidesToShow={1}>
          <div>
            <p>Slide 1</p>
          </div>
          <div>
            <p>Slide 2</p>
          </div>
          <div>
            <p>Slide 3</p>
          </div>
        </Slider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
