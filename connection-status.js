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
  static boundMethods = ["networkUpdate", "ping", "authenticate"];

  constructor() {
    super();

    window.addEventListener("offline", this.networkUpdate);
    window.addEventListener("online", this.networkUpdate);

    this.elements.submit.addEventListener("click", this.authenticate);

    var url = new URL(endpoint);
    this.elements.domain.innerHTML = url.hostname;

    this.ping();
  }

  async ping() {
    if (!navigator.onLine) return this.networkUpdate();
    this.setStatus("unknown", "Connecting");
    try {
      var response = await get("/checkpoint");
      if (!response.authenticated) {
        this.setStatus("error", "Unauthenticated");
      } else {
        this.setStatus("connected", "Connected");
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

  static template = `
<style>
:host {
  display: block;
}

.status {
  font-size: var(--font-size-5);
}

svg {
  width: 12px;
  display: inline-block;
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
  <input type="tel" as="totp" placeholder="Enter TOTP">
  <button as="submit">Send</button>
</div>
  `
}

ConnectionStatus.define("connection-status");
