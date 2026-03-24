import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Contractor } from '../types/api';

export function ContractorsPage() {
  const [items, setItems] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setItems(await api.getContractors());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await api.createContractor({
      name: String(form.get('name') || ''),
      licenseNumber: String(form.get('licenseNumber') || ''),
      licenseExpiryDate: String(form.get('licenseExpiryDate') || ''),
      phone: String(form.get('phone') || ''),
    });

    event.currentTarget.reset();
    await load();
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Contractors</h2>

      <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 rounded-lg border">
        <input name="name" placeholder="Name" className="border rounded px-3 py-2" required />
        <input
          name="licenseNumber"
          placeholder="License Number"
          className="border rounded px-3 py-2"
          required
        />
        <input name="licenseExpiryDate" type="date" className="border rounded px-3 py-2" required />
        <input name="phone" placeholder="Phone" className="border rounded px-3 py-2" />
        <button className="bg-slate-900 text-white rounded px-3 py-2">Add Contractor</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">License</th>
              <th className="p-2 text-left">Expiry</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.licenseNumber}</td>
                <td className="p-2">{item.licenseExpiryDate}</td>
                <td className="p-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
