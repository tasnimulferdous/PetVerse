import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../apiConfig';
import './TrendingTopics.css';

const TrendingTopics = () => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const response = await axios.get(getApiUrl('api/posts/trending'));
        setTopics(response.data.trendingTopics || []);
      } catch (error) {
        console.error('Failed to fetch trending topics', error);
      }
    };

    fetchTrendingTopics();
  }, []);

  return (
    <div className="trending-topics-container">
      <h4>Trending Topics</h4>
      {topics.length === 0 ? (
        <p>No trending topics found.</p>
      ) : (
        <ul className="trending-topics-list">
          {topics.map((topic, index) => (
            <li
              key={index}
              className="trending-topic-item"
            >
              #{topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrendingTopics;
