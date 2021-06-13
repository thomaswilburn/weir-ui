import ElementBase from "./lib/elementBase.js";
import { get, post } from "./lib/api.js";
import events from "./lib/events.js";
import { endpoint } from "./config.js";

var fills = {
  error: "#600",
  unknown: "#E70",
  connected: "#0C4",
  offline: "gray"
};

class ConnectionStatus extends ElementBase {
  static boundMethods = ["onKey", "networkUpdate", "ping", "authenticate"];

  constructor() {
    super();

    window.addEventListener("offline", this.networkUpdate);
    window.addEventListener("online", this.networkUpdate);

    this.elements.submit.addEventListener("click", this.authenticate);
    this.elements.totp.addEventListener("keydown", this.onKey);

    var url = new URL(endpoint, window.location.href);
    this.elements.domain.innerHTML = url.hostname;

    events.on("totp-challenge", this.networkUpdate);

    this.ping();
  }

  connectedCallback() {
    this.scrollIntoView();
  }

  async ping() {
    if (!navigator.onLine) return this.networkUpdate();
    this.setStatus("unknown", "Connecting");
    try {
      var response = await get("/checkpoint");
      if (!response.authenticated) {
        this.setStatus("error", "Unauthenticated");
        this.scrollIntoView({ behavior: "smooth" });
        this.elements.totp.focus({ preventScroll: true });
      } else {
        this.setStatus("connected", "Connected");
        this.elements.totp.value = "";
      }
      this.elements.auth.toggleAttribute("hidden", response.authenticated);
    } catch (err) {
      this.setStatus("error", "Unreachable");
    }
  }

  setStatus(type, text) {
    this.elements.icon.setAttribute("fill", fills[type]);
    this.elements.status.innerHTML = text;
  }

  networkUpdate() {
    var status = window.navigator.onLine;
    if (status) {
      this.ping();
    } else {
      this.setStatus("offline", "Offline");
    }
  }

  async authenticate() {
    var value = this.elements.totp.value.trim();
    if (!value) return;
    var result = await post("/checkpoint", { totp: value });
    if (result.success) {
      this.setStatus("connected", "Connected");
      events.fire("connection-established");
    } else {
      this.setStatus("error", "Bad TOTP")
    }
    this.elements.auth.toggleAttribute("hidden", result.success);
  }

  onKey(e) {
    if (e.key == "Enter") {
      this.authenticate();
    }
  }

  static template = `
<style>
:host {
  display: block;
  padding: 16px 0;
}

.status {
  font-size: var(--font-size-5);
}

svg {
  width: 12px;
  display: inline-block;
}

input {
  width: 150px;
  padding: 8px;
  border: none;
  border-bottom: 1px solid var(--foreground);
}

input:focus {
  outline: 2px solid var(--foreground);
  border: none;
}

</style>
<div as="domain"></div>
<div class="status">
  <svg viewBox="0 0 16 16">
    <circle as="icon" cx=8 cy=8 r=7 fill="none" stroke="none" />
  </svg>
  <span as="status"></span> - <span as="domain"></span>
</div>
<div hidden as="auth">
  <input type="tel" as="totp" placeholder="Enter TOTP" maxlength=6>
  <button as="submit">Send</button>
</div>
  `
}

ConnectionStatus.define("connection-status");
