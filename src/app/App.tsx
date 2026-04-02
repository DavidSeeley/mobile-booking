import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { FormProvider } from '@/context/FormContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <FormProvider>
        <RouterProvider router={router} />
      </FormProvider>
    </ErrorBoundary>
  );
}