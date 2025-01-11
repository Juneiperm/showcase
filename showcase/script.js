let currentImage = null; // Variable to store the current image data

function showContent() {
    const urlInput = document.getElementById('url-input').value;
    const contentDisplay = document.getElementById('content-display');
    const autoHttpToggle = document.getElementById('auto-http-toggle').checked;

    let url = urlInput.trim();
    if (autoHttpToggle) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
    }

    if (url) {
        const proxyUrl = `http://192.168.86.30:3000/proxy?url=${encodeURIComponent(url)}`;
        contentDisplay.innerHTML = `<iframe src="${proxyUrl}" frameborder="0" width="100%" height="500px"></iframe>`;
    } else {
        contentDisplay.innerHTML = 'Please enter a valid URL.';
    }
}

function showFileContent() {
    const fileInput = document.getElementById('file-input');
    const contentDisplay = document.getElementById('content-display');
    const file = fileInput.files[0];
    const imageControls = document.getElementById('image-controls');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            if (file.type.startsWith('image/')) {
                currentImage = e.target.result; // Store the image data
                imageControls.style.display = 'block'; // Show image controls
                updateImageSize(document.getElementById('size-slider').value); // Display the image in the default size
            } else if (file.type === 'application/pdf') {
                currentImage = null;
                imageControls.style.display = 'none'; // Hide image controls
                displayPDF(e.target.result);
            } else {
                currentImage = null;
                imageControls.style.display = 'none'; // Hide image controls
                contentDisplay.innerHTML = `<pre>${e.target.result}</pre>`;
            }
        };
        reader.readAsDataURL(file);
    } else {
        contentDisplay.innerHTML = 'Please select a file to display.';
    }
}

function updateImageSize(size) {
    const contentDisplay = document.getElementById('content-display');
    const sliderValue = document.getElementById('slider-value');
    const customSizeInput = document.getElementById('custom-size');

    if (currentImage) {
        contentDisplay.innerHTML = `<div class="image-container">
                                        <img src="${currentImage}" alt="Imported Image" width="${size}">
                                    </div>`;
        sliderValue.textContent = `${size}px`;
        customSizeInput.value = size; // Sync the custom size input with the slider value
    }
}

function displayPDF(url) {
    const contentDisplay = document.getElementById('content-display');
    contentDisplay.innerHTML = '';

    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');

        // Fetch the first page
        const pageNumber = 1;
        pdf.getPage(pageNumber).then(function(page) {
            console.log('Page loaded');

            const scale = 1.5;
            const viewport = page.getViewport({scale: scale});

            // Prepare canvas using PDF page dimensions
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);
            renderTask.promise.then(function() {
                console.log('Page rendered');
            });

            // Add canvas to the content display
            contentDisplay.appendChild(canvas);
        });
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.sidebar').classList.toggle('dark-mode');
    document.querySelector('.content').classList.toggle('dark-mode');
    document.getElementById('content-display').classList.toggle('dark-mode');

    const inputs = document.querySelectorAll('.sidebar input[type="text"], .sidebar input[type="file"], .sidebar input[type="number"], .sidebar button');
    inputs.forEach(input => {
        input.classList.toggle('dark-mode');
    });
}

// Add event listener for Enter key on URL input
document.getElementById('url-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission behavior
        showContent(); // Call the function to show the content
    }
});
