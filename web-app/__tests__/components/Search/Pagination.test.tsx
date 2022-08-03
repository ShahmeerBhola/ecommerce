import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockPagination } from '../../utils';
import Pagination from '../../../components/Search/Pagination';

describe('Pagination component', () => {
  test('it renders properly when there is lots of pages', () => {
    const tree = renderer.create(<Pagination pagination={generateMockPagination(5005, 201, 1, 25)} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when there is only one page', () => {
    const tree = renderer.create(<Pagination pagination={generateMockPagination(3, 1, 1, 25)} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when there are no pages', () => {
    const tree = renderer.create(<Pagination pagination={generateMockPagination(0, 0, 1, 25)} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when we are on page 3', () => {
    const tree = renderer.create(<Pagination pagination={generateMockPagination(5005, 201, 3, 25)} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when we are on the second to last page', () => {
    const tree = renderer.create(<Pagination pagination={generateMockPagination(5005, 201, 200, 25)} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when we are on the last page', () => {
    const tree = renderer.create(<Pagination pagination={generateMockPagination(5005, 201, 201, 25)} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
