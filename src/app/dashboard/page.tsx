import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Dashboard() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full px-10 py-[2vh]">

        {/* PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-text-primary mb-2 text-[clamp(1.5rem,3vw,2rem)]">
            Dashboard
          </h1>
          <p className="text-text-secondary text-[clamp(0.95rem,1.6vw,1.05rem)]">
            Overview of renewals, tasks, workload, and business health
          </p>
        </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-5 mb-10">
          {[
            { label: 'Upcoming Domain Renewals', value: 12 },
            { label: 'Upcoming Hosting Renewals', value: 8 },
            { label: 'Upcoming Maintenance Renewals', value: 5 },
            { label: 'Active Clients', value: 24 },
            { label: 'Active Domains', value: 60 },
            { label: 'Active Hosting', value: 32 },
          ].map((item) => (
            <div
              key={item.label}
              className="card p-5 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-text-secondary text-sm">{item.label}</p>
              <p className="mt-2 font-bold text-2xl text-text-primary">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* UPCOMING RENEWALS */}
          <div className="xl:col-span-2 card rounded-xl p-5 bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Upcoming Renewals</h3>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Renewal Date</th>
                    <th className="flex items-center justify-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="hover:bg-surface-hover transition-smooth cursor-pointer">
                    <td>
                      <div>
                        <p className="font-medium text-text-primary">ABC Pvt Ltd</p>
                        <p className="text-xs text-text-secondary">abc@example.com</p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">Domain</span>
                    </td>
                    <td>
                      <p className="text-sm text-text-secondary">25 Mar 2026</p>
                    </td>
                    <td className="text-right">
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition-smooth">
                        <svg
                          className="w-5 h-5 text-text-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TEAM WORKLOAD */}
          {/* <div className="card rounded-xl p-5 bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Team Workload</h3>

            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span className="font-medium">Rahul</span>
                <span className="badge badge-warning px-3 py-1 rounded-full text-xs">
                  Busy
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span className="font-medium">Anita</span>
                <span className="badge badge-success px-3 py-1 rounded-full text-xs">
                  Available
                </span>
              </li>
            </ul>
          </div> */}

        </div>
      </main>

      <Footer />
    </div>
  );
}
