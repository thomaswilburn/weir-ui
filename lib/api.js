import { endpoint } from "../config.js";
import { fire } from "./events.js";

var credentials = "include";

var normalize = url => url.toString().replace(/\/+(\w)/g, "/$1");

export var get = async function(path, params = {}) {
  var url = new URL(endpoint + "/" + path, window.location.href);
  for (var k in params) {
    url.searchParams.set(k, params[k]);
  }
  try {
    var response = await fetch(normalize(url), { credentials });
    var json = response.json();
    if (json.challenge) {
      fire("connection:totp-challenge");
      throw "TOTP challenge issued";
    }
    return json;
  } catch (err) {
    fire("connection:error", err);
  }
}

export var post = async function(path, data) {
  var url = new URL(endpoint + "/" + path, window.location.href);
  try {
    var response = await fetch(normalize(url), {
      method: "POST",
      body: JSON.stringify(data),
      credentials
    });
    var json = response.json();
    if (json.challenge) {
      fire("connection:totp-challenge");
      throw "TOTP challenge issued";
    }
    return json;
  } catch (err) {
    fire("connection:error", err);
  }
}