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

window.onerror = function(message, source, lineno, colno, error) {

    // Check for specific expected errors like Illegal invocation
    if (message && message.includes('Illegal invocation')) {
        // Show a warning toast for expected errors
        showWarningToast(message);
    } else {
        // For all other errors, show the error toast
        showErrorToast(message);
    }
};

// Optionally handle resource loading errors (e.g., images, scripts)
window.addEventListener('error', function (event) {
    if (event.target instanceof HTMLElement) {
        console.error('Resource loading error:', event.target);
        showErrorToast('A resource failed to load. Please try again.');
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
        <div class="toast-header">
            <strong class="me-auto">Update Available</strong>
            <small class="update-time">${timeSince(updateTime)}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${updateMessage}
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
}

// Fetch headers and show the update toast based on the response headers
document.addEventListener('DOMContentLoaded', function () {
    // Fetch the current document's headers
    fetch(window.location.href).then(function (response) {
        // Get custom headers for update information
        const updateAvailable = response.headers.get('X-Update-Available');
        const localVersion = response.headers.get('X-Local-Version');
        const remoteVersion = response.headers.get('X-Remote-Version');

        // Check if update is available and show the toast
        if (updateAvailable === 'True') {
            showUpdateToast(`A new version of Flask-ProfilerForked (${remoteVersion}) is available. You are currently using ${localVersion}.`);
        }
    });
});
