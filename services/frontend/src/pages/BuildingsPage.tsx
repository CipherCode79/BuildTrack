import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Building } from '../types/api';

export function BuildingsPage() {
  const [items, setItems] = useState<Building[]>([]);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      setItems(await api.getBuildings());
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await api.createBuilding({
      address: String(form.get('address') || ''),
      permitNumber: String(form.get('permitNumber') || ''),
      ownerName: String(form.get('ownerName') || ''),
    });

    event.currentTarget.reset();
    await load();
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Buildings</h2>

      <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border">
        <input name="address" placeholder="Address" className="border rounded px-3 py-2" required />
        <input name="permitNumber" placeholder="Permit Number" className="border rounded px-3 py-2" />
        <input name="ownerName" placeholder="Owner Name" className="border rounded px-3 py-2" />
        <button className="bg-slate-900 text-white rounded px-3 py-2">Add Building</button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">Permit</th>
              <th className="p-2 text-left">Owner</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.address}</td>
                <td className="p-2">{item.permitNumber || '-'}</td>
                <td className="p-2">{item.ownerName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
