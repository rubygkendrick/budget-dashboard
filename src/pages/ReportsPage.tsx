// Reports page: displays financial charts including income vs expenses and spending by category.
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppTitle from "../components/AppTitle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface IncomeExpense {
  month: string;
  income: number;
  expense: number;
}

interface CategorySpend {
  name: string;
  total: number;
}

interface Transfer {
  id: string;
  amount: string;
  date: string;
  note: string | null;
  account: { name: string };
  toAccount: { name: string } | null;
}

const PIE_COLORS = [
  "var(--color-neon-yellow)",
  "var(--color-neon-green)",
  "var(--color-neon-pink)",
  "var(--color-neon-orange)",
  "#a78bfa",
  "#38bdf8",
];

export default function ReportsPage() {
  const { token } = useAuth();

  const [incomeExpenses, setIncomeExpenses] = useState<IncomeExpense[]>([]);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ieRes, catRes, txRes] = await Promise.all([
          fetch("http://localhost:5000/api/reports/income-vs-expenses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/reports/spending-by-category", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/reports/transfers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [ieData, catData, txData] = await Promise.all([
          ieRes.json(),
          catRes.json(),
          txRes.json(),
        ]);
        setIncomeExpenses(ieData);
        setCategorySpend(catData);
        setTransfers(txData);
      } catch {
        console.error("Failed to fetch report data");
      }
    }
    fetchData();
  }, [token]);

  return (
    <div style={styles.container}>
      <AppTitle />

      <h2 style={styles.heading}>Income vs Expenses</h2>
      {incomeExpenses.length === 0 ? (
        <p style={styles.empty}>No transaction data yet.</p>
      ) : (
        <div style={styles.chartCard}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incomeExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#39ff14"
                strokeWidth={2}
                dot={{ fill: "#39ff14" }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ff3eb5"
                strokeWidth={2}
                dot={{ fill: "#ff3eb5" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 style={styles.heading}>Spending by Category</h2>
      {categorySpend.length === 0 ? (
        <p style={styles.empty}>No categorized expenses yet.</p>
      ) : (
        <div style={styles.chartCard}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categorySpend}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categorySpend.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 style={styles.heading}>Transfer History</h2>
      {transfers.length === 0 ? (
        <p style={styles.empty}>No transfers yet.</p>
      ) : (
        <div style={styles.list}>
          {transfers.map((t) => (
            <div key={t.id} style={styles.card}>
              <div>
                <p style={styles.transferLabel}>
                  {t.account.name} → {t.toAccount?.name || "—"}
                </p>
                <p style={styles.meta}>
                  {new Date(t.date).toLocaleDateString()}{" "}
                  {t.note && `· ${t.note}`}
                </p>
              </div>
              <p style={styles.amount}>${parseFloat(t.amount).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    color: "var(--color-text-light)",
    width: "100%",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
    marginTop: "32px",
    color: "var(--color-text-light)",
  },
  chartCard: {
    backgroundColor: "var(--color-bg-card)",
    border: "var(--border-chunky-light)",
    borderRadius: "var(--radius-md)",
    padding: "24px",
    boxShadow: "var(--shadow-card)",
    marginBottom: "16px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "var(--color-bg-card)",
    border: "var(--border-chunky-light)",
    borderRadius: "var(--radius-md)",
    padding: "16px 20px",
    boxShadow: "var(--shadow-card)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transferLabel: {
    fontWeight: "bold",
    margin: 0,
    fontSize: "15px",
  },
  meta: {
    color: "var(--color-text-muted)",
    fontSize: "13px",
    margin: 0,
    marginTop: "4px",
  },
  amount: {
    color: "var(--color-neon-green)",
    fontWeight: "bold",
    fontSize: "16px",
    margin: 0,
  },
  empty: {
    color: "var(--color-text-muted)",
    fontSize: "14px",
  },
};
