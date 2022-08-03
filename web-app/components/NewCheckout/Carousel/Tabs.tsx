import React, { FC, useState, useEffect, ReactElement, MouseEvent, ReactNode } from 'react';

export const Tabs: FC<{ activeKey: string }> = ({ children, activeKey }) => {
    const [nav, setNav] = useState<string[]>([]);
    const [active, setActive] = useState<number>(0);
    const [tabsElements, setTabsElements] = useState<ReactElement[]>([]);

    useEffect(() => {
        const tabs = (Array.isArray(children) ? children : [children]).filter(Boolean) as ReactElement[];
        setTabsElements(tabs);
    }, [children]);

    useEffect(() => {
        if (tabsElements.length) {
            const currentIndex = [...tabsElements].map((el) => el.key).indexOf(activeKey);

            setActive(currentIndex > -1 ? currentIndex : 0);
            setNav(tabsElements.map(({ props }) => props?.title));
        }
    }, [tabsElements, activeKey]);

    const toggleTabs = (currentIndex: number): ((e: MouseEvent<HTMLAnchorElement>) => void) => {
        return (e): void => {
            e.preventDefault();

            setActive(currentIndex);
        };
    };

    const filterContent = (): ReactNode => {
        return tabsElements.filter(Boolean).filter((_, _index) => active === _index);
    };

    return (
        <div>
            <div className="flex space-x-4 mb-5 sm:mb-10">
                {nav.map((navTitle, index) => (
                    <a
                        key={index}
                        href="#"
                        className={`cursor-pointer text-sm sm:text-base px-2 py-1 hover:bg-gray-50 border-b-2 ${
                            active === index ? 'text-red-100 border-current' : 'border-transparent'
                        }`}
                        onClick={toggleTabs(index)}
                    >
                        {navTitle}
                    </a>
                ))}
            </div>
            <div
                style={{
                    width: '100vw',
                    overflow: 'hidden',
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
            >
                <div className="container mx-auto px-3">{filterContent()}</div>
            </div>
        </div>
    );
};

export const TabItem: FC<{ title: string }> = ({ children }) => {
    return <div>{children}</div>;
};
