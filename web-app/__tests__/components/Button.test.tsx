import React from 'react';
import renderer from 'react-test-renderer';
import Button from '../../components/Button';

describe('Button component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<Button>Click</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with inverted prop set to true', () => {
    const tree = renderer.create(<Button inverted>Click</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when passed the link prop', () => {
    const tree = renderer.create(<Button link="https://joeyorlando.ca">Click</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when passed the type prop', () => {
    const tree = renderer.create(<Button type="submit">Submit</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
