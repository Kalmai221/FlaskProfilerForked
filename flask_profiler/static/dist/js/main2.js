 // JavaScript to handle loading alert visibility
 function showLoading() {
    const loadingAlert = document.getElementById("loadingAlert");
    loadingAlert.classList.add("show");
}

function hideLoading() {
    const loadingAlert = document.getElementById("loadingAlert");
    loadingAlert.classList.remove("show");
}

// Simulate data loading for demonstration purposes
document.getElementById("hours").addEventListener("click", function() {
    showLoading();
    setTimeout(hideLoading, 3000); // Simulate a 3-second load
});

document.getElementById("days").addEventListener("click", function() {
    showLoading();
    setTimeout(hideLoading, 3000); // Simulate a 3-second load
});

window.onload = function() {
  showLoading();
  setTimeout(hideLoading, 3000);
};

async function CurrentVersion() {
    try {
        const response = await fetch(window.location.href);
        const localVersion = response.headers.get('X-Local-Version');

        // Return the local version
        return localVersion || "Unknown Version"; // Fallback if no version is found
    } catch (error) {
        console.error('Error fetching current version:', error);
        return "Error fetching version"; // Handle fetch error gracefully
    }
}

async function UpdateAval() {
    try {
        const response = await fetch(window.location.href);
        const AvaliableUpdate = response.headers.get('X-Update-Available');

        // Return the local version
        return AvaliableUpdate || "False"; // Fallback if no version is found
    } catch (error) {
        console.error('Error fetching avaliable update:', error);
        return "Error fetching version"; // Handle fetch error gracefully
    }
}

function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 60);

    if (interval === 0) return "Just now";
    if (interval === 1) return "a minute ago";
    if (interval < 60) return `${interval} minutes ago`;

    interval = Math.floor(interval / 60);
    if (interval === 1) return "an hour ago";
    if (interval < 24) return `${interval} hours ago`;

    interval = Math.floor(interval / 24);
    if (interval === 1) return "Yesterday";
    return `${interval} days ago`;
}

function showWarningToast(warningMessage) {
    // Create a new toast element for warnings
    var toastElement = document.createElement('div');
    toastElement.classList.add('toast', 'bg-warning', 'text-dark');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.style.marginBottom = '10px';

    // Get the current time for the warning
    const warningTime = new Date();

    // Define the toast content with a warning icon and initial relative timestamp
    toastElement.innerHTML = `
        <div class="toast-header bg-warning text-dark">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong class="me-auto">Warning</strong>
            <small class="warning-time">${timeSince(warningTime)}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${warningMessage}</div>
    `;

    // Append the new toast to the container
    document.getElementById('toastContainer').appendChild(toastElement);

    // Initialize and show the new toast
    var toast = new bootstrap.Toast(toastElement, { autohide: false });
    toast.show();

    // Function to update the time displayed in the toast
    function updateTime() {
        const timeElement = toastElement.querySelector('.warning-time');
        timeElement.textContent = timeSince(warningTime);
    }

    // Update the time every minute (60000 milliseconds)
    const intervalId = setInterval(updateTime, 60000);

    // Clean up the interval when the toast is hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        clearInterval(intervalId);
        toastElement.remove();
    });
}

function showErrorToast(errorMessage) {
    // Create a new toast element for errors
    var toastElement = document.createElement('div');
    toastElement.classList.add('toast', 'bg-danger', 'text-white');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.style.marginBottom = '10px';

    // Get the current time for the error
    const errorTime = new Date();

    // Define the toast content with an error icon and initial relative timestamp
    toastElement.innerHTML = `
        <div class="toast-header bg-danger text-white">
            <i class="fas fa-exclamation-circle me-2"></i>
            <strong class="me-auto">Error</strong>
            <small class="error-time">${timeSince(errorTime)}</small>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${errorMessage}</div>
    `;

    // Append the new toast to the container
    document.getElementById('toastContainer').appendChild(toastElement);

    // Initialize and show the new toast
    var toast = new bootstrap.Toast(toastElement, { autohide: false });
    toast.show();

    // Function to update the time displayed in the toast
    function updateTime() {
        const timeElement = toastElement.querySelector('.error-time');
        timeElement.textContent = timeSince(errorTime);
    }

    // Update the time every minute (60000 milliseconds)
    const intervalId = setInterval(updateTime, 60000);

    // Clean up the interval when the toast is hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        clearInterval(intervalId);
        toastElement.remove();
    });
}

