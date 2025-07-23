namespace NodeJS {
  interface ProcessEnv {
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    JWT_OTP_SECRET: string;
    JWT_PASS_RESET_SECRET: string;
    JWT_PASS_RESET_EXPIRES_IN: string;
  }
}
