import React from 'react';
import ReactModal from 'react-modal';

export type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const BaseModal: React.FunctionComponent<Props> = ({ isOpen, onClose, children }) => (
  <ReactModal
    style={{
      overlay: {
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      },
      content: {
        top: '10%',
        left: '10%',
        right: '10%',
        bottom: '10%',
        padding: 0,
      },
    }}
    isOpen={isOpen}
    onRequestClose={onClose}
    shouldCloseOnOverlayClick
  >
    {children}
  </ReactModal>
);

ReactModal.setAppElement('#__next');

export default BaseModal;
