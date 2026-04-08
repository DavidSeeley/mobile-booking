import { Check } from 'lucide-react';

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  nextSaved?: boolean;
  hideBack?: boolean;
  hideNext?: boolean;
}

export function StepFooter({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Continue',
  nextDisabled = false,
  nextLoading = false,
  nextSaved = false,
  hideBack = false,
  hideNext = false,
}: Props) {
  return (
    <footer className="w-full border-t border-gray-200 bg-white px-6 md:px-8 py-4">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {!hideBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← {backLabel}
          </button>
        ) : <div />}

        {!hideNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || nextLoading}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-40 ${
              nextSaved ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'
            }`}
          >
            {nextSaved
              ? <><Check className="h-3.5 w-3.5" /> Saved</>
              : nextLoading
              ? 'Saving…'
              : <>{nextLabel} →</>}
          </button>
        )}
      </div>
    </footer>
  );
}
