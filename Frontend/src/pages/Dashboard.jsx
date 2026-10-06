import { useEffect, useState } from "react";

function Dashboard() {
  const [counts, setCounts] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          customersResponse,
          productsResponse,
          ordersResponse,
        ] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/admin/customers/", {
            headers,
          }),

          fetch("http://127.0.0.1:8000/api/admin/products/", {
            headers,
          }),

          fetch("http://127.0.0.1:8000/api/admin/orders/", {
            headers,
          }),
        ]);

        const customers = await customersResponse.json();
        const products = await productsResponse.json();
        const orders = await ordersResponse.json();

        // Calculate revenue only from delivered orders
        const totalRevenue = orders
          .filter((order) => order.status === "delivered")
          .reduce(
            (total, order) =>
              total + Number(order.total_amount || 0),
            0
          );

        setCounts({
          customers: customers.length,
          products: products.length,
          orders: orders.length,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error("Dashboard data error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
  <div className="dashboard-content">
    <section className="dashboard-section">
      <h2>Welcome to Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Customers</h3>
          <p>{counts.customers}</p>
        </div>

        <div className="stat-card">
          <h3>Products</h3>
          <p>{counts.products}</p>
        </div>

        <div className="stat-card">
          <h3>Orders</h3>
          <p>{counts.orders}</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₹{counts.revenue.toFixed(2)}</p>
        </div>
      </div>
    </section>
  </div>
);
}

export default Dashboard;