import { Container, Row } from 'react-bootstrap';
import { FaBuilding, FaUser } from 'react-icons/fa';
import { PiConfettiBold } from 'react-icons/pi';
import Image from 'next/image';
import Card from '../../Medium/Card/Card';

const Features = () => {
  const targetUserCards = [
    {
      icon: <FaBuilding size={100} />,
      label: 'Perusahaan',
      bgImage: '/images/building.png',
    },
    {
      icon: <FaUser size={100} />,
      label: 'Individu',
      bgImage: '/images/individual.png',
    },
    {
      icon: <PiConfettiBold size={100} />,
      label: 'Acara',
      bgImage: '/images/event.png',
    },
    {
      icon: <Image src="/assets/icon-mitra.png" alt="Mitra Icon" width={130} height={130} />,
      label: 'Mitra',
      bgImage: '/images/partner.png',
    },
  ];

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        {targetUserCards.map((card, index) => (
          <Card
            key={index}
            icon={card.icon}
            label={card.label}
            backgroundImage={card.bgImage}
          />
        ))}
      </Row>
    </Container>
  );
};

export default Features;