import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RightSidebar.css";

const RightSidebar = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get("/api/news");
      setNews(response.data.news || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-sidebar">
      {/* LinkedIn News */}
      <div className="sidebar-card news-card">
        <div className="sidebar-section">
          <div className="section-header">
            <h4>LinkedIn News</h4>
            <span className="info-icon">ⓘ</span>
          </div>
          <div className="news-list">
            {loading ? (
              <div className="news-loading">Loading news...</div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="news-item">
                  <div className="news-content">
                    <span className="news-title">{item.title}</span>
                    <span className="news-stats">
                      {item.timeAgo} • {item.readers.toLocaleString()} readers
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="show-more-btn">Show more ▼</button>
        </div>
      </div>

      {/* Today's Puzzles */}
      <div className="sidebar-card puzzles-card">
        <div className="sidebar-section">
          <h4>Today's puzzles</h4>
          <div className="puzzles-list">
            <div className="puzzle-item">
              <span className="puzzle-name">Mini Sudoku</span>
              <span className="puzzle-stats">3 Connections played</span>
            </div>
            <div className="puzzle-item">
              <span className="puzzle-name">Zip</span>
              <span className="puzzle-stats">3 Connections played</span>
            </div>
            <div className="puzzle-item">
              <span className="puzzle-name">Tango</span>
              <span className="puzzle-stats">3 Connections played</span>
            </div>
            <div className="puzzle-item">
              <span className="puzzle-name">Queens</span>
              <span className="puzzle-stats">Connections played</span>
            </div>
          </div>
          <button className="show-more-btn">Show more ▼</button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="footer-links">
        <div className="links-row">
          <a href="/about">About</a>
          <a href="/accessibility">Accessibility</a>
          <a href="/help">Help Center</a>
        </div>
        <div className="links-row">
          <a href="/privacy">Privacy & Terms</a>
          <a href="/ads">Ad Choices</a>
        </div>
        <div className="links-row">
          <a href="/advertising">Advertising</a>
          <a href="/business">Business Services</a>
        </div>
        <div className="links-row">
          <a href="/get-app">Get the LinkedIn app</a>
          <a href="/more">More</a>
        </div>

        <div className="copyright">
          <img
            src="/linkedin-logo.png"
            alt="LinkedIn"
            className="footer-logo"
          />
          <span>LinkedIn Corporation © 2023</span>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
