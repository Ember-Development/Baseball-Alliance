import app from "./app.js";
import { ENV } from "./env.js";

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${ENV.PORT}`);
  if (ENV.NODE_ENV === "production") {
    console.log(`[env] BAMS magic-link base URL: ${ENV.FRONTEND_URL}`);
  }
});
