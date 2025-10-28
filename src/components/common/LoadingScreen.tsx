import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const { t } = useTranslation(['common']);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-300 text-lg">{message || t('common:message.generating')}</p>
    </div>
  );
};
