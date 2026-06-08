import React from 'react';
import '../styles/Forgotpassword.css'; 

const PasswordUpdated = () => {
  return (
    <div className="forgot-password-container">
      <div className="forms-section">
        <div className="progress-bar-wrapper">
          <h4>All Done</h4>
          <div className="progress-bar">
            <div className="progress-filled step4"></div>
          </div>
          <span className="step-label">Step 4/4</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <span style={{ fontSize: '64px' }}>✅</span>
          <h2>All done!</h2>
          <p>Your password has been successfully updated.</p>
          <button onClick={() => window.location.href = '/signin'} style={{ marginTop: '20px' }}>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdated;
