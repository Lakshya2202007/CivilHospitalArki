import React from 'react';
import './InfoSection.css';
import { Download } from 'lucide-react';

const InfoSection = () => {
  const fallbackNotices = [
    { id: 1, date: "17 Apr. 2024", title: "Health Advisory on Seasonal Diseases", isNew: true },
    { id: 2, date: "18 Apr. 2024", title: "Health Advisory on Seasonal Diseases", isNew: true }
  ];

  const fallbackTenders = [
    { id: 1, tenderId: "12557523", title: "Procurement of Medical Equipment", date: "25 Apr. 2023 - 11:30:00", isActive: true },
    { id: 2, tenderId: "13557531", title: "Procurement of Medical Equipment", date: "25 Apr. 2023 - 12:30:00", isActive: true }
  ];

  const fallbackProjects = [
    { id: "12557523", name: "Maternal Ward Construction", type: "Civil", date: "10 Mar 2023", est: "31 Dec 2023", value: "₹1.5 Cr", status: "IN PROGRESS" },
    { id: "13557531", name: "Radiology Suite Renovation", type: "Medical", date: "20 Apr 2023", est: "31 Jul 2023", value: "₹50 Lakhs", status: "IN PROGRESS" },
    { id: "2468001", name: "Hospital Information System Upgrade", type: "IT", date: "15 Jan 2023", est: "15 Jun 2023", value: "₹20 Lakhs", status: "COMPLETED" }
  ];

  const [notices, setNotices] = React.useState(fallbackNotices);
  const [tenders, setTenders] = React.useState(fallbackTenders);
  const [projects, setProjects] = React.useState(fallbackProjects);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [noticesRes, tendersRes, projectsRes] = await Promise.all([
          fetch('/api/public-notices?limit=10'),
          fetch('/api/tenders?limit=10'),
          fetch('/api/projects?limit=10')
        ]);
        const noticesJson = await noticesRes.json();
        const tendersJson = await tendersRes.json();
        const projectsJson = await projectsRes.json();

        if (noticesJson.success && noticesJson.data) {
          setNotices(noticesJson.data.slice(0, 3).map(n => ({
            id: n.id,
            date: new Date(n.publishDate || n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            title: n.title,
            isNew: n.status === 'New'
          })));
        }
        if (tendersJson.success && tendersJson.data) {
          setTenders(tendersJson.data.slice(0, 3).map(t => ({
            id: t.id,
            tenderId: t.id,
            title: t.title,
            date: new Date(t.closingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            isActive: t.status === 'Active'
          })));
        }
        if (projectsJson.success && projectsJson.data) {
          setProjects(projectsJson.data.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            date: p.approvalDate,
            est: p.estCompletion,
            value: p.value,
            status: p.status
          })));
        }
      } catch (err) {
        console.error('Failed to fetch data for info section', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="info-section">
      <div className="container">
        
        <div className="info-grid">
          {/* Latest Government Notices */}
          <div className="info-column">
            <div className="section-header flex justify-between items-center">
              <h2>Latest Government Notices</h2>
              <a href="/notices" className="view-all">View All</a>
            </div>
            <div className="info-list">
              {notices.map(notice => (
                <div className="info-item notice-item" key={notice.id}>
                  <div className="item-meta flex justify-between">
                    <span className="item-date">{notice.date} {notice.isNew && <span className="badge new">NEW</span>}</span>
                    {notice.isNew && <span className="badge new-right">NEW</span>}
                  </div>
                  <h4 className="item-title">{notice.title}</h4>
                  <div className="item-actions flex justify-end">
                    <button className="action-btn outline-btn"><Download size={14}/> Download PDF</button>
                    <button className="action-btn solid-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tenders */}
          <div className="info-column">
            <div className="section-header flex justify-between items-center">
              <h2>Active Tenders</h2>
              <a href="/tenders" className="view-all">View All</a>
            </div>
            <div className="info-list">
              {tenders.map(tender => (
                <div className="info-item tender-item" key={tender.id}>
                  <div className="item-meta flex justify-between">
                    <span className="item-id">Tender ID: {tender.tenderId}</span>
                    {tender.isActive && <span className="badge active">ACTIVE</span>}
                  </div>
                  <h4 className="item-title">{tender.title}</h4>
                  <span className="item-date-sub">{tender.date}</span>
                  <div className="item-actions flex justify-end">
                    <button className="action-btn outline-btn"><Download size={14}/> Download Tender Doc</button>
                    <button className="action-btn solid-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ongoing Hospital Projects - Below */}
        <div className="info-grid single-col-mt">
          <div className="info-column full-width">
            <div className="section-header flex justify-between items-center">
              <h2>Ongoing Hospital Projects</h2>
              <a href="/works-developments" className="view-all">View All</a>
            </div>
            
            <div className="projects-table-container">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Project Name / Description</th>
                    <th>Project Type</th>
                    <th>Approval Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(proj => (
                    <tr key={proj.id}>
                      <td>{proj.id}</td>
                      <td className="fw-500">{proj.name}</td>
                      <td>{proj.type}</td>
                      <td>{proj.date}</td>
                      <td>
                        <span className={`badge ${proj.status === 'COMPLETED' ? 'completed' : 'in-progress'}`}>
                          {proj.status}
                        </span>
                      </td>
                      <td><button className="action-btn solid-btn sm-btn">View Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default InfoSection;
