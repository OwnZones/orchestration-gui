import Link from 'next/link';
import { useTranslate } from '../../i18n/useTranslate';

export default function HeaderNavigation({
  children
}: {
  children: React.ReactNode;
}) {
  const t = useTranslate();
  return (
    <div className="flex flex-row justify-between">
      <div className="m-2 rounded">
        <Link
          className="bg-button-bg hover:bg-button-hover-bg text-button-text font-bold py-2 px-4 rounded inline-flex items-center"
          href={'/'}
        >
          <span>{t('homepage')}</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
