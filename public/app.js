// UI Elements
const dropzone = document.getElementById('dropzone');
const gallery = document.getElementById('gallery');
const cardsList = document.getElementById('cardsList');
const addMoreBtn = document.getElementById('addMoreBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const bulkRotateBtn = document.getElementById('bulkRotateBtn');
const exportBtn = document.getElementById('exportBtn');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const toast = document.getElementById('toast');

// Custom Dropdown Elements
const dropdown = document.getElementById('formatDropdown');
const dropdownSelected = document.getElementById('dropdownSelected');
const dropdownText = document.getElementById('formatSelectedText');
const dropdownList = document.getElementById('dropdownList');
let formatSelectValue = 'webp';

const exportBtnText = document.getElementById('exportBtnText') || { textContent: '' };

// Module Selector
const moduleDropdown = document.getElementById('moduleDropdown');
const moduleSelected = document.getElementById('moduleSelected');
const moduleText = document.getElementById('moduleSelectedText');
const moduleList = document.getElementById('moduleList');
let currentModule = 'image-optimizer';

// PDF Tool UI Elements
let uploadedPdfFiles = [];
const pdfDropzone = document.getElementById('pdfDropzone');
const pdfGallery = document.getElementById('pdfGallery');
const pdfList = document.getElementById('pdfList');
const browsePdfBtn = document.getElementById('browsePdfBtn');
const addMorePdfBtn = document.getElementById('addMorePdfBtn');
const clearPdfBtn = document.getElementById('clearPdfBtn');
const pageRangeInput = document.getElementById('pageRange');
const splitRangeContainer = document.getElementById('splitRangeContainer');
const pdfGalleryTitle = document.getElementById('pdfGalleryTitle');
const pdfGalleryDesc = document.getElementById('pdfGalleryDesc');

// Modal Elements
const modal = document.getElementById('compareModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const dragArea = document.getElementById('dragArea'); 
const compOverlay = document.getElementById('compOverlay');
const compImgOrig = document.getElementById('compImgOrig');
const compImgComp = document.getElementById('compImgComp');
const compHandle = document.getElementById('compHandle');
const modalStats = document.getElementById('modalStats');

// Global App State
let uploadedFilesManager = new Map(); 

// --- Custom Dropdown Logic ---
dropdownSelected.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
});
dropdownList.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', (e) => {
        dropdownList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        e.target.classList.add('active');
        formatSelectValue = e.target.getAttribute('data-value');
        dropdownText.textContent = e.target.textContent;
        dropdown.classList.remove('open');
        handleParamsChange();
    });
});

if(moduleSelected) {
    moduleSelected.addEventListener('click', (e) => {
        e.stopPropagation();
        moduleDropdown.classList.toggle('open');
    });
    moduleList.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', (e) => {
            moduleList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            currentModule = e.target.getAttribute('data-value');
            moduleText.textContent = e.target.textContent;
            moduleDropdown.classList.remove('open');
            switchModule(currentModule);
        });
    });
}
document.addEventListener('click', () => { 
    dropdown.classList.remove('open'); 
    if(moduleDropdown) moduleDropdown.classList.remove('open'); 
});

