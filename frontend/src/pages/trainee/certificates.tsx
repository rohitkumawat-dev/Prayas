import { useState, useEffect } from 'react';
import { certificatesService } from '@/services/certificates';
import { CertificateCard } from '@/components/shared/certificate-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Award, Printer } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Certificate } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { formatDate } from '@/utils/format';
import { useSEO } from '@/hooks/use-seo';

export default function TraineeCertificates() {
  useSEO({ title: 'My Certificates', description: 'View and download your earned certificates.', noindex: true });
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await certificatesService.getCertificates();
      setCertificates(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (error) return <ErrorState onRetry={fetchCertificates} />;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">My Certificates</h1>
        <p className="text-slate-400">View, download, and verify your earned credentials.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState 
          icon={Award}
          title="No certificates yet"
          description="Complete all course lessons and achieve passing scores on assessments to earn certified credentials."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <CertificateCard 
              key={cert.id} 
              certificate={cert} 
              onClick={() => setSelectedCert(cert)}
            />
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <Dialog
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        className="max-w-3xl p-0 overflow-hidden print:w-full print:max-w-none print:shadow-none print:bg-white"
      >
        {selectedCert && (
          <div className="bg-slate-900 print:bg-white print:text-black rounded-xl overflow-hidden relative">
            <div className="p-10 md:p-14 border-[12px] border-slate-800 print:border-double print:border-gray-800 m-4 rounded flex flex-col items-center text-center relative z-10">
              <Award className="w-14 h-14 text-emerald-400 mb-4 print:text-emerald-700" />
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-100 print:text-black mb-1 uppercase tracking-widest">
                Certificate
              </h2>
              <p className="text-sm text-emerald-400 print:text-emerald-700 font-semibold tracking-widest uppercase mb-8">
                Of Completion
              </p>
              
              <p className="text-slate-400 print:text-gray-600 mb-3 text-sm italic">This is proudly presented to</p>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 print:text-black mb-3 border-b border-slate-700 print:border-gray-300 pb-2 px-8">
                {selectedCert.user_name || user?.name || "Student"}
              </h3>
              
              <p className="text-slate-400 print:text-gray-600 mb-4 text-sm italic max-w-lg">
                for successfully completing the curriculum and demonstrating competency in
              </p>
              
              <h4 className="text-xl sm:text-2xl font-semibold text-violet-300 print:text-gray-900 mb-10">
                {selectedCert.course_title}
              </h4>
              
              <div className="w-full flex justify-between items-end mt-6 border-t border-slate-800 print:border-gray-300 pt-6">
                <div className="text-left">
                  <p className="text-sm text-slate-200 print:text-gray-800 font-medium">{formatDate(selectedCert.issued_at)}</p>
                  <p className="text-xs text-slate-500 print:text-gray-500 uppercase tracking-wider mt-0.5">Date Issued</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-slate-200 print:text-gray-800 font-medium">{selectedCert.trainer_name}</p>
                  <p className="text-xs text-slate-500 print:text-gray-500 uppercase tracking-wider mt-0.5">Instructor</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-[11px] font-mono text-slate-500 print:text-gray-400">Credential ID: {selectedCert.certificate_uid}</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 print:hidden">
              <Button variant="ghost" onClick={() => setSelectedCert(null)}>Close</Button>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Print Certificate
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
