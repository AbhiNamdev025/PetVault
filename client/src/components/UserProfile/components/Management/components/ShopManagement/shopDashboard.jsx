import React, { useState } from "react";
import ShopManagement from "./shopManagement";
import PetManagement from "../PetManagement/petManagement";

const ShopDashboard = ({ user }) => {
  const [tab, setTab] = useState("products");

  const showPets =
    user.role === "shop" &&
    (user.roleData?.shopType === "petStore" ||
     user.roleData?.shopType === "mixed");

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button onClick={() => setTab("products")}>Products</button>
        {showPets && <button onClick={() => setTab("pets")}>Pets</button>}
      </div>

      {tab === "products" && <ShopManagement user={user} />}
      {tab === "pets" && showPets && <PetManagement user={user} />}
    </div>
  );
};

export default ShopDashboard;