function switchModule(module) {
    document.querySelectorAll('.tool-settings').forEach(el => { el.classList.add('hidden'); el.style.display = 'none'; });
    document.querySelectorAll('.tool-view').forEach(el => { el.classList.add('hidden'); el.style.display = 'none'; });
    
    // Hide default gallery views
    gallery.classList.add('hidden');
    dropzone.classList.remove('active');
    
    if (module === 'image-optimizer') {
        document.getElementById('settings-image-optimizer').style.display = 'block';
        document.getElementById('view-image-optimizer').style.display = 'block';
        if (uploadedFilesManager.size > 0) {
            gallery.classList.remove('hidden'); gallery.classList.add('active');
            dropzone.classList.remove('active'); dropzone.classList.add('hidden');
        } else {
            dropzone.classList.add('active'); dropzone.classList.remove('hidden');
        }
        if(exportBtnText) exportBtnText.textContent = "Export to Downloads";
        checkExportReady();
    } else {
        document.getElementById('view-pdf-tools').style.display = 'block';
        
        if (module === 'merge-pdf') {
            document.getElementById('pdfDropTitle').textContent = 'Upload PDFs to Merge';
            document.getElementById('pdfDropDesc').textContent = 'Select 2 or more PDF files to combine. (100% Offline)';
            if(pdfGalleryTitle) {
                pdfGalleryTitle.textContent = "Arrange PDFs";
                pdfGalleryDesc.textContent = "Hold & drag cards to reorder them.";
                splitRangeContainer.style.display = 'none';
            }
            if(exportBtnText) exportBtnText.textContent = "Merge & Download";
        } else if (module === 'split-pdf') {
            document.getElementById('pdfDropTitle').textContent = 'Upload PDF to Extract';
            document.getElementById('pdfDropDesc').textContent = 'Extract specific pages visually from a single PDF. (100% Offline)';
            if(pdfGalleryTitle) {
                pdfGalleryTitle.textContent = "Visual Page Extractor";
                pdfGalleryDesc.textContent = "Click on the pages you want to extract, or use the Quick Select below.";
                splitRangeContainer.style.display = 'block';
            }
            if(exportBtnText) exportBtnText.textContent = "Split & Download";
        } else if (module === 'pdf-to-img') {
            document.getElementById('pdfDropTitle').textContent = 'Convert PDF to Image';
            document.getElementById('pdfDropDesc').textContent = 'Every page will be turned into a high-res JPG. (100% Offline)';
            if(pdfGalleryTitle) {
                pdfGalleryTitle.textContent = "Loaded PDF(s)";
                pdfGalleryDesc.textContent = "Ready to be rendered into JPGs.";
                splitRangeContainer.style.display = 'none';
            }
            if(exportBtnText) exportBtnText.textContent = "Convert to JPG (.zip)";
        }
        // show appropriate pdf gallery/dropzone based on upload state
        if (uploadedPdfFiles.length > 0) {
            pdfGallery.classList.remove('hidden'); pdfGallery.classList.add('active');
            pdfDropzone.classList.remove('active'); pdfDropzone.classList.add('hidden');
        } else {
            pdfDropzone.classList.add('active'); pdfDropzone.classList.remove('hidden');
        }
        checkPdfExportReady();
    }
}

// --- Parameters & Debounce ---
qualitySlider.addEventListener('input', (e) => qualityValue.textContent = `${e.target.value}%`);
let timeoutId;
const handleParamsChange = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        if (uploadedFilesManager.size > 0) reprocessAllFiles();
    }, 400); 
};
qualitySlider.addEventListener('change', handleParamsChange);
pageRangeInput.addEventListener('input', () => {
    if(currentModule !== 'split-pdf') return;
    
    // reset visual
    splitPdfPages.forEach(p => toggleSplitPage(p.pageNum, false));
    
    const rawArgs = pageRangeInput.value.trim();
    if(!rawArgs) return;
    
    const parts = rawArgs.split(',');
    for (let p of parts) {
        if(p.includes('-')) {
            let [start, end] = p.split('-').map(n => parseInt(n.trim()));
            if(start && end && start <= end) {
                for(let i=start; i<=end; i++) toggleSplitPage(i, true);
            }
        } else {
            let num = parseInt(p.trim());
            if(num) toggleSplitPage(num, true);
        }
    }
});
// --- Bulk Actions ---
bulkRotateBtn.addEventListener('click', () => {
    uploadedFilesManager.forEach((data, id) => {
        data.rotation = (data.rotation + 90) % 360;
    });
    reprocessAllFiles();
});

// --- Drag N Drop ---
// Prevent default behavior to allow drop on the whole page
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eName => {
    document.body.addEventListener(eName, e => { 
        e.preventDefault(); 
        e.stopPropagation(); 
    }, false);
});

// UI highlighting
['dragenter', 'dragover'].forEach(eName => {
    document.body.addEventListener(eName, () => dropzone.classList.add('dragover'));
});
['dragleave', 'drop'].forEach(eName => {
    document.body.addEventListener(eName, () => dropzone.classList.remove('dragover'));
});