async function logErrorToDiscord(errorDetails) {
    const encodedUrl = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTI5OTQ1OTc2NDI5NTU2OTUwMC80RkdVbVJta0Q2V1lyMmEya2hwcFYzSWtjRHpHQ0VYcV9ycEFCUXZkMFYtWDQzbEVuWnB6bk1KVEkteTJkYTI5aDFQaw==";
    const webhookUrl = atob(encodedUrl);

    // Get the application version
    const version = await CurrentVersion(); // Call the async function
    const updatething = await UpdateAval();
    const versiontext = updatething === "True" ? `${version} (Outdated)` : version;

    // Get the current timestamp and format it as DD/MM/YYYY HH:MM:SS with timezone
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Get the timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} (${timeZone})`; // Construct timestamp string

    // Create the embed payload
    const payload = {
        embeds: [
            {
                title: "Error Logged",
                description: `\`\`\`\n${errorDetails}\n\`\`\``,
                fields: [
                    {
                        name: "Version",
                        value: versiontext,
                        inline: true
                    },
                    {
                        name: "Timestamp",
                        value: timestamp,
                        inline: true
                    }
                ],
                color: 16711680, // You can change this to any hex color you like
                footer: {
                    text: "Logged from the application"
                }
            }
        ]
    };

    // Send the payload to Discord
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to send error log to Discord:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error sending to Discord:', error);
    });
}


window.onerror = function(message, source, lineno, colno, error) {
    const consentGiven = localStorage.getItem('logConsent');
    const errorDetails = `Message: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError: ${error}`;

    // Check for specific expected errors like Illegal invocation
    if (message && !message.includes('Illegal invocation')) {
        // Show a warning toast for expected errors
        showErrorToast(message);
    }
    if (consentGiven === 'accepted' && !message.includes('Illegal invocation')) {
        logErrorToDiscord(errorDetails);
    }    
};

// Optionally handle resource loading errors (e.g., images, scripts)
window.addEventListener('error', function (event) {
    const consentGiven = localStorage.getItem('logConsent');

    if (event.target instanceof HTMLElement) {
        // Show the error toast regardless of consent status
        showErrorToast('A resource failed to load. Please try again.');

        // Log the resource loading error only if consent is given
        if (consentGiven === 'accepted') {
            console.error('Resource loading error:', event.target);
        } else {
            console.log("Resource loading error logging skipped: consent not given.");
        }
    }
}, true);


const toggleSwitch = document.getElementById('darkModeSwitch');
const mainNavbar = document.getElementById('mainNavbar');

// Check the current theme on page load
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-bs-theme', currentTheme);
mainNavbar.setAttribute('data-bs-theme', currentTheme); // Set theme for the navbar

// Set the checkbox state based on the current theme
toggleSwitch.checked = currentTheme === 'dark';

toggleSwitch.addEventListener('change', function () {
    const newTheme = this.checked ? 'dark' : 'light'; // Determine new theme
    document.documentElement.setAttribute('data-bs-theme', newTheme); // Set the theme for the document
    mainNavbar.setAttribute('data-bs-theme', newTheme); // Set the theme for the navbar
    localStorage.setItem('theme', newTheme); // Store the new theme in localStorage
    location.reload(); // Reload the page to apply the theme
});


function showUpdateToast(updateMessage) {
    var toastElement = document.createElement('div');
    toastElement.classList.add('toast');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.style.marginBottom = '10px';  // Optional, for spacing between multiple toasts

    const updatedTime = new Date();

    toastElement.innerHTML = `
        <div>
            <div class="toast-header">
                <strong class="me-auto">Update Available</strong>
                <small class="update-time">${timeSince(updatedTime)}</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body clickable">
                ${updateMessage}
            </div>
            <div class="toast-body clickable">
                Click to view the release on GitHub.
            </div>
        </div>
    `;

    document.getElementById('toastContainer').appendChild(toastElement);

    var toast = new bootstrap.Toast(toastElement, { autohide: false });
    toast.show();

    // Function to update the time displayed in the toast
    function updateTime() {
        const timeElement = toastElement.querySelector('.update-time');
        timeElement.textContent = timeSince(updatedTime);
    }

    // Update the time every minute (60000 milliseconds)
    const intervalId = setInterval(updateTime, 60000);

    // Clean up the interval when the toast is hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        clearInterval(intervalId);
        toastElement.remove();
    });

    // Redirect on toast body click, except the close button
    toastElement.querySelector('.clickable').addEventListener('click', function() {
        window.open('https://github.com/Kalmai221/flask-profiler/releases', '_blank');
    });    
}

document.getElementById('deleteDataButton').addEventListener('click', function() {
    // Show confirmation modal
    const deleteDataModal = new bootstrap.Modal(document.getElementById('deleteDataModal'));
    deleteDataModal.show();
});

