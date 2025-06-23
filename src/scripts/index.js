import "../styles/styles.css";
import App from "./pages/app";
import PushNotification from "./utils/push-notification";

document.addEventListener("DOMContentLoaded", async () => {
  PushNotification.init();

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});

const mainContent = document.querySelector("#main-content");
const skipLink = document.querySelector(".skip-to-content");

skipLink.addEventListener("click", function (event) {
  event.preventDefault();
  skipLink.blur();
  mainContent.focus();
  mainContent.scrollIntoView();
});