document.body.addEventListener('drop', e => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if(currentModule === 'image-optimizer') handleFiles(e.dataTransfer.files);
        else handlePdfFiles(e.dataTransfer.files);
    }
});

clearAllBtn.addEventListener('click', () => {
    uploadedFilesManager.clear();
    cardsList.innerHTML = '';
    gallery.classList.remove('active'); gallery.classList.add('hidden');
    dropzone.classList.remove('hidden'); dropzone.classList.add('active');
    checkExportReady();
});

addMoreBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true;
    input.accept = 'image/jpeg, image/png, image/webp';
    input.onchange = e => handleFiles(e.target.files);
    input.click();
});

const browseFilesBtn = document.getElementById('browseFilesBtn');
if(browseFilesBtn) {
    browseFilesBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file'; input.multiple = true;
        input.accept = 'image/jpeg, image/png, image/webp';
        input.onchange = e => handleFiles(e.target.files);
        input.click();
    });
}
exportBtn.addEventListener('click', handleExport);

function handleFiles(files) {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if(arr.length > 0) {
        showGallery();
        arr.forEach(file => {
            const cardId = 'card_' + Math.random().toString(36).substr(2, 9);
            createPlaceholderCard(cardId, file.name);
            // Default rotation is 0
            uploadedFilesManager.set(cardId, { file: file, rotation: 0 });
            processFile(cardId);
        });
    }
}

async function processFile(cardId) {
    const dataObj = uploadedFilesManager.get(cardId);
    if (!dataObj) return;

    const formData = new FormData();
    formData.append('image', dataObj.file);
    formData.append('format', formatSelectValue);
    formData.append('quality', qualitySlider.value);
    formData.append('rotation', dataObj.rotation || 0);

    try {
        const resp = await fetch('/api/preview', { method: 'POST', body: formData });
        const data = await resp.json();
        if(data.error) throw new Error(data.error);

        // Merge raw processed data back to manager map
        uploadedFilesManager.set(cardId, { ...dataObj, ...data });
        updateCardUI(cardId, dataObj.file.name);
        checkExportReady();
    } catch (err) {
        showToast('Processing Error: ' + err.message);
        document.getElementById(cardId)?.remove();
        uploadedFilesManager.delete(cardId);
    }
}

async function reprocessAllFiles() {
    uploadedFilesManager.forEach((v, id) => {
        const card = document.getElementById(id);
        if(card) {
            // Add a visual loading state to existing cards
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
        }
    });

    const entries = Array.from(uploadedFilesManager.entries());
    await Promise.all(entries.map(async ([id, data]) => {
        await processFile(id);
        const card = document.getElementById(id);
        if(card) {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        }
    }));
}

function formatBytes(b) {
    if (!+b) return '0 B';
    const k = 1024, i = Math.floor(Math.log(b) / Math.log(k)), s = ['B','KB','MB','GB'];
    return `${parseFloat((b/Math.pow(k,i)).toFixed(1))} ${s[i]}`;
}

function createPlaceholderCard(id, title) {
    const html = `
        <div class="image-card" id="${id}">
            <div class="viewer-wrapper">
                <div style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--accent);">
                    <div class="loader"></div>
                </div>
            </div>
            <div class="card-stats">
                <div class="stat-box"><span>Processing</span><strong style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;">${title}</strong></div>
            </div>
        </div>`;
    cardsList.insertAdjacentHTML('afterbegin', html);
}

function updateCardUI(cardId, title) {
    const card = document.getElementById(cardId);
    const data = uploadedFilesManager.get(cardId);
    if (!card || !data) return;

    const savingsFactor = ((data.originalSize - data.compressedSize) / data.originalSize * 100).toFixed(1);
    const savingsText = savingsFactor > 0 ? `-${savingsFactor}%` : `+${Math.abs(savingsFactor)}%`;

    const html = `
        <div class="card-actions">
            <!-- Intercept card click cleanly -->
            <button class="card-action-btn" title="Rotate Image" onclick="triggerCardRotate('${cardId}', event)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
            </button>
            <button class="card-action-btn del-btn" title="Delete Image" onclick="triggerCardDelete('${cardId}', event)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
        <div class="viewer-wrapper" onclick="openAnalyzer('${cardId}')">
            <div class="viewer-inner">
                <img src="${data.originalBase64}" alt="Original" class="img-before">
                <img src="${data.previewBase64}" alt="Compressed" class="img-after">
                <div class="hover-line"></div>
            </div>
        </div>
        <div class="card-stats">
            <div class="stat-box"><span>Original</span><strong>${formatBytes(data.originalSize)}</strong></div>
            <div class="savings-badge">${savingsText}</div>
            <div class="stat-box" style="text-align: right;"><span>${data.finalFormat.toUpperCase()}</span><strong>${formatBytes(data.compressedSize)}</strong></div>
        </div>
    `;
    card.innerHTML = html;
}

