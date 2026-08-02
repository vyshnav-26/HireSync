import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-[#991B1B]">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-sm font-medium text-[#EF4444] hover:text-[#DC2626]"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
