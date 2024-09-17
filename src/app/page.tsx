import React from 'react';
import Link from 'next/link';
import { Button } from '../components/button/Button';
import { useTranslate } from '../i18n/useTranslate';
import { getProductions } from '../api/manager/productions';
import { HomePageContent } from '../components/homePageContent/HomePageContent';

export const dynamic = 'force-dynamic';

async function Home() {
  const t = useTranslate();
  const productions = await getProductions();
  return (
    <>
      <div>
        <div className="mb-5 min-h-[40px] flex justify-between p-2">
          <div className="flex items-center">
            <Link href={'/api/auth/signout'}>
              <Button className="hover:bg-button-hover-bg">
                {t('auth.sign_out')}
              </Button>
            </Link>
          </div>
        </div>
        <HomePageContent productions={productions} />
      </div>
    </>
  );
}

export default Home;