// Global hooks for onclick string bindings
window.triggerCardRotate = function(id, e) {
    e.stopPropagation();
    const data = uploadedFilesManager.get(id);
    if(data) {
        data.rotation = (data.rotation + 90) % 360;
        const card = document.getElementById(id);
        if(card) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
        }
        processFile(id).then(() => {
            if(card) {
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
            }
        });
    }
};

window.triggerCardDelete = function(id, e) {
    e.stopPropagation();
    uploadedFilesManager.delete(id);
    const card = document.getElementById(id);
    if(card) card.remove();
    
    if(uploadedFilesManager.size === 0) {
        gallery.classList.remove('active'); gallery.classList.add('hidden');
        dropzone.classList.remove('hidden'); dropzone.classList.add('active');
    }
    checkExportReady();
};

function showGallery() {
    dropzone.classList.remove('active'); dropzone.classList.add('hidden');
    gallery.classList.remove('hidden'); gallery.classList.add('active');
}

function checkExportReady() {
    exportBtn.disabled = !(uploadedFilesManager.size > 0);
}

async function dynamicSave(blob, defaultName, acceptExt, mimeType) {
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultName,
                types: [{
                    description: `${acceptExt.toUpperCase()} File`,
                    accept: { [mimeType]: [`.${acceptExt}`] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return true;
        } catch (e) {
            if(e.name !== 'AbortError') console.error(e);
            return false;
        }
    } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return true;
    }
}

async function handleExport() {
    if (currentModule !== 'image-optimizer') return;
    
    exportBtn.disabled = true;
    exportBtn.innerHTML = '<div class="loader"></div>';

    try {
        const filesToExport = Array.from(uploadedFilesManager.values());
        
        if (filesToExport.length === 1) {
            const fileData = filesToExport[0];
            const fileExt = fileData.finalFormat;
            const mime = fileExt === 'pdf' ? 'application/pdf' : (fileExt === 'jpg' ? 'image/jpeg' : `image/${fileExt}`);
            const defaultName = `${fileData.file.name.replace(/\.[^/.]+$/, "")}_optimized.${fileExt}`;
            
            const raw = atob(fileData.rawCompressedBase64);
            const u8array = new Uint8Array(raw.length);
            for(let i=0; i<raw.length; i++) u8array[i] = raw.charCodeAt(i);
            const blob = new Blob([u8array], {type: mime});
            
            const saved = await dynamicSave(blob, defaultName, fileExt, mime);
            if(saved) showToast(`Success! Image saved.`);
        } else {
            const zip = new JSZip();
            for (const [index, data] of filesToExport.entries()) {
                const origName = data.file.name;
                const baseName = origName.substring(0, origName.lastIndexOf('.')) || origName;
                const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
                zip.file(`${safeName}_${index+1}.${data.finalFormat}`, data.rawCompressedBase64, {base64: true});
            }

            const blob = await zip.generateAsync({type:"blob"});
            const saved = await dynamicSave(blob, 'Optimized_Assets.zip', 'zip', 'application/zip');
            if(saved) showToast(`Success! Assets zipped and saved.`);
        }

        setTimeout(() => {
            exportBtn.innerHTML = '<span>Export to Downloads</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>';
            checkExportReady();
        }, 1500);
    } catch (e) {
        showToast('Export failed: ' + e.message);
        exportBtn.innerHTML = '<span>Export to Downloads</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>';
        checkExportReady();
    }
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 400);
    }, 4500);
}

