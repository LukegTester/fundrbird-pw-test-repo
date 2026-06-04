export type LoginUserModel = {
  email: string;
  password: string;
};

export type ApiLoginResponseBody = {
  success: boolean;
  data: {
    token: string;
    user: {
      email: string;
    };
  };
};
