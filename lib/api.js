import { endpoint } from "../config.js";
import { fire } from "./events.js";

var credentials = "include";

export var get = async function(path, params = {}) {
  var url = new URL(endpoint + "/" + path, window.location.href);
  for (var k in params) {
    url.searchParams.set(k, params[k]);
  }
  var response = await fetch(url.toString(), { credentials });
  return response.json();
}

export var post = async function(path, data) {
  var url = new URL(endpoint + "/" + path, window.location.href);
  var response = await fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify(data),
    credentials
  });
  return response.json();
}