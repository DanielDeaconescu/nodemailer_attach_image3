// Toast controller - a function which can make the toast appear
const showToast = (message, isError = false) => {
  const toast = document.getElementById("toast");
  toast.className = isError ? "toast-error" : "toast-success";
  toast.textContent = message;
  toast.classList.add("toast-visible");

  setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, 3000);
};

const validateForm = (form) => {
  const errors = [];
  const fields = [
    {
      name: "name",
      label: "Full Name",
    },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "message",
      label: "Message",
    },
  ];

  // If a field is missing, throw a relevant error
  fields.forEach((field) => {
    if (!form.elements[field.name].value.trim()) {
      errors.push(`${field.label} is required`);
    }
  });

  // Basic email validation
  const email = form.elements.email.value;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please provide a valid email");
  }

  // File validation
  const attachment = form.elements.attachment;
  if (attachment && attachment.files.length > 0) {
    const allowedTypes = ["image/jpeg", "image/png"];
    const files = Array.from(attachment.files);

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(
          `Invalid file type: ${file.name}. Only JPG and PNG are allowed`
        );
      }
    });
  }

  return errors;
};

// Form submission
const form = document.getElementById("formWithImage2");

// Spinner controller
const showSpinner = (show) => {
  const spinner = document.querySelector(".spinner-border");
  if (show) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  showSpinner(true);
  const formData = new FormData(form);
  // Check if the Turnstile token exists
  const turnstileToken = document.querySelector(
    '[name="cf-turnstile-response"]'
  )?.value;

  if (!turnstileToken) {
    showToast("Please complete the CAPTCHA verification!", true);
    showSpinner(false);
    return;
  }

  // Validation
  const errors = validateForm(form);
  if (errors.length > 0) {
    showSpinner(errors.join(", "), true);
    showSpinner(false);
    return;
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Request failed");
    }

    showToast("Message sent successfully!");
    form.reset();
    showSpinner(false);
    setTimeout(() => {
      window.location.href = "thank-you.html";
    }, 1500);
  } catch (error) {
    showToast(error.message || "Failed to send message", true);
    showSpinner(false);
  }
});
