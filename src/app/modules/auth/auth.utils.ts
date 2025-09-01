import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";

// You may define an interface for payload if needed
export const createToken = (
  payload: string | Buffer | object,
  secret: Secret,
  expiresIn: StringValue | number
): string => {
  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
