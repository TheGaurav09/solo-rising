
// This file is read-only, but we need to create a custom LeaderboardStyles component that we'll use

import React from 'react';

const LeaderboardStyles = () => {
  return (
    <style jsx global>{`
      .leaderboard-table {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      
      .leaderboard-table th {
        background: rgba(0, 0, 0, 0.6);
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 14px;
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .leaderboard-table td {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background 0.3s ease;
      }
      
      .leaderboard-table tr:hover td {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .leaderboard-table tr.current-user td {
        background: rgba(255, 255, 255, 0.1);
        font-weight: 600;
      }
      
      .leaderboard-rank-1 {
        color: gold;
        font-weight: bold;
      }
      
      .leaderboard-rank-2 {
        color: silver;
        font-weight: bold;
      }
      
      .leaderboard-rank-3 {
        color: #cd7f32; /* bronze */
        font-weight: bold;
      }
      
      .leaderboard-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }
      
      .leaderboard-filters {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      
      .leaderboard-filter-btn {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .leaderboard-filter-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .leaderboard-filter-btn.active {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
        font-weight: 500;
      }
      
      .leaderboard-pagination {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
      }
      
      .leaderboard-pagination-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        transition: all 0.2s ease;
      }
      
      .leaderboard-pagination-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .leaderboard-pagination-btn.active {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
      }
      
      .streak-badge {
        background: linear-gradient(135deg, #ff9d00, #ff0000);
        color: white;
        font-size: 12px;
        font-weight: bold;
        padding: 3px 8px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      @media (max-width: 768px) {
        .leaderboard-table th, .leaderboard-table td {
          padding: 12px 8px;
          font-size: 13px;
        }
        
        .leaderboard-avatar {
          width: 32px;
          height: 32px;
        }
      }
    `}</style>
  );
};

export default LeaderboardStyles;