// ==========================================
// MODAL & CUSTOM DRAG SLIDER ENGINE
// ==========================================
let isDragging = false;

function openAnalyzer(cardId) {
    const data = uploadedFilesManager.get(cardId);
    if(!data) return;

    compImgOrig.src = data.originalBase64;
    compImgComp.src = data.previewBase64;
    
    fixSliderWidth();

    modalStats.innerHTML = `Original: <span style="color:#fff">${formatBytes(data.originalSize)}</span> &nbsp; | &nbsp; Compressed: <span style="color:var(--success)">${formatBytes(data.compressedSize)}</span>`;
    
    updateSliderPosition(50);
    modal.classList.remove('hidden');
}

closeModalBtn.onclick = () => {
    modal.classList.add('hidden');
    isDragging = false;
};

function getDragPercentage(e) {
    const rect = dragArea.getBoundingClientRect();
    let clientX = e.clientX;
    if(e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
    }
    let x = clientX - rect.left;
    let percent = (x / rect.width) * 100;
    if(percent < 0) percent = 0;
    if(percent > 100) percent = 100;
    return percent;
}

dragArea.addEventListener('mousedown', (e) => { isDragging = true; updateSliderPosition(getDragPercentage(e)); });
window.addEventListener('mousemove', (e) => { if(!isDragging) return; updateSliderPosition(getDragPercentage(e)); });
window.addEventListener('mouseup', () => { isDragging = false; });

dragArea.addEventListener('touchstart', (e) => { isDragging = true; updateSliderPosition(getDragPercentage(e)); });
window.addEventListener('touchmove', (e) => { if(!isDragging) return; updateSliderPosition(getDragPercentage(e)); });
window.addEventListener('touchend', () => { isDragging = false; });

function updateSliderPosition(percent) {
    compOverlay.style.width = `${percent}%`;
    compHandle.style.left = `${percent}%`;
}

// ==========================================
// VERCEL COMPATIBLE PDF TOOLS (100% OFFLINE)
// ==========================================

function handlePdfFiles(files) {
    const arr = Array.from(files).filter(f => f.type === 'application/pdf');
    if(arr.length === 0) {
        showToast("Only PDF files are supported here.");
        return;
    }
    
    if (currentModule === 'split-pdf') {
        if(arr.length > 1) showToast("Opening the first document for Visual Split.");
        splitPdfBlob = arr[0];
        loadVisualSplit(splitPdfBlob);
    } else {
        arr.forEach(file => uploadedPdfFiles.push(file));
        renderPdfList();
    }
    
    pdfDropzone.classList.remove('active'); pdfDropzone.classList.add('hidden');
    pdfGallery.classList.remove('hidden'); pdfGallery.classList.add('active');
    checkPdfExportReady();
}

let splitPdfBlob = null; 
let splitPdfPages = [];

async function loadVisualSplit(file) {
    pdfList.innerHTML = '<div style="grid-column: 1 / -1; display: flex; justify-content:center; align-items:center; padding: 40px;"><div class="loader"></div><span style="font-weight:700; margin-left:12px; color:var(--text-primary)">Rendering Pages...</span></div>';
    exportBtn.disabled = true;
    splitPdfPages = [];
    
    try {
        const bytes = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
        const SCALE = 0.5;
        let html = '';
        
        for(let pageNum=1; pageNum<=pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: SCALE });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width; canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            splitPdfPages.push({ pageNum, selected: false });
            
            html += `
                <div class="image-card" id="sp_${pageNum}" onclick="toggleSplitPage(${pageNum})" style="position:relative; display:flex; flex-direction:column; align-items:center; border:4px solid var(--border); padding:8px; cursor:pointer; background:#fff; border-radius:var(--radius-sm); transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
                    <div class="check-badge" id="badge_${pageNum}" style="position:absolute; top:8px; right:8px; background:var(--accent); color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(0.5); transition:0.2s; z-index:10;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                    <img src="${dataUrl}" style="width:100%; height:auto; object-fit:contain; pointer-events:none; border-radius:8px; border: 1px solid #eee;">
                    <div style="margin-top:12px; font-weight:800; color:var(--text-primary); pointer-events:none;">Page ${pageNum}</div>
                </div>
            `;
        }
        pdfList.innerHTML = html;
        checkPdfExportReady();
    } catch(err) {
        showToast("Failed to render visual PDF.");
        console.error(err);
    }
}

