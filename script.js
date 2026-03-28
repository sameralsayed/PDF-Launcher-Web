$(document).ready(function() {
    let pdfFiles = []; // {id, name, url}
    let selectedFiles = new Set();
    let currentPdfUrl = null;

    // Set pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Upload handler
    $('#uploadBtn').on('click', function() {
        $('#fileInput').click();
    });

    $('#fileInput').on('change', function(e) {
        const files = e.target.files;
        Array.from(files).forEach(file => {
            if (file.type === 'application/pdf') {
                const url = URL.createObjectURL(file);
                const id = Date.now() + Math.random();
                pdfFiles.push({ id, name: file.name, url });
                renderPdfList();
            }
        });
        // Auto-open the first uploaded file
        if (pdfFiles.length > 0) {
            openPdf(pdfFiles[pdfFiles.length - 1]);
        }
    });

    function renderPdfList() {
        const $list = $('#pdfList');
        $list.empty();

        pdfFiles.forEach(file => {
            const $item = $(`
                <div class="list-group-item d-flex justify-content-between align-items-center" data-id="${file.id}">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-file-pdf text-danger me-3"></i>
                        <span class="text-truncate" style="max-width: 220px;">${file.name}</span>
                    </div>
                    <input type="checkbox" class="form-check-input select-pdf" data-id="${file.id}">
                </div>
            `);

            $item.on('click', function(e) {
                if (!$(e.target).is('input')) {
                    openPdf(file);
                }
            });

            $list.append($item);
        });
    }

    function openPdf(file) {
        currentPdfUrl = file.url;
        $('#currentFileName').text(file.name);
        $('#pdfViewer').attr('src', `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(file.url)}`);

        // Highlight active item
        $('.list-group-item').removeClass('active');
        $(`.list-group-item[data-id="${file.id}"]`).addClass('active');
    }

    // Batch delete
    $('#deleteSelected').on('click', function() {
        if (selectedFiles.size === 0) {
            alert("Select PDFs to delete");
            return;
        }
        if (!confirm(`Delete ${selectedFiles.size} selected PDF(s)?`)) return;

        pdfFiles = pdfFiles.filter(file => {
            if (selectedFiles.has(file.id)) {
                URL.revokeObjectURL(file.url);
                return false;
            }
            return true;
        });

        selectedFiles.clear();
        renderPdfList();

        // If current viewed file was deleted
        if (currentPdfUrl && !pdfFiles.some(f => f.url === currentPdfUrl)) {
            $('#pdfViewer').attr('src', '');
            $('#currentFileName').text('Select a PDF to view');
        }
    });

    // Checkbox selection
    $(document).on('change', '.select-pdf', function() {
        const id = $(this).data('id');
        if (this.checked) {
            selectedFiles.add(id);
        } else {
            selectedFiles.delete(id);
        }
    });

    // Dark/Light mode toggle
    $('#toggleTheme').on('click', function() {
        $('body').toggleClass('dark-mode');
        const icon = $(this).find('i');
        if ($('body').hasClass('dark-mode')) {
            icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            icon.removeClass('fa-sun').addClass('fa-moon');
        }
    });

    // Keyboard support: Delete key
    $(document).on('keydown', function(e) {
        if (e.key === "Delete" && selectedFiles.size > 0) {
            $('#deleteSelected').click();
        }
    });

    // Demo: Add a sample message on first load
    setTimeout(() => {
        if (pdfFiles.length === 0) {
            const $empty = $(`<div class="list-group-item text-center text-muted py-5">
                <i class="fas fa-file-pdf fa-3x mb-3 opacity-50"></i>
                <p>Upload PDF files to begin</p>
                <small>Fast • Private • No lag</small>
            </div>`);
            $('#pdfList').append($empty);
        }
    }, 500);
});
