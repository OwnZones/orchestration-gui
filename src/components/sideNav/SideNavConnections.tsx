'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import checkApiConnections from '../../utils/checkApiConnections';
import checkAppHealth from '../../utils/checkAppHealth';
import Icons from '../icons/Icons';

interface IObject {
  connected?: boolean;
  url?: string;
}

interface IConnection {
  database?: IObject;
  liveApi?: IObject;
  message?: string;
}

interface IApp {
  message?: string;
  version?: string;
}

const SideNavConnections = () => {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<IConnection>({});
  const [appHealth, setAppHealth] = useState<IApp>({});
  const [allConnected, setAllConnected] = useState<boolean>(false);
  const t = useTranslate();
  const [isAppHovered, setIsAppHovered] = useState(false);

  // TODO Maybe there is a better way to compare the objects.
  const checkConnections = useCallback(() => {
    checkApiConnections()
      .then((data) => {
        setConnection(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setConnection({});
      });
  }, []);

  const checkApp = useCallback(() => {
    checkAppHealth()
      .then((data) => {
        setAppHealth(data);
      })
      .catch(() => {
        setAppHealth({});
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkConnections();
    }, 60000);
    checkConnections();
    checkApp();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAllConnected(
      !!(
        appHealth.version &&
        connection.database?.connected &&
        connection.liveApi?.connected
      )
    );
  }, [connection, appHealth]);

  return (
    <div className="flex p-4 overflow-hidden">
      <Icons
        name={allConnected ? 'IconPlugConnected' : 'IconPlugConnectedX'}
        className={`min-w-8 min-h-8 mr-4 ${
          allConnected ? 'text-confirm' : 'text-button-delete'
        }`}
      />
      <div>
        <div>{t('connections')}</div>
        <div className="flex text-xs flex-col h-16">
          {loading ? (
            <h2>{t('setting_up')}</h2>
          ) : (
            <>
              <div
                className={`relative ${
                  appHealth?.version ? 'text-confirm' : 'text-button-delete'
                }`}
                onMouseEnter={() => setIsAppHovered(true)}
                onMouseLeave={() => setIsAppHovered(false)}
              >
                {t('application')}
                {isAppHovered && (
                  <div
                    className="absolute top-[-40px] bg-black text-white px-3 py-1 rounded-md text-sm shadow-lg"
                    style={{ whiteSpace: 'nowrap', width: 'auto' }}
                  >
                    Application version: {appHealth?.version}
                  </div>
                )}
              </div>
              <div
                className={`relative ${
                  connection?.liveApi?.connected
                    ? 'text-confirm'
                    : 'text-button-delete'
                }`}
              >
                {t('system_controller')}
              </div>
              <div
                className={`relative ${
                  connection?.database?.connected
                    ? 'text-confirm'
                    : 'text-button-delete'
                }`}
              >
                {t('database')}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideNavConnections;
