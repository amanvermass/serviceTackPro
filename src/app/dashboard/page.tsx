import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Dashboard() {
  return (
    <div className="bg-background min-h-screen flex flex-col w-full">
      <Header />

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* PAGE TITLE */}
        <div className="mb-8 space-y-1">
          <h1 className="font-heading font-bold text-text-primary text-2xl sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            Overview of renewals, tasks, workload, and business health
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Upcoming Renewals', value: 12 },
            { label: 'Open Tasks', value: 18 },
            { label: 'Active Projects', value: 9 },
            { label: 'Leads in Pipeline', value: 14 },
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
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-text-secondary border-b">
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Renewal Date</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <td className="py-4 font-medium">ABC Pvt Ltd</td>
                    <td className="py-4">Domain</td>
                    <td className="py-4 text-sm text-text-secondary">
                      25 Mar 2026
                    </td>
                    <td className="py-4 text-right">
                      <button className="kebab-btn hover:bg-muted rounded-md px-2">
                        ⋮
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TEAM WORKLOAD */}
          <div className="card rounded-xl p-5 bg-card shadow-sm">
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
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
