import { APIContracts, APIControllers, Constants } from "authorizenet";

const { AUTHORIZE_ENV, AUTHORIZE_API_LOGIN_ID, AUTHORIZE_TRANSACTION_KEY } =
  process.env;

export function getMerchantAuth() {
  const auth = new APIContracts.MerchantAuthenticationType();
  auth.setName(AUTHORIZE_API_LOGIN_ID || "");
  auth.setTransactionKey(AUTHORIZE_TRANSACTION_KEY || "");
  return auth;
}

export function getEndpoint() {
  const env = (AUTHORIZE_ENV || "SANDBOX").toUpperCase();
  return env === "PRODUCTION"
    ? Constants.endpoint.production
    : Constants.endpoint.sandbox;
}

export { APIContracts, APIControllers };
