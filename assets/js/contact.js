(() => {
  const form = document.querySelector('[data-js="contact-form"]');
  const status = document.querySelector('[data-js="contact-form-status"]');

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const reason = data.get("reason") || "General enquiry";
    const body = [
      `Name: ${data.get("name") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Phone: ${data.get("phone") || ""}`,
      `Reason: ${reason}`,
      "",
      data.get("message") || "",
    ].join("\n");

    const mailto =
      "mailto:reception@helmsandwhite.com.au" +
      `?subject=${encodeURIComponent(`Website enquiry – ${reason}`)}` +
      `&body=${encodeURIComponent(body)}`;

    if (status) {
      status.textContent =
        "Your email app is opening. Review the message before sending it to reception.";
    }

    window.location.href = mailto;
  });
})();
