import React, { FC } from 'react';

import SmallClose from '../../../Icons/SmallClose';

type Props = {
    onClose: () => void;
};

export const VariationsFilters: FC<Props> = ({ onClose, children }) => {
    return (
        <div className="mb-4 px-8">
            <div className="pt-2 flex justify-between items-center text-sm text-gray-300">
                <div className="space-y-2">
                    <div className="flex space-x-3">
                        <div>Dimensions</div>
                        <div className="flex space-x-2">{children}</div>
                    </div>
                </div>
                <div className="self-start" onClick={onClose}>
                    <SmallClose fill="#aaa" />
                </div>
            </div>
        </div>
    );
};