window.toggleSplitPage = function(pageNum, forceState = null) {
    const pageObj = splitPdfPages.find(p => p.pageNum === pageNum);
    if(!pageObj) return;
    
    if(forceState !== null) pageObj.selected = forceState;
    else pageObj.selected = !pageObj.selected;
    
    const card = document.getElementById(`sp_${pageNum}`);
    const badge = document.getElementById(`badge_${pageNum}`);
    if(pageObj.selected) {
        card.style.borderColor = 'var(--accent)';
        card.style.boxShadow = '6px 6px 0 var(--accent-light)';
        card.style.background = 'var(--bg-secondary)';
        card.style.transform = 'translate(-2px, -2px)';
        badge.style.opacity = '1';
        badge.style.transform = 'scale(1)';
    } else {
        card.style.borderColor = 'var(--border)';
        card.style.boxShadow = 'none';
        card.style.background = '#fff';
        card.style.transform = 'none';
        badge.style.opacity = '0';
        badge.style.transform = 'scale(0.5)';
    }
    checkPdfExportReady();
};

if(browsePdfBtn) browsePdfBtn.onclick = triggerPdfUpload;
if(addMorePdfBtn) addMorePdfBtn.onclick = triggerPdfUpload;
function triggerPdfUpload() {
    const input = document.createElement('input');
    input.type = 'file'; 
    if(currentModule !== 'split-pdf') input.multiple = true;
    input.accept = 'application/pdf';
    input.onchange = e => handlePdfFiles(e.target.files);
    input.click();
}

if(clearPdfBtn) clearPdfBtn.onclick = () => {
    uploadedPdfFiles = [];
    splitPdfBlob = null;
    splitPdfPages = [];
    pdfGallery.classList.remove('active'); pdfGallery.classList.add('hidden');
    pdfDropzone.classList.remove('hidden'); pdfDropzone.classList.add('active');
    checkPdfExportReady();
};

