import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";

function AllCoupans() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/coupons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCoupons(res.data || []);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading coupons...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📋 All Coupons</h1>

      {coupons.length === 0 ? (
        <p className="text-gray-500">No coupons available.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition duration-200"
            >
              <h2 className="text-xl font-bold text-blue-600 mb-2">
                {coupon.code}
              </h2>

              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Course Name :</span>{" "}
                  {coupon.course?.course_name || "N/A"}

              </p>

              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Type:</span>{" "}
                {coupon.discount_type}
              </p>

              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Value:</span>{" "}
                {coupon.discount_type === "percentage"
                  ? `${coupon.discount_value}%`
                  : `₹${coupon.discount_value}`}
              </p>

              <p className="text-xs text-gray-500 mt-3">
                <span className="font-semibold">Valid From:</span>{" "}
                {coupon.start_date}
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Until:</span>{" "}
                {coupon.expiry_date || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllCoupans;
