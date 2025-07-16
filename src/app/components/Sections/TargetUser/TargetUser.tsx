import { Container, Row } from 'react-bootstrap';
import { FaBuilding, FaUser } from 'react-icons/fa';
import { PiConfettiBold } from 'react-icons/pi';
import Image from 'next/image';
import Card from '../../Medium/Card/Card';

const Features = () => {
  const targetUserCards = [
    {
      icon: <FaBuilding size={64} />,
      label: 'Perusahaan',
      bgImage: '/images/building.png',
    },
    {
      icon: <FaUser size={64} />,
      label: 'Individu',
      bgImage: '/images/individual.png',
    },
    {
      icon: <PiConfettiBold size={64} />,
      label: 'Acara',
      bgImage: '/images/event.png',
    },
    {
      icon: <Image src="/assets/icon-mitra.png" alt="Mitra Icon" width={94} height={94} />,
      label: 'Mitra',
      bgImage: '/images/partner.png',
    },
  ];

  return (
    <Container className="my-5">
      <Row className="justify-content-center g-4">
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