import React from "react";

const AdminScreen = ({ isOwner }) => {
  if (!isOwner) return <div>You dont have permission</div>;

  return (
    <div className="admin-container">
      <p>This is the admin Screen</p>
    </div>
  );
};

export default AdminScreen;
