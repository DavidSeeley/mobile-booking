import { CheckCircle } from 'lucide-react';

interface Props {
  onGoAdmin: () => void;
  onGoSplash: () => void;
}

export function StepDone({ onGoAdmin, onGoSplash }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
      <div className="bg-green-50 rounded-full p-5">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Profile Complete!</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Your contact info, buildings, and unit pricing are all set up and saved.
        </p>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onGoAdmin}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
          Go to Admin
        </button>
        <button type="button" onClick={onGoSplash}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] transition-colors">
          Go to Splash
        </button>
      </div>
    </div>
  );
}
