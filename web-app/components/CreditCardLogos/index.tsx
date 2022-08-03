import React from 'react';

type Props = {
  height: 'h-25px' | 'h-30px';
  className?: string;
};

const acceptedCards = ['visa', 'mastercard', 'amex', 'discover', 'jcb'];

const CreditCardLogos: React.FunctionComponent<Props> = ({ height, className }) => (
  <div className={`flex ${className}`}>
    {acceptedCards.map((card) => (
      <div key={card} className="mr-2">
        <img src={`/icons/${card}.png`} alt={card} className={height} />
      </div>
    ))}
  </div>
);

export default CreditCardLogos;
