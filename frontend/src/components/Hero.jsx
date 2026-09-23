import React from 'react';
import './Hero.css';

const Hero = () => {
  const [banner, setBanner] = React.useState({
    title: 'Civil Hospital Arki',
    subtitle: 'Providing Transparent, Timely and Centralized Access to Hospital Services\nand information for all Citizens.',
    imageUrl: '/hero-bg.jpg'
  });

  React.useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          // just use the first active banner
          const b = json.data[0];
          setBanner({
            title: b.title || 'Civil Hospital Arki',
            subtitle: b.subtitle || 'Providing Transparent, Timely and Centralized Access to Hospital Services\nand information for all Citizens.',
            imageUrl: b.imageUrl || '/hero-bg.jpg'
          });
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      }
    };
    fetchBanners();
  }, []);

  return (
    <section className="hero">
      <div className="hero-background" style={{ backgroundImage: `url('${banner.imageUrl}')` }}>
        <div className="container">
          <div className="hero-content">
            <h2 className="hero-title">{banner.title}</h2>
            <p className="hero-subtitle" style={{ whiteSpace: 'pre-line' }}>
              {banner.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
