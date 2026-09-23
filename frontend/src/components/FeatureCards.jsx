import React from 'react';
import { ClipboardList, Construction, Megaphone } from 'lucide-react';
import './FeatureCards.css';

const FeatureCards = () => {
  const cards = [
    {
      id: 2,
      title: "Tenders &\nQuotations",
      description: "Transparent digital space for publishing procurement-related notices.",
      icon: <ClipboardList size={32} color="#0d4b2e" strokeWidth={1.5} />,
      btnText: "Learn More",
      link: "/tenders"
    },
    {
      id: 3,
      title: "Works &\nDevelopments",
      description: "Ongoing hospital infrastructure and development initiatives.",
      icon: <Construction size={32} color="#0d4b2e" strokeWidth={1.5} />,
      btnText: "Learn More",
      link: "/works-developments"
    },
    {
      id: 4,
      title: "Public Notices &\nAnnouncements",
      description: "Latest announcements, circulars and health-related updates.",
      icon: <Megaphone size={32} color="#0d4b2e" strokeWidth={1.5} />,
      btnText: "Learn More",
      link: "/notices"
    }
  ];

  return (
    <section className="feature-cards-section">
      <div className="container">
        <div className="cards-wrapper">
          {cards.map(card => (
            <div className="feature-card" key={card.id}>
              <div className="card-icon">{card.icon}</div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-desc">{card.description}</p>
              <a href={card.link} className="card-btn">{card.btnText}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
