import React from "react";
import "./Recentpickup.css";

const Recentpickup = ({ recentPickups }) => {
  const formatDateTime = (dateString) => {
    try {
      // Create a date object from the UTC string
      const date = new Date(dateString);
      
      // Convert to Nepal time (UTC+5:45)
      const nepalOffset = 5.75 * 60 * 60 * 1000; // 5 hours and 45 minutes in milliseconds
      const nepalDate = new Date(date.getTime() + nepalOffset);
      
      // Format the date and time with AM/PM
      const year = nepalDate.getUTCFullYear();
      const month = String(nepalDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(nepalDate.getUTCDate()).padStart(2, '0');
      let hours = nepalDate.getUTCHours();
      const minutes = String(nepalDate.getUTCMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      hours = String(hours).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="recent-pickups-wrapper">
      <h2 className="Recenttext">Recent Pickups</h2>
      <div className="recent-pickups">
        <table>
          <thead><tr><th>Date</th><th>Address</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {recentPickups.map((pickup, index) => (
              <tr key={index}>
                <td>{formatDateTime(pickup.date)}</td>
                <td>{pickup.address}</td>
                <td>{pickup.type}</td>
                <td>{pickup.amount}</td>
                <td className={pickup.status === "Pending" ? "status-pending status-td" : "status-completed status-td"}>{pickup.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Recentpickup;
