import jwt, { decode, JwtPayload } from "jsonwebtoken";


export const generateToken = async ({
  payload,
  signature,
  options,
}: {
  payload: Object;
  signature: string;
  options: jwt.SignOptions;
}): Promise<string> => {
  return jwt.sign(payload, signature, options);
};
