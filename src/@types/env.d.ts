declare namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      EXTERNAL_URL_LOG_QGAMES: string;
      LOCAL_FILE_LOG_QGAMES: string;
      LOCAL_FILE_LOG_ERRORS: string;
    }
  }