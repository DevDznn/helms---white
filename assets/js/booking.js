(() => {
  const form = document.querySelector("#booking-form");
  const ONLINE_BOOKING_URL =
    "https://booking.au.hsone.app/soe/new?pid=AULHL01";

  if (!form) return;

  const steps = Array.from(form.querySelectorAll("[data-booking-step]"));
  const progressItems = Array.from(
    document.querySelectorAll("[data-progress-step]"),
  );
  const nextButton = form.querySelector("[data-booking-next]");
  const backButton = form.querySelector("[data-booking-back]");
  const submitButton = form.querySelector("[data-booking-submit]");
  const mobileStep = document.querySelector("[data-mobile-step]");
  const progressBar = document.querySelector("[data-progress-bar]");
  const existingFields = form.querySelector("[data-existing-patient-fields]");
  const bookerNameField = form.querySelector("[data-booker-name-field]");
  const preferredDate = form.querySelector("#preferred-date");
  const alternateDate = form.querySelector("#alternate-date");
  const dateOfBirth = form.querySelector("#date-of-birth");

  let currentStep = 1;

  const pad = (value) => String(value).padStart(2, "0");

  const toLocalDateInputValue = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const today = new Date();
  const todayValue = toLocalDateInputValue(today);

  if (preferredDate) preferredDate.min = todayValue;
  if (alternateDate) alternateDate.min = todayValue;
  if (dateOfBirth) dateOfBirth.max = todayValue;

  const getStep = (number) =>
    steps.find((step) => Number(step.dataset.bookingStep) === number);

  const clearErrors = (step) => {
    step.querySelectorAll("[aria-invalid='true']").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    const error = step.querySelector("[data-step-error]");
    if (error) error.textContent = "";
  };

  const setError = (step, message, field = null) => {
    const error = step.querySelector("[data-step-error]");
    if (error) error.textContent = message;

    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  };

  const validateStep = (number) => {
    const step = getStep(number);
    if (!step) return true;

    clearErrors(step);

    const requiredFields = Array.from(
      step.querySelectorAll("[required]"),
    ).filter((field) => !field.disabled && !field.closest("[hidden]"));

    for (const field of requiredFields) {
      if (field.type === "radio") {
        const group = step.querySelectorAll(
          `input[type="radio"][name="${CSS.escape(field.name)}"]`,
        );
        const checked = Array.from(group).some((input) => input.checked);

        if (!checked) {
          setError(step, "Please select one option before continuing.");
          group[0]?.focus();
          return false;
        }

        continue;
      }

      if (field.type === "checkbox" && !field.checked) {
        setError(
          step,
          "Please confirm that you understand this is an appointment request.",
          field,
        );
        return false;
      }

      if (!field.value.trim()) {
        setError(step, "Please complete the required field.", field);
        return false;
      }

      if (!field.checkValidity()) {
        setError(
          step,
          field.validationMessage || "Please enter a valid value.",
          field,
        );
        return false;
      }
    }

    return true;
  };

  const formatDate = (value) => {
    if (!value) return "Not selected";

    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const selectedValue = (name) => {
    const field = form.querySelector(`[name="${CSS.escape(name)}"]:checked`);
    return field?.value || "";
  };

  const fieldValue = (name) => {
    const field = form.elements.namedItem(name);
    return field?.value || "";
  };

  const updateReview = () => {
    const values = {
      "patient-type": selectedValue("patient-type"),
      service: selectedValue("service"),
      dentist: selectedValue("dentist"),
      "preferred-date": formatDate(fieldValue("preferred-date")),
      "preferred-time": fieldValue("preferred-time"),
      "alternate-date": formatDate(fieldValue("alternate-date")),
      "patient-name": fieldValue("patient-name"),
      "date-of-birth": formatDate(fieldValue("date-of-birth")),
      phone: fieldValue("phone"),
      email: fieldValue("email"),
    };

    Object.entries(values).forEach(([key, value]) => {
      const target = form.querySelector(`[data-review="${key}"]`);
      if (target) target.textContent = value || "—";
    });
  };

  const showStep = (number, options = {}) => {
    currentStep = Math.min(Math.max(number, 1), steps.length);

    steps.forEach((step) => {
      const isActive = Number(step.dataset.bookingStep) === currentStep;
      step.hidden = !isActive;
      step.classList.toggle("is-active", isActive);
    });

    progressItems.forEach((item) => {
      const itemStep = Number(item.dataset.progressStep);
      const isActive = itemStep === currentStep;

      item.classList.toggle("is-active", isActive);
      item.classList.toggle("is-complete", itemStep < currentStep);

      if (isActive) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    backButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === steps.length;
    submitButton.hidden = currentStep !== steps.length;

    if (mobileStep) {
      mobileStep.textContent = `Step ${currentStep} of ${steps.length}`;
    }

    if (progressBar) {
      progressBar.style.width = `${(currentStep / steps.length) * 100}%`;
    }

    if (currentStep === steps.length) {
      updateReview();
    }

    if (options.focus !== false) {
      getStep(currentStep)
        ?.querySelector(".booking-step__header h2")
        ?.focus?.({ preventScroll: true });
    }

    if (options.scroll !== false) {
      document
        .querySelector(".booking-wizard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  nextButton.addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    showStep(currentStep + 1);
  });

  backButton.addEventListener("click", () => {
    showStep(currentStep - 1);
  });

  form.addEventListener("change", (event) => {
    if (event.target.name === "patient-type" && existingFields) {
      const isExisting = event.target.value === "Existing patient";
      existingFields.hidden = !isExisting;
    }

    if (event.target.name === "booking-for" && bookerNameField) {
      const bookingForSelf = event.target.value === "Myself";
      const bookerNameInput = bookerNameField.querySelector("input");

      bookerNameField.hidden = bookingForSelf || !event.target.value;

      if (bookerNameInput) {
        bookerNameInput.required =
          !bookingForSelf && Boolean(event.target.value);

        if (bookingForSelf) {
          bookerNameInput.value = "";
          bookerNameInput.removeAttribute("aria-invalid");
        }
      }
    }

    if (event.target === preferredDate && alternateDate) {
      alternateDate.min = preferredDate.value || todayValue;

      if (
        alternateDate.value &&
        preferredDate.value &&
        alternateDate.value < preferredDate.value
      ) {
        alternateDate.value = "";
      }
    }
  });

  form.querySelectorAll("[data-edit-step]").forEach((button) => {
    button.addEventListener("click", () => {
      showStep(Number(button.dataset.editStep));
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateStep(currentStep)) return;

    // Do not transmit the locally entered patient details in a URL/query string.
    // The verified Helms & White booking provider collects the required details
    // on its own secure booking flow.
    window.location.assign(ONLINE_BOOKING_URL);
  });

  showStep(1, { focus: false, scroll: false });
})();
