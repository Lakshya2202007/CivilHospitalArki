import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Search, FileText, Building2, Megaphone } from 'lucide-react';
import { ALL_PROJECTS } from '../../data/projectsData';
import { ALL_NOTICES } from '../../data/noticesData';
import { ALL_TENDERS } from '../../data/tendersData';
import './GlobalSearch.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const GlobalSearch = () => {
  const query = useQuery().get('q') || '';
  const lowercaseQuery = query.toLowerCase();

  const [tendersData, setTendersData] = useState([]);
  const [noticesData, setNoticesData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tendersRes, noticesRes, projectsRes] = await Promise.all([
          fetch('/api/tenders?limit=100').catch(() => null),
          fetch('/api/public-notices?limit=100').catch(() => null),
          fetch('/api/projects?limit=100').catch(() => null)
        ]);

        let fetchedTenders = ALL_TENDERS;
        if (tendersRes && tendersRes.ok) {
          const json = await tendersRes.json();
          if (json.success && json.data) fetchedTenders = json.data;
        }

        let fetchedNotices = ALL_NOTICES;
        if (noticesRes && noticesRes.ok) {
          const json = await noticesRes.json();
          if (json.success && json.data) fetchedNotices = json.data;
        }

        let fetchedProjects = ALL_PROJECTS;
        if (projectsRes && projectsRes.ok) {
          const json = await projectsRes.json();
          if (json.success && json.data) fetchedProjects = json.data;
        }

        setTendersData(fetchedTenders);
        setNoticesData(fetchedNotices);
        setProjectsData(fetchedProjects);
      } catch (err) {
        console.error('Failed to fetch data for search:', err);
        setTendersData(ALL_TENDERS);
        setNoticesData(ALL_NOTICES);
        setProjectsData(ALL_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const searchResults = useMemo(() => {
    if (!lowercaseQuery) return { tenders: [], notices: [], projects: [] };

    const tenders = tendersData.filter(t => 
      (t.id && t.id.toLowerCase().includes(lowercaseQuery)) || 
      (t.title && t.title.toLowerCase().includes(lowercaseQuery)) || 
      (t.department && t.department.toLowerCase().includes(lowercaseQuery))
    );

    const notices = noticesData.filter(n => 
      (n.id && n.id.toLowerCase().includes(lowercaseQuery)) || 
      (n.title && n.title.toLowerCase().includes(lowercaseQuery)) || 
      (n.description && n.description.toLowerCase().includes(lowercaseQuery))
    );

    const projects = projectsData.filter(p => 
      (p.id && p.id.toLowerCase().includes(lowercaseQuery)) || 
      (p.name && p.name.toLowerCase().includes(lowercaseQuery)) || 
      (p.description && p.description.toLowerCase().includes(lowercaseQuery))
    );

    return { tenders, notices, projects };
  }, [lowercaseQuery, tendersData, noticesData, projectsData]);

  const totalResults = searchResults.tenders.length + searchResults.notices.length + searchResults.projects.length;

  return (
    <div className="page-wrapper">
      <Header />
      <main className="search-main">
        <div className="container">
          <div className="search-header">
            <h2>Search Results</h2>
            <p>Showing results for: <strong>"{query}"</strong></p>
            <p className="results-count">{totalResults} result(s) found</p>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <Search size={48} className="empty-icon" style={{ animation: 'spin 2s linear infinite' }} />
              <h3>Searching...</h3>
              <p>Fetching results for "{query}".</p>
            </div>
          ) : !lowercaseQuery ? (
            <div className="empty-state">
              <Search size={48} className="empty-icon" />
              <h3>Enter a search term</h3>
              <p>Type in the search bar above to find tenders, notices, or projects.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="empty-state">
              <Search size={48} className="empty-icon" />
              <h3>No results found</h3>
              <p>We couldn't find anything matching "{query}". Try different keywords.</p>
            </div>
          ) : (
            <div className="search-results-grid">
              
              {/* Tenders Section */}
              {searchResults.tenders.length > 0 && (
                <div className="result-section">
                  <h3 className="section-title">
                    <FileText size={20} /> Tenders & Quotations ({searchResults.tenders.length})
                  </h3>
                  <div className="result-cards">
                    {searchResults.tenders.map(t => (
                      <Link to="/tenders" key={t.id} className="result-card">
                        <div className="card-id">{t.id}</div>
                        <h4>{t.title}</h4>
                        <p>{t.department} - {t.status}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Notices Section */}
              {searchResults.notices.length > 0 && (
                <div className="result-section">
                  <h3 className="section-title">
                    <Megaphone size={20} /> Public Notices ({searchResults.notices.length})
                  </h3>
                  <div className="result-cards">
                    {searchResults.notices.map(n => (
                      <Link to="/notices" key={n.id} className="result-card">
                        <div className="card-id">{n.id}</div>
                        <h4>{n.title}</h4>
                        <p>{n.category}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {searchResults.projects.length > 0 && (
                <div className="result-section">
                  <h3 className="section-title">
                    <Building2 size={20} /> Works & Developments ({searchResults.projects.length})
                  </h3>
                  <div className="result-cards">
                    {searchResults.projects.map(p => (
                      <Link to="/works-developments" key={p.id} className="result-card">
                        <div className="card-id">{p.id}</div>
                        <h4>{p.name}</h4>
                        <p>{p.type} - {p.status}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GlobalSearch;