document.getElementById('confirmDeleteData').addEventListener('click', function() {
    // Get the current full URL, append /api/measurements/deleteall
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, ''); // Ensure no trailing slash
    const apiUrl = baseUrl + "/api/measurements/deleteall";
    console.log(apiUrl)

    // Send the request (defaults to GET method)
    fetch(apiUrl)
    .then(response => {
        if (response.ok) {
            // Optionally, show a success toast or modal
            showSuccessToast('All saved data has been deleted successfully.');
        } else {
            // Handle error (e.g., show error message)
            showErrorToast('An error occurred while deleting the data.');
        }
    })
    .catch(error => {
        // Handle network errors or other issues
        console.error('Error:', error);
        showErrorToast('An error occurred while deleting the data.');
    });

    // Close the modal
    const deleteDataModal = bootstrap.Modal.getInstance(document.getElementById('deleteDataModal'));
    deleteDataModal.hide();
});


document.getElementById('deleteLocalDataButton').addEventListener('click', function() {
    // Show confirmation modal
    const deleteLocalDataModal = new bootstrap.Modal(document.getElementById('deleteLocalDataModal'));
    deleteLocalDataModal.show();
});

document.getElementById('confirmDeleteLocalData').addEventListener('click', function() {
    // Clear all local storage data
    localStorage.clear();
    
    // Optionally, show a success toast or modal
    showSuccessToast('All saved local data has been deleted successfully.');

    // Close the modal
    const deleteLocalDataModal = bootstrap.Modal.getInstance(document.getElementById('deleteLocalDataModal'));
    deleteLocalDataModal.hide();
});

// Function to show success toast (create this if not already defined)
function showSuccessToast(successMessage) {
    // Create a new toast element for success messages
    var toastElement = document.createElement('div');
    toastElement.classList.add('toast', 'bg-success', 'text-white');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.style.marginBottom = '10px';

    // Define the toast content
    toastElement.innerHTML = `
        <div class="toast-header bg-success text-white">
            <strong class="me-auto">Success</strong>
            <small>${new Date().toLocaleTimeString()}</small>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${successMessage}</div>
    `;

    // Append the new toast to the container
    document.getElementById('toastContainer').appendChild(toastElement);

    // Initialize and show the new toast
    var toast = new bootstrap.Toast(toastElement, { autohide: true });
    toast.show();
}


