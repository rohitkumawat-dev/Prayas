import React from 'react';
import { Award, Calendar, Hash } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { Certificate } from '@/types';
import { Button } from '@/components/ui/button';

interface CertificateCardProps {
  certificate: Certificate;
  onClick?: () => void;
}

export function CertificateCard({ certificate, onClick }: CertificateCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors">
      <div className="h-32 bg-gradient-to-br from-emerald-900/40 to-slate-900 flex flex-col items-center justify-center border-b border-slate-800 p-6 text-center">
        <Award className="w-12 h-12 text-emerald-500 mb-2" />
        <h3 className="font-semibold text-emerald-400 line-clamp-1">{certificate.course_title}</h3>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Issued: {formatDate(certificate.issued_at)}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Hash className="w-4 h-4 text-slate-500" />
          <span className="font-mono text-xs">{certificate.certificate_uid}</span>
        </div>
        
        {onClick && (
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={onClick}
          >
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}
