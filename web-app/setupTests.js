import Enzyme from 'enzyme';
import ReactDOM from 'react-dom';
import Adapter from 'enzyme-adapter-react-16';

// Configure Enzyme with React 16 adapter
Enzyme.configure({ adapter: new Adapter() });

// https://github.com/akiran/react-slick/issues/742
// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
window.matchMedia =
    window.matchMedia ||
    function () {
        return {
            matches: false,
            addListener() {
                console.log();
            },
            removeListener() {
                console.log();
            },
        };
    };

ReactDOM.createPortal = jest.fn((element, _node) => {
    return element;
});
