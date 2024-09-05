'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import checkApiConnections from '../../utils/checkApiConnections';
import checkAppHealth from '../../utils/checkAppHealth';
import Status from './Status';
import AppStatus from './AppStatus';

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

export default function Footer() {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<IConnection>({});
  const [appHealth, setAppHealth] = useState<IApp>({});

  const t = useTranslate();

  const checkConnections = useCallback(() => {
    checkApiConnections()
      .then((data) => {
        if (JSON.stringify(data) !== JSON.stringify(connection))
          setConnection(data);
        if (loading) setLoading(() => false);
      })
      .catch(() => {
        if (loading) setLoading(false);
        setConnection({});
      });
  }, []);

  const checkApp = useCallback(() => {
    checkAppHealth()
      .then((data) => {
        if (JSON.stringify(data) !== JSON.stringify(appHealth))
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

  const settingsDb = connection?.database;
  const settingsLive = connection?.liveApi;

  return (
    <div className="flex text-p ml-10">
      {loading ? (
        <h2>{t('setting_up')}</h2>
      ) : (
        <>
          <AppStatus
            version={appHealth?.version}
            message={appHealth?.message}
          />
          <Status
            name="system_controller"
            connected={settingsLive?.connected}
            adress={settingsLive?.url}
          />
          <Status
            name="database"
            connected={settingsDb?.connected}
            adress={settingsDb?.url}
          />
        </>
      )}
    </div>
  );
}
