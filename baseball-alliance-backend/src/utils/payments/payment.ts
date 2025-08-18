import { prisma } from "../../db";
import {
  getMerchantAuth,
  APIContracts,
  APIControllers,
  getEndpoint,
} from "../payments/anetClient";

const {
  ACCEPT_HOSTED_RETURN_URL,
  ACCEPT_HOSTED_CANCEL_URL,
  COMBINE_PRICE_CENTS,
} = process.env;

export async function createAcceptHostedSessionForCombine(opts: {
  registrationId: string;
  userId: string;
  amountCents?: number;
}) {
  // 1) Validate registration
  const reg = await prisma.combineRegistration.findUnique({
    where: { id: opts.registrationId },
  });

  if (!reg) throw new Error("Registration not found");
  if (reg.userId !== opts.userId) throw new Error("Forbidden");
  if (reg.status === "PAID") throw new Error("Already paid");

  const amountCents =
    typeof opts.amountCents === "number"
      ? opts.amountCents
      : Number(COMBINE_PRICE_CENTS || 15000);

  // 2) Create a pending payment row
  const payment = await prisma.combinePayment.create({
    data: {
      combineRegistrationId: reg.id,
      provider: "AUTHORIZE_NET",
      providerRef: "", // fill later on webhook/return
      amountCents,
      status: "REQUIRES_ACTION",
    },
  });

  // 3) Build getHostedPaymentPageRequest
  const auth = getMerchantAuth();

  // order: put an invoiceNumber we can later match to this payment.id
  const order = new APIContracts.OrderType();
  order.setInvoiceNumber(payment.id); // <— critical to link webhook → payment
  order.setDescription(`Combine Registration ${reg.id}`);

  const amount = (amountCents / 100).toFixed(2);

  const txnReq = new APIContracts.TransactionRequestType();
  txnReq.setTransactionType(
    APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
  );
  txnReq.setAmount(amount);
  txnReq.setOrder(order);

  // Hosted payment settings
  const settingList: APIContracts.SettingType[] = [];

  function addSetting(name: string, value: object | string) {
    const s = new APIContracts.SettingType();
    s.setSettingName(name);
    s.setSettingValue(
      typeof value === "string" ? value : JSON.stringify(value)
    );
    settingList.push(s);
  }

  addSetting("hostedPaymentReturnOptions", {
    showReceipt: false,
    url: ACCEPT_HOSTED_RETURN_URL,
    urlText: "Return",
    cancelUrl: ACCEPT_HOSTED_CANCEL_URL,
    cancelUrlText: "Cancel",
  });

  addSetting("hostedPaymentButtonOptions", { text: "Pay Now" });
  addSetting("hostedPaymentOrderOptions", { show: true });
  addSetting("hostedPaymentPaymentOptions", {
    showCreditCard: true,
    showBankAccount: false,
  });
  addSetting("hostedPaymentIFrameCommunicatorUrl", {
    url: "", // not using iframe; empty is fine
  });

  const settings = new APIContracts.ArrayOfSetting();
  settings.setSetting(settingList);

  const request = new APIContracts.GetHostedPaymentPageRequest();
  request.setMerchantAuthentication(auth);
  request.setTransactionRequest(txnReq);
  request.setHostedPaymentSettings(settings);

  const ctrl = new APIControllers.GetHostedPaymentPageController(
    request.getJSON()
  );
  ctrl.setEnvironment(getEndpoint());

  const token: string = await new Promise((resolve, reject) => {
    ctrl.execute(() => {
      const apiRes = new APIContracts.GetHostedPaymentPageResponse(
        ctrl.getResponse()
      );
      if (
        apiRes.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK
      ) {
        const t = apiRes.getToken();
        resolve(t);
      } else {
        const err = apiRes.getMessages().getMessage()[0].getText();
        reject(new Error(err));
      }
    });
  });

  return {
    paymentId: payment.id,
    token,
    // Authorize.net hosted payment URL (token appended by front-end)
    url:
      (process.env.AUTHORIZE_ENV || "SANDBOX").toUpperCase() === "PRODUCTION"
        ? "https://accept.authorize.net/payment/payment"
        : "https://test.authorize.net/payment/payment",
  };
}
