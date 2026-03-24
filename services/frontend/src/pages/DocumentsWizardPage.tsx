import { useMemo, useState } from 'react';
import { api } from '../services/api';
import type { ExtractionResponse } from '../types/api';

const steps = ['Upload', 'Review Extraction', 'Blocking Issues', 'Confirm'];

export function DocumentsWizardPage() {
  const [step, setStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [payload, setPayload] = useState<ExtractionResponse | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const hasBlockingIssue = useMemo(() => (payload?.blockingIssues?.length ?? 0) > 0, [payload]);

  async function runExtraction() {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsBusy(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.extractDocument(selectedFile);
      setPayload(result);
      setStep(1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function confirm() {
    if (!payload) return;

    setIsBusy(true);
    setError('');
    setSuccess('');

    try {
      await api.confirmDocument({
        fileId: payload.fileId,
        contractor: {
          name: payload.extraction.contractor?.name,
          licenseNumber: payload.extraction.contractor?.license_number,
          licenseExpiryDate: payload.extraction.contractor?.license_expiry_date,
          phone: payload.extraction.contractor?.phone,
        },
        building: {
          address: payload.extraction.building?.address,
          permitNumber: payload.extraction.building?.permit_number,
          ownerName: payload.extraction.building?.owner_name,
        },
        workOrder: {
          description: payload.extraction.work_order?.description,
          status: payload.extraction.work_order?.status,
        },
      });
      setSuccess('Document confirmed successfully. Records updated.');
      setStep(3);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Document Processing Wizard</h2>
      <p className="text-sm text-slate-600">Flow: Frontend → NestJS → FastAPI → NestJS → DB</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {steps.map((title, index) => (
          <div
            key={title}
            className={`rounded-md px-3 py-2 text-sm border ${index <= step ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300'}`}
          >
            {index + 1}. {title}
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-4">
        {step === 0 && (
          <>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <button onClick={runExtraction} disabled={isBusy} className="bg-slate-900 text-white rounded px-3 py-2">
              {isBusy ? 'Extracting...' : 'Upload & Extract'}
            </button>
          </>
        )}

        {step >= 1 && payload && (
          <>
            <div className="text-sm">
              <p>
                <span className="font-medium">Entity Type:</span> {payload.extraction.entity_type}
              </p>
              <p>
                <span className="font-medium">Confidence:</span> {(payload.extraction.confidence * 100).toFixed(1)}%
              </p>
              <p>
                <span className="font-medium">Summary:</span> {payload.extraction.raw_summary || '-'}
              </p>
            </div>

            <pre className="bg-slate-100 p-3 rounded text-xs overflow-auto">{JSON.stringify(payload.extraction, null, 2)}</pre>

            {step === 1 && (
              <button onClick={() => setStep(2)} className="bg-slate-900 text-white rounded px-3 py-2">
                Continue to Blocking Check
              </button>
            )}
          </>
        )}

        {step >= 2 && payload && (
          <>
            <div>
              <h3 className="font-medium">Blocking Issues</h3>
              {payload.blockingIssues.length === 0 ? (
                <p className="text-green-700 text-sm">No blocking issues detected.</p>
              ) : (
                <ul className="list-disc pl-5 text-red-700 text-sm">
                  {payload.blockingIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>

            {step === 2 && (
              <button
                onClick={confirm}
                disabled={isBusy || hasBlockingIssue}
                className="bg-slate-900 text-white rounded px-3 py-2 disabled:bg-slate-400"
              >
                {isBusy ? 'Confirming...' : 'Confirm and Persist'}
              </button>
            )}

            {hasBlockingIssue && <p className="text-sm text-red-700">Resolve blocking issues before confirming.</p>}
          </>
        )}

        {step === 3 && success && <p className="text-green-700">{success}</p>}

        {error && <p className="text-red-700 text-sm">{error}</p>}
      </div>
    </section>
  );
}
