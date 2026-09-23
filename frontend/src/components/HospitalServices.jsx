import React, { useState } from 'react';
import { 
  Stethoscope, Activity, Eye, Bone, Baby, Syringe, Sparkles, Scan,
  TestTube, ShieldPlus, BedDouble, AlertCircle, Scissors, FileHeart,
  Pill, Truck, Users, HeartHandshake, Briefcase, ChevronRight, UserRoundCheck
} from 'lucide-react';
import './HospitalServices.css';

const HospitalServices = () => {
  const [activeTab, setActiveTab] = useState('departments');

  // Tab 1: Specialist Departments
  const departments = [
    { icon: <Baby size={24} />, title: "Gynecology & MCH Services", desc: "Complete women's healthcare including antenatal, postnatal, and Maternal & Child Health (MCH) Services." },
    { icon: <Stethoscope size={24} />, title: "MD Medicine", desc: "Expert care for general medical conditions, lifestyle diseases and chronic illnesses." },
    { icon: <Activity size={24} />, title: "ENT (Ear, Nose & Throat)", desc: "Specialized treatment for ENT disorders." },
    { icon: <Sparkles size={24} />, title: "Dermatology", desc: "Expert care for skin and related disorders." },
    { icon: <Baby size={24} />, title: "Pediatrics", desc: "Specialized healthcare for children and adolescents." },
    { icon: <Bone size={24} />, title: "Orthopedics", desc: "Treatment for bone, joint and muscle related conditions." },
    { icon: <Syringe size={24} />, title: "Anaesthesia", desc: "Expert Anaesthetic services available for surgical procedures and critical care." },
    { icon: <Scan size={24} />, title: "Radiology", desc: "Radiologist available. Ultra Sound facility is available." },
    { icon: <Eye size={24} />, title: "Eye Section", desc: "Equipments are available for comprehensive eye care." }
  ];

  // Tab 2: Diagnostic & Emergency
  const facilities = [
    { icon: <Scan size={24} />, title: "X-Ray Facility", desc: "X-Ray Available." },
    { icon: <Activity size={24} />, title: "ECG", desc: "ECG Available." },
    { icon: <TestTube size={24} />, title: "Laboratory", desc: "Laboratory In-House. Krashna Laboratory is available in Civil Hospital Arki premises." },
    { icon: <ShieldPlus size={24} />, title: "HIV Counselling and Lab", desc: "HIV Counselling and Lab available." },
    { icon: <Scissors size={24} />, title: "OT Section", desc: "OT Section Available." },
    { icon: <Scissors size={20} />, title: "Minor OT", desc: "Minor OT Available." },
    { icon: <AlertCircle size={24} />, title: "Emergency Services", desc: "Emergency Services available at Ground Floor." },
    { icon: <BedDouble size={24} />, title: "Special Wards", desc: "Special Wards Available." }
  ];

  // Tab 3: Pharmacy & Support Services
  const support = [
    { icon: <Pill size={24} />, title: "In-House Dispensary", desc: "In-house availability of medicines in the dispensary section for patients." },
    { icon: <Truck size={24} />, title: "24x7 Medical Civil Supply", desc: "Medical Civil Supply is available in CH Premises for 24x7 supply of medicines to the general public." },
    { icon: <HeartHandshake size={24} />, title: "NDK - Nai Disha Kendra", desc: "Nai Disha Kendra for adolescent health care." },
    { icon: <FileHeart size={24} />, title: "Ayushman Bharat Kendra", desc: "Ayushman Bharat Kendra Available." },
    { icon: <Users size={24} />, title: "NTEP", desc: "Dedicated Team available for its implementation." },
    { icon: <UserRoundCheck size={24} />, title: "Programs (NHM)", desc: "Programs implemented through NHM. NHM Office available to coordinate for implementation of national programs." },
    { icon: <Briefcase size={24} />, title: "Establishment Office", desc: "Establishment office available for office work." }
  ];

  const highlights = [
    { title: "Team of Dedicated Doctors", desc: "Our team of dedicated doctors always stays at the hospital for the care of patients." },
    { title: "Visionary Leadership", desc: "Under the guidance of a Visionary Block Medical Officer (BMO) for efficient administrative management." },
    { title: "All Major Specialities", desc: "Bringing together all major specialities under one roof for comprehensive patient care." },
    { title: "24x7 Support", desc: "24x7 Emergency, Pharmacy and Diagnostic Support available at all times." }
  ];

  return (
    <section className="hospital-services-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="hs-header">
          <h2 className="hs-title">Comprehensive Healthcare Under One Roof</h2>
          <p className="hs-subtitle">Explore our wide range of specialized departments, diagnostic facilities, and dedicated support services available at Civil Hospital Arki.</p>
        </div>

        {/* Highlights Banner */}
        <div className="hs-highlights-grid">
          {highlights.map((h, i) => (
            <div className="hs-highlight-card" key={i}>
              <div className="hs-highlight-icon-wrap">
                <Sparkles size={20} className="hs-highlight-icon" />
              </div>
              <div>
                <h4 className="hs-highlight-title">{h.title}</h4>
                <p className="hs-highlight-desc">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Tabs Container */}
        <div className="hs-main-container">
          
          {/* Tabs Navigation */}
          <div className="hs-tabs-nav">
            <button 
              className={`hs-tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={() => setActiveTab('departments')}
            >
              Our Specialist Departments
            </button>
            <button 
              className={`hs-tab-btn ${activeTab === 'facilities' ? 'active' : ''}`}
              onClick={() => setActiveTab('facilities')}
            >
              Diagnostic, Surgical & Emergency
            </button>
            <button 
              className={`hs-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              Pharmacy & Support Services
            </button>
          </div>

          {/* Tab Content */}
          <div className="hs-tab-content">
            {activeTab === 'departments' && (
              <div className="hs-grid fade-in">
                {departments.map((item, i) => (
                  <div className="hs-card" key={i}>
                    <div className="hs-card-watermark">{item.icon}</div>
                    <div className="hs-card-icon">{item.icon}</div>
                    <div className="hs-card-body">
                      <h4 className="hs-card-title">{item.title}</h4>
                      <p className="hs-card-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="hs-grid fade-in">
                {facilities.map((item, i) => (
                  <div className="hs-card" key={i}>
                    <div className="hs-card-watermark facility-watermark">{item.icon}</div>
                    <div className="hs-card-icon facility-icon">{item.icon}</div>
                    <div className="hs-card-body">
                      <h4 className="hs-card-title">{item.title}</h4>
                      <p className="hs-card-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'support' && (
              <div className="hs-grid fade-in">
                {support.map((item, i) => (
                  <div className="hs-card" key={i}>
                    <div className="hs-card-watermark support-watermark">{item.icon}</div>
                    <div className="hs-card-icon support-icon">{item.icon}</div>
                    <div className="hs-card-body">
                      <h4 className="hs-card-title">{item.title}</h4>
                      <p className="hs-card-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HospitalServices;