document.addEventListener('DOMContentLoaded', function () {
    // Fetch the current document's headers
    fetch(window.location.href).then(function (response) {
        // Get the custom headers for filtering and emulation
        const filteringEnabled = response.headers.get('X-Filtering-Enabled');
        const filteringRole = response.headers.get('X-Filtering-Role');
        const emulationEnabled = response.headers.get('X-Emulation-Enabled');
        const emulationRole = response.headers.get('X-Emulation-Role');
        const updateAvailable = response.headers.get('X-Update-Available');
        const localVersion = response.headers.get('X-Local-Version');
        const remoteVersion = response.headers.get('X-Remote-Version');
        const userRole = response.headers.get('X-User-Role');

        // Handle filtering feature
        if (filteringEnabled === 'True') {
            console.log("Filtering is enabled for role:", filteringRole);
            // Show the filtering tab link based on role (admins can see it regardless of filteringRole)
            if (userRole === 'admin' || filteringRole === userRole) {
                document.getElementById('filteringTabLink').style.display = 'block';
            } else {
                document.getElementById('filteringTabLink').style.display = 'none';
            }
        } else {
            console.log("Filtering is disabled.");
            document.getElementById('filteringTabLink').style.display = 'none';
        }

        // Handle emulation feature
        if (emulationEnabled === 'True') {
            console.log("Emulation is enabled for role:", emulationRole);
            // Show the emulation tab link based on role (admins can see it regardless of emulationRole)
            if (userRole === 'admin' || emulationRole === userRole) {
                document.getElementById('emulationTabLink').style.display = 'block';
            } else {
                document.getElementById('emulationTabLink').style.display = 'none';
            }
        } else {
            console.log("Emulation is disabled.");
            document.getElementById('emulationTabLink').style.display = 'none';
        }

        // Check if update is available and show the toast
        if (updateAvailable === 'True') {
            showUpdateToast(`A new version of Flask-ProfilerForked (${remoteVersion}) is available. You are currently using ${localVersion}.`);
        }

        // Role-based functionality
        if (userRole === 'admin') {
            // Show the admin tab link for admins
            document.getElementById('adminTabLink').style.display = 'block';
        } else if (userRole === 'user') {
            // Hide the admin tab link for users
            document.getElementById('adminTabLink').style.display = 'none';
        } else {
            console.log('No specific role assigned');
        }
    });

    const consentGiven = localStorage.getItem('logConsent');

    if (consentGiven !== 'accepted') {
        const consentModal = new bootstrap.Modal(document.getElementById('devConsentModal'));
        consentModal.show();
    }

    document.getElementById('acceptDevConsent').addEventListener('click', function() {
        localStorage.setItem('logConsent', 'accepted');
        console.log("User accepted error logging.");
    });

    document.getElementById('declineDevConsent').addEventListener('click', function() {
        localStorage.setItem('logConsent', 'declined');
        console.log("User declined error logging.");
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("emulationForm");
    const headersContainer = document.getElementById("headersContainer");
    const responseOutput = document.getElementById("responseOutput");
    const responseInfo = document.getElementById("responseInfo");
    const historyList = document.getElementById("historyList");
  
    // Add header functionality
    document.getElementById("addHeaderBtn").addEventListener("click", () => {
      const headerDiv = document.createElement("div");
      headerDiv.classList.add("input-group", "mb-1");
      headerDiv.innerHTML = `
        <input type="text" class="form-control header-key" placeholder="Header Name">
        <input type="text" class="form-control header-value" placeholder="Header Value">
        <button type="button" class="btn btn-outline-secondary btn-remove-header">Remove</button>`;
      headersContainer.appendChild(headerDiv);
  
      headerDiv.querySelector(".btn-remove-header").addEventListener("click", () => headerDiv.remove());
    });
  
    // Load history on page load
    loadHistory();
  
    // Submit request
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const method = form.requestMethod.value;
      const url = form.requestUrl.value;
      const body = form.requestBody.value;
      const timeout = parseInt(form.timeout.value) || 3000;
      const saveToHistory = document.getElementById("saveToHistory").checked;
  
      // Collect headers
      const headers = {};
      document.querySelectorAll(".header-key").forEach((keyElem, i) => {
        const key = keyElem.value.trim();
        const value = document.querySelectorAll(".header-value")[i].value.trim();
        if (key) headers[key] = value;
      });
  
      const options = { method, headers, timeout };
      if (method !== "GET" && body) options.body = body;
  
      try {
        const startTime = Date.now();
        const response = await fetch(url, options);
        const endTime = Date.now();
  
        responseInfo.querySelector("#responseStatus").textContent = `Status: ${response.status}`;
        responseInfo.querySelector("#responseTime").textContent = `Time: ${endTime - startTime} ms`;
  
        const contentType = response.headers.get("content-type");
        const data = contentType && contentType.includes("application/json") ? await response.json() : await response.text();
        responseOutput.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  
        // Save request to history if selected
        if (saveToHistory) saveRequestToHistory({ method, url, headers, body });
      } catch (error) {
        responseOutput.textContent = `Error: ${error.message}`;
      }
    });
  
    // Save request to history
    function saveRequestToHistory(request) {
      let history = JSON.parse(localStorage.getItem("requestHistory")) || [];
      history.push(request);
      localStorage.setItem("requestHistory", JSON.stringify(history));
      loadHistory();
    }
  
    // Load history and display in the list
    function loadHistory() {
      const history = JSON.parse(localStorage.getItem("requestHistory")) || [];
      historyList.innerHTML = history
        .map(
          (req, i) => `
          <li class="list-group-item">
            <strong>${req.method}</strong> ${req.url}
            <button class="btn btn-link btn-sm float-end" onclick="rerunRequest(${i})">Rerun</button>
          </li>`
        )
        .join("");
    }
  
    // Rerun a request from history
    window.rerunRequest = function (index) {
      const history = JSON.parse(localStorage.getItem("requestHistory")) || [];
      const { method, url, headers, body } = history[index];
      form.requestMethod.value = method;
      form.requestUrl.value = url;
      form.requestBody.value = body;
  
      // Populate headers
      headersContainer.innerHTML = "";
      for (const [key, value] of Object.entries(headers)) {
        const headerDiv = document.createElement("div");
        headerDiv.classList.add("input-group", "mb-1");
        headerDiv.innerHTML = `
          <input type="text" class="form-control header-key" value="${key}" placeholder="Header Name">
          <input type="text" class="form-control header-value" value="${value}" placeholder="Header Value">
          <button type="button" class="btn btn-outline-secondary btn-remove-header">Remove</button>`;
        headersContainer.appendChild(headerDiv);
      }
    };
});

document.addEventListener('DOMContentLoaded', function () {
    // Get the current path and append "/logout"
    var logoutUrl = window.location.pathname + "/logout";

    // Set the href attribute of the logout link
    document.getElementById('logout-link').href = logoutUrl;
});