// --- DRAG AND DROP REORDERING ---
let draggedIdx = null;
window.handlePdfDragStart = function(idx, e) {
    draggedIdx = idx;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = '0.4';
};
window.handlePdfDragOver = function(e) {
    e.preventDefault(); 
};
window.handlePdfDrop = function(targetIdx, e) {
    e.preventDefault();
    if(draggedIdx !== null && draggedIdx !== targetIdx) {
        const item = uploadedPdfFiles.splice(draggedIdx, 1)[0];
        uploadedPdfFiles.splice(targetIdx, 0, item);
        renderPdfList();
    }
};
window.handlePdfDragEnd = function(e) {
    e.currentTarget.style.opacity = '1';
    draggedIdx = null;
};

    function renderPdfList() {
    pdfList.innerHTML = '';
    uploadedPdfFiles.forEach((file, idx) => {
        const titleText = currentModule === 'merge-pdf' ? 'Hold & drag to reorder' : '';
        const html = `
            <div class="image-card" title="${titleText}" draggable="true" ondragstart="handlePdfDragStart(${idx}, event)" ondragover="handlePdfDragOver(event)" ondrop="handlePdfDrop(${idx}, event)" ondragend="handlePdfDragEnd(event)" style="display:flex; justify-content:space-between; align-items:center; border:3px solid var(--accent); padding:16px; background: #fff; border-radius: var(--radius-sm); box-shadow: 4px 4px 0 var(--accent-light); cursor: grab;">
                <div style="display:flex; align-items:center; gap:12px; pointer-events:none;">
                    <div style="background:var(--accent); color:#fff; font-weight:800; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:14px; border:2px solid var(--text-primary); flex-shrink:0;">${idx + 1}</div>
                    <div style="font-weight:800; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:160px; font-size:15px;">📄 ${file.name}</div>
                </div>
                <div style="font-size:13px; font-weight:700; color:var(--text-secondary); background: var(--bg-base); padding: 4px 8px; border-radius: 8px; pointer-events:none;">${formatBytes(file.size)}</div>
                <button class="card-action-btn del-btn" style="position:relative; right:0; top:0; transform:none;" onclick="removePdf(${idx})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
        pdfList.insertAdjacentHTML('beforeend', html);
    });
}

window.removePdf = function(idx) {
    uploadedPdfFiles.splice(idx, 1);
    renderPdfList();
    if(uploadedPdfFiles.length === 0) {
        pdfGallery.classList.remove('active'); pdfGallery.classList.add('hidden');
        pdfDropzone.classList.remove('hidden'); pdfDropzone.classList.add('active');
    }
    checkPdfExportReady();
}

window.checkPdfExportReady = function() {
    if(currentModule !== 'image-optimizer') {
        if(currentModule === 'merge-pdf') {
            exportBtn.disabled = !(uploadedPdfFiles.length >= 2);
        } else if(currentModule === 'split-pdf') {
            const hasSelection = splitPdfPages.some(p => p.selected);
            exportBtn.disabled = !hasSelection;
        } else {
            exportBtn.disabled = !(uploadedPdfFiles.length >= 1);
        }
    }
}

exportBtn.addEventListener('click', async (e) => {
    if(currentModule === 'image-optimizer') return; 
    e.stopImmediatePropagation();
    
    exportBtn.disabled = true;
    exportBtn.innerHTML = '<div class="loader"></div>';
    
    try {
        if(currentModule === 'merge-pdf') await processMergePdf();
        else if(currentModule === 'split-pdf') await processSplitPdf();
        else if(currentModule === 'pdf-to-img') await processPdfToImg();
    } catch(err) {
        showToast('PDF Processing Error: ' + err.message);
        console.error(err);
    }
    
    exportBtn.innerHTML = `<span id="exportBtnText">${currentModule === 'merge-pdf' ? 'Merge & Download' : currentModule === 'split-pdf' ? 'Split & Download' : 'Convert to JPG (.zip)'}</span>`;
    checkPdfExportReady();
});

async function processMergePdf() {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();
    
    for (const file of uploadedPdfFiles) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    
    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], {type: "application/pdf"});
    const saved = await dynamicSave(blob, `Merged_Document.pdf`, 'pdf', 'application/pdf');
    if(saved) showToast("PDFs successfully merged and saved!");
}

async function processSplitPdf() {
    const { PDFDocument } = PDFLib;
    
    const selectedPages = splitPdfPages.filter(p => p.selected).map(p => p.pageNum - 1);
    if(selectedPages.length === 0) throw new Error("No pages selected!");
    
    const fileBuffer = await splitPdfBlob.arrayBuffer();
    const srcPdf = await PDFDocument.load(fileBuffer);
    
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcPdf, selectedPages);
    copiedPages.forEach(p => newDoc.addPage(p));
    
    const bytes = await newDoc.save();
    const blob = new Blob([bytes], {type: "application/pdf"});
    
    const defaultName = `${splitPdfBlob.name.replace(/\.[^/.]+$/, "")}_extracted.pdf`;
    const saved = await dynamicSave(blob, defaultName, 'pdf', 'application/pdf');
    if(saved) showToast("PDF pages successfully extracted!");
}

async function processPdfToImg() {
    const zip = new JSZip();
    const SCALE = 2.0;

    for (let fIdx=0; fIdx<uploadedPdfFiles.length; fIdx++) {
        const file = uploadedPdfFiles[fIdx];
        const bytes = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
        
        for(let pageNum=1; pageNum<=pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: SCALE });
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width; canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            zip.file(`${file.name.replace(/\.[^/.]+$/, "")}_p${pageNum}.jpg`, blob);
        }
    }
    
    const outBlob = await zip.generateAsync({type:"blob"});
    const saved = await dynamicSave(outBlob, `PDF_To_Image.zip`, 'zip', 'application/zip');
    if(saved) showToast("PDF successfully converted and zipped!");
}

function fixSliderWidth() {
    const containerWidth = document.getElementById('compContainer').offsetWidth;
    compImgComp.style.width = containerWidth + 'px';
}

window.addEventListener('resize', () => {
    if(!modal.classList.contains('hidden')) fixSliderWidth();
});
