import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { WorkOrder } from '../types/api';

export function WorkOrdersPage() {
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await api.getWorkOrders());
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Work Orders</h2>
      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Building</th>
              <th className="p-2 text-left">Contractor</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.id}</td>
                <td className="p-2">{item.building?.address || '-'}</td>
                <td className="p-2">{item.contractor?.name || '-'}</td>
                <td className="p-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
