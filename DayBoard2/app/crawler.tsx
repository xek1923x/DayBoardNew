import axios from "axios";
import CookieManager from "@react-native-cookies/cookies";

const user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
const LOGIN_URL = "https://www.dsbmobile.de/Login.aspx"

export const loginToDSBMobile = async (username: string, password: string) => {
  try {
    // 1. Get the login page to extract hidden fields
    const response = await axios.get(LOGIN_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = response.data as string;

    // 2. Extract hidden fields
    const extractField = (name: string) =>
      html.match(new RegExp(`id="${name}" value="([^"]*)"`))?.[1] || "";

    const viewState = extractField("__VIEWSTATE");
    const eventValidation = extractField("__EVENTVALIDATION");
    const viewStateGenerator = extractField("__VIEWSTATEGENERATOR");

    if (!viewState || !eventValidation || !viewStateGenerator) {
      throw new Error("Could not extract required hidden fields.");
    }

    // 3. Build form data
    const formData = new URLSearchParams();
    formData.append("__LASTFOCUS", "");
    formData.append("__VIEWSTATE", viewState);
    formData.append("__VIEWSTATEGENERATOR", viewStateGenerator);
    formData.append("__EVENTTARGET", "");
    formData.append("__EVENTARGUMENT", "");
    formData.append("__EVENTVALIDATION", eventValidation);
    formData.append("txtUser", username);
    formData.append("txtPass", password);
    formData.append("ctl03", "Anmelden");

    // 4. Send login POST request
    const loginResponse = await axios.post(LOGIN_URL, formData.toString(), {
      maxRedirects: 0, // Catch redirect manually
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        Referer: LOGIN_URL,
      },
      validateStatus: (status) => status === 302 || status === 200, // Accept redirect as success
    });

    const cookies = loginResponse.headers["set-cookie"];
    const location = loginResponse.headers["location"];

    if (!cookies || !location) {
      throw new Error("Login failed: No cookies or redirect found.");
    }

    // 5. Set the cookie for future requests
    await CookieManager.setFromResponse(LOGIN_URL, cookies.join(";"));

    // 6. Check if redirected to /default.aspx (success)
    if (location.includes("/default.aspx")) {
      console.log("✅ Login successful!");
    } else {
      console.warn("⚠️ Login might have failed. Redirected to:", location);
    }

    return true;
  } catch (error) {
    console.error("❌ Login error:", error);
    return false;
  }
};
