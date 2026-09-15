// AMAAN CSC CENTER - Pipili, Puri, Odisha
// Advanced Indian Passport Photo Maker & Studio Engine

document.addEventListener('DOMContentLoaded', () => {
 // ==========================================
 // DOM ELEMENTS
 // ==========================================
 const dropZone = document.getElementById('dropZone');
 const fileInput = document.getElementById('fileInput');
 const cropperWrapper = document.getElementById('cropperWrapper');
 const imageEditor = document.getElementById('imageEditor');
 const noImagePrompt = document.getElementById('noImagePrompt');
 const btnReplace = document.getElementById('btnReplace');
 const btnRemove = document.getElementById('btnRemove');
 const btnResetAll = document.getElementById('btnResetAll');
 
 // Crop & Guides
 const guideOverlay = document.getElementById('guideOverlay');
 const toggleFaceGuides = document.getElementById('toggleFaceGuides');
 const btnAutoCenter = document.getElementById('btnAutoCenter');
 const btnRotateLeft = document.getElementById('btnRotateLeft');
 const btnRotateRight = document.getElementById('btnRotateRight');
 const btnZoomIn = document.getElementById('btnZoomIn');
 const btnZoomOut = document.getElementById('btnZoomOut');
 const btnCropApply = document.getElementById('btnCropApply');

 // Background Removal
 const btnAutoRemoveBg = document.getElementById('btnAutoRemoveBg');
 const chkKeepOriginalBg = document.getElementById('chkKeepOriginalBg');
 const btnToggleManualBrush = document.getElementById('btnToggleManualBrush');
 const manualBrushControls = document.getElementById('manualBrushControls');
 const manualTouchUpCanvas = document.getElementById('manualTouchUpCanvas');
 const brushSizeInput = document.getElementById('brushSize');
 const brushSizeDisplay = document.getElementById('brushSizeDisplay');
 const btnDoneManual = document.getElementById('btnDoneManual');

 // Face Clean & Studio Lighting Elements
 const chkEnableFaceClean = document.getElementById('chkEnableFaceClean');
 const faceCleanPresets = document.querySelectorAll('.face-clean-preset');
 const sliderShadowFill = document.getElementById('sliderShadowFill');
 const sliderShadowFillVal = document.getElementById('sliderShadowFillVal');
 const sliderSharpness = document.getElementById('sliderSharpness');
 const sliderSharpnessVal = document.getElementById('sliderSharpnessVal');
 const sliderToneBalance = document.getElementById('sliderToneBalance');
 const sliderToneBalanceVal = document.getElementById('sliderToneBalanceVal');
 const sliderExposure = document.getElementById('sliderExposure');
 const sliderExposureVal = document.getElementById('sliderExposureVal');

 // Color & Size Settings
 const bgPresetBtns = document.querySelectorAll('.bg-preset-btn');
 const currentBgLabel = document.getElementById('currentBgLabel');
 const customColorPicker = document.getElementById('customColorPicker');
 const customColorHex = document.getElementById('customColorHex');
 const sizePreset = document.getElementById('sizePreset');
 const customSizeBox = document.getElementById('customSizeBox');
 const customWidthVal = document.getElementById('customWidthVal');
 const customHeightVal = document.getElementById('customHeightVal');
 const customUnitVal = document.getElementById('customUnitVal');
 const dpiSelect = document.getElementById('dpiSelect');

 // Layout Settings
 const paperSize = document.getElementById('paperSize');
 const paperOrientation = document.getElementById('paperOrientation');
 const copiesSelect = document.getElementById('copiesSelect');
 const sheetSpacing = document.getElementById('sheetSpacing');
 const sheetMargin = document.getElementById('sheetMargin');
 const chkCutLines = document.getElementById('chkCutLines');
 const chkBorder = document.getElementById('chkBorder');
 const btnApply8Photos = document.getElementById('btnApply8Photos');

 // Single Photo Preview
 const singlePhotoCanvas = document.getElementById('singlePhotoCanvas');
 const statPixels = document.getElementById('statPixels');
 const statPhysical = document.getElementById('statPhysical');
 const statDpi = document.getElementById('statDpi');
 const statFileSize = document.getElementById('statFileSize');
 const singlePhotoSpecsBadge = document.getElementById('singlePhotoSpecsBadge');
 const btnDownloadSingleJpg = document.getElementById('btnDownloadSingleJpg');
 const btnDownloadSinglePng = document.getElementById('btnDownloadSinglePng');

 // Preview Modal & Export
 const btnGeneratePreview = document.getElementById('btnGeneratePreview');
 const previewModal = document.getElementById('previewModal');
 const btnClosePreview = document.getElementById('btnClosePreview');
 const printCanvasContainer = document.getElementById('printCanvasContainer');
 const previewStatsBar = document.getElementById('previewStatsBar');
 const btnDownloadSheetJpg = document.getElementById('btnDownloadSheetJpg');
 const btnDownloadSheetPng = document.getElementById('btnDownloadSheetPng');
 const btnDownloadPdfSheet = document.getElementById('btnDownloadPdfSheet');
 const btnDirectPrintSheet = document.getElementById('btnDirectPrintSheet');
 const btnAddToBillFromPreview = document.getElementById('btnAddToBillFromPreview');
 const btnPrintAtCscDirect = document.getElementById('btnPrintAtCscDirect');

 // CSC Order Billing Modal
 const cscOrderBillModal = document.getElementById('cscOrderBillModal');
 const btnCloseCscOrderModal = document.getElementById('btnCloseCscOrderModal');
 const btnCancelCscOrder = document.getElementById('btnCancelCscOrder');
 const btnConfirmAddToBill = document.getElementById('btnConfirmAddToBill');
 const billOrderPhotoSize = document.getElementById('billOrderPhotoSize');
 const billOrderBgColor = document.getElementById('billOrderBgColor');
 const billOrderPaperSize = document.getElementById('billOrderPaperSize');
 const billOrderCopies = document.getElementById('billOrderCopies');
 const billOrderAmount = document.getElementById('billOrderAmount');

 // History & Validation
 const historyList = document.getElementById('historyList');
 const btnClearHistory = document.getElementById('btnClearHistory');

 // ==========================================
 // STATE VARIABLES
 // ==========================================
 let cropper = null;
 let originalImageSrc = null;
 let croppedPortraitCanvas = null; // Raw crop canvas
 let segmentedPersonCanvas = null; // Canvas with background removed
 let isBgRemoved = true; // Enabled by default for passport workflow
 let selectedBgColor = '#FFFFFF'; // Pure white by default
 
 // Physical Photo Dimensions in mm
 let photoWidthMM = 35;
 let photoHeightMM = 45;
 let photoDPI = 300;

 // Face Clean & Studio Settings
 let isFaceCleanActive = true;
 let shadowFillAmount = 65; // 0 to 100
 let sharpnessAmount = 45; // 0 to 100
 let toneBalanceAmount = 0; // -50 to 50
 let exposureAmount = 5; // -30 to 30

 // Manual Brush State
 let isManualBrushActive = false;
 let isDrawing = false;
 let brushRadius = 18;
 let manualCtx = null;

 // MediaPipe SelfieSegmentation Instance
 let selfieSegmentation = null;
 let isMediaPipeReady = false;

 initMediaPipe();

 function initMediaPipe() {
 if (typeof SelfieSegmentation !== 'undefined') {
 try {
 selfieSegmentation = new SelfieSegmentation({
 locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
 });
 selfieSegmentation.setOptions({
 modelSelection: 1 // 1 for landscape/high quality portrait model
 });
 selfieSegmentation.onResults(onMediaPipeResults);
 isMediaPipeReady = true;
 console.log('MediaPipe SelfieSegmentation initialized successfully.');
 } catch (err) {
 console.warn('MediaPipe initialization fallback:', err);
 isMediaPipeReady = false;
 }
 }
 }

 // ==========================================
 // STEP 1: ROBUST UPLOAD HANDLING
 // ==========================================
 dropZone.addEventListener('click', () => fileInput.click());

 dropZone.addEventListener('dragover', (e) => {
 e.preventDefault();
 dropZone.classList.add('dragover');
 });

 dropZone.addEventListener('dragleave', () => {
 dropZone.classList.remove('dragover');
 });

 dropZone.addEventListener('drop', (e) => {
 e.preventDefault();
 dropZone.classList.remove('dragover');
 if (e.dataTransfer.files && e.dataTransfer.files.length) {
 handleImageFile(e.dataTransfer.files[0]);
 }
 });

 fileInput.addEventListener('change', (e) => {
 if (e.target.files && e.target.files.length) {
 handleImageFile(e.target.files[0]);
 }
 });

 function handleImageFile(file) {
 if (!file.type.match('image.*')) {
 alert('Please select a valid image file (JPG, JPEG, PNG, WEBP).');
 return;
 }

 const reader = new FileReader();
 reader.onload = (e) => {
 originalImageSrc = e.target.result;
 initCropperWithImage(originalImageSrc);
 updateValidationChecklist();
 savePresetToHistory('Loaded New Photo');
 };
 reader.readAsDataURL(file);
 }

 btnReplace.addEventListener('click', () => fileInput.click());
 btnRemove.addEventListener('click', resetEditorState);
 btnResetAll.addEventListener('click', resetEditorState);

 function resetEditorState() {
 if (cropper) {
 cropper.destroy();
 cropper = null;
 }
 imageEditor.src = '';
 originalImageSrc = null;
 croppedPortraitCanvas = null;
 segmentedPersonCanvas = null;
 isBgRemoved = true;
 
 dropZone.classList.remove('hidden');
 btnReplace.classList.add('hidden');
 btnRemove.classList.add('hidden');
 noImagePrompt.classList.remove('hidden');
 cropperWrapper.classList.add('hidden');
 guideOverlay.classList.add('hidden');
 fileInput.value = '';

 // Clear preview canvases
 const sCtx = singlePhotoCanvas.getContext('2d');
 sCtx.clearRect(0, 0, singlePhotoCanvas.width, singlePhotoCanvas.height);
 statPixels.innerText = ' - -';
 statPhysical.innerText = ' - -';
 statFileSize.innerText = ' - -';

 updateValidationChecklist();
 }

 // ==========================================
 // STEP 2 & 8: CROPPER & AUTO-CENTER
 // ==========================================
 function initCropperWithImage(src) {
 dropZone.classList.add('hidden');
 btnReplace.classList.remove('hidden');
 btnRemove.classList.remove('hidden');
 noImagePrompt.classList.add('hidden');
 cropperWrapper.classList.remove('hidden');

 if (toggleFaceGuides.checked) {
 guideOverlay.classList.remove('hidden');
 }

 // Wait for image to load completely before initializing Cropper to prevent 0x0 errors
 imageEditor.onload = () => {
 if (cropper) {
 cropper.destroy();
 cropper = null;
 }

 cropper = new Cropper(imageEditor, {
 aspectRatio: photoWidthMM / photoHeightMM,
 viewMode: 1,
 dragMode: 'move',
 autoCropArea: 0.85,
 restore: false,
 guides: true,
 center: true,
 highlight: false,
 cropBoxMovable: true,
 cropBoxResizable: true,
 toggleDragModeOnDblclick: false,
 ready: function() {
 autoCenterCropBox();
 executeCropAndProcess();
 },
 cropend: function() {
 executeCropAndProcess();
 }
 });
 };

 imageEditor.src = src;
 }

 toggleFaceGuides.addEventListener('change', (e) => {
 if (e.target.checked && originalImageSrc) {
 guideOverlay.classList.remove('hidden');
 } else {
 guideOverlay.classList.add('hidden');
 }
 });

 btnAutoCenter.addEventListener('click', () => {
 autoCenterCropBox();
 executeCropAndProcess();
 });

 function autoCenterCropBox() {
 if (!cropper) return;
 cropper.reset();
 const containerData = cropper.getContainerData();
 const cropBoxWidth = Math.min(containerData.width * 0.72, containerData.height * 0.72 * (photoWidthMM / photoHeightMM));
 const cropBoxHeight = cropBoxWidth / (photoWidthMM / photoHeightMM);
 
 cropper.setCropBoxData({
 left: (containerData.width - cropBoxWidth) / 2,
 top: (containerData.height - cropBoxHeight) / 2,
 width: cropBoxWidth,
 height: cropBoxHeight
 });
 }

 btnRotateLeft.addEventListener('click', () => {
 if (cropper) { cropper.rotate(-90); executeCropAndProcess(); }
 });
 btnRotateRight.addEventListener('click', () => {
 if (cropper) { cropper.rotate(90); executeCropAndProcess(); }
 });
 btnZoomIn.addEventListener('click', () => {
 if (cropper) { cropper.zoom(0.1); executeCropAndProcess(); }
 });
 btnZoomOut.addEventListener('click', () => {
 if (cropper) { cropper.zoom(-0.1); executeCropAndProcess(); }
 });

 btnCropApply.addEventListener('click', () => {
 if (!cropper) {
 alert('Please upload a photo first.');
 return;
 }
 executeCropAndProcess();
 showNotificationToast('Crop updated and processed!');
 });

 // Execute Crop followed by AI Background Removal & Studio Face Clean
 function executeCropAndProcess() {
 if (!cropper) return;
 
 const targetPxWidth = Math.round((photoWidthMM * photoDPI) / 25.4);
 const targetPxHeight = Math.round((photoHeightMM * photoDPI) / 25.4);

 croppedPortraitCanvas = cropper.getCroppedCanvas({
 width: targetPxWidth,
 height: targetPxHeight,
 imageSmoothingEnabled: true,
 imageSmoothingQuality: 'high'
 });

 if (!croppedPortraitCanvas) return;

 if (chkKeepOriginalBg.checked) {
 isBgRemoved = false;
 segmentedPersonCanvas = null;
 renderSinglePhotoOutput();
 updateValidationChecklist();
 } else {
 isBgRemoved = true;
 processPersonSegmentation(croppedPortraitCanvas);
 }
 }

 // ==========================================
 // STEP 3: BACKGROUND REMOVAL (AI + Color Fallback)
 // ==========================================
 btnAutoRemoveBg.addEventListener('click', () => {
 chkKeepOriginalBg.checked = false;
 isBgRemoved = true;
 if (croppedPortraitCanvas) {
 processPersonSegmentation(croppedPortraitCanvas);
 showNotificationToast('Background removal re-applied!');
 } else {
 executeCropAndProcess();
 }
 });

 chkKeepOriginalBg.addEventListener('change', (e) => {
 if (e.target.checked) {
 isBgRemoved = false;
 segmentedPersonCanvas = null;
 renderSinglePhotoOutput();
 updateValidationChecklist();
 } else {
 isBgRemoved = true;
 if (croppedPortraitCanvas) {
 processPersonSegmentation(croppedPortraitCanvas);
 }
 }
 });

 function processPersonSegmentation(sourceCanvas) {
 if (isMediaPipeReady && selfieSegmentation) {
 try {
 selfieSegmentation.send({ image: sourceCanvas });
 return;
 } catch (e) {
 console.warn('MediaPipe send error, falling back to algorithmic removal:', e);
 }
 }
 // Fallback intelligent color-distance segmentation
 runAlgorithmicBgRemoval(sourceCanvas);
 renderSinglePhotoOutput();
 updateValidationChecklist();
 }

 // MediaPipe Results Callback
 function onMediaPipeResults(results) {
 if (!croppedPortraitCanvas) return;
 const w = croppedPortraitCanvas.width;
 const h = croppedPortraitCanvas.height;

 const outputCanvas = document.createElement('canvas');
 outputCanvas.width = w;
 outputCanvas.height = h;
 const ctx = outputCanvas.getContext('2d');

 // Draw segmentation mask
 ctx.drawImage(results.segmentationMask, 0, 0, w, h);

 // Keep only person pixels
 ctx.globalCompositeOperation = 'source-in';
 ctx.drawImage(croppedPortraitCanvas, 0, 0, w, h);

 segmentedPersonCanvas = outputCanvas;
 renderSinglePhotoOutput();
 updateValidationChecklist();
 }

 // Algorithmic Background Removal Fallback
 function runAlgorithmicBgRemoval(sourceCanvas) {
 const w = sourceCanvas.width;
 const h = sourceCanvas.height;

 const outputCanvas = document.createElement('canvas');
 outputCanvas.width = w;
 outputCanvas.height = h;
 const ctx = outputCanvas.getContext('2d');
 ctx.drawImage(sourceCanvas, 0, 0);

 const imgData = ctx.getImageData(0, 0, w, h);
 const data = imgData.data;

 // Sample top corners and top 6% margin for background color
 let bgR = 0, bgG = 0, bgB = 0, sampleCount = 0;
 for (let y = 0; y < Math.floor(h * 0.08); y++) {
 for (let x = 0; x < w; x++) {
 if (x < w * 0.35 || x > w * 0.65 || y < h * 0.03) {
 const idx = (y * w + x) * 4;
 bgR += data[idx];
 bgG += data[idx + 1];
 bgB += data[idx + 2];
 sampleCount++;
 }
 }
 }

 if (sampleCount > 0) {
 bgR /= sampleCount;
 bgG /= sampleCount;
 bgB /= sampleCount;
 } else {
 bgR = 245; bgG = 245; bgB = 245;
 }

 const threshold = 40;
 const feather = 18;

 for (let i = 0; i < data.length; i += 4) {
 const r = data[i];
 const g = data[i + 1];
 const b = data[i + 2];

 const dist = Math.sqrt(
 (r - bgR) * (r - bgR) +
 (g - bgG) * (g - bgG) +
 (b - bgB) * (b - bgB)
 );

 if (dist < threshold) {
 data[i + 3] = 0;
 } else if (dist < threshold + feather) {
 const alphaFactor = (dist - threshold) / feather;
 data[i + 3] = Math.round(data[i + 3] * alphaFactor);
 }
 }

 ctx.putImageData(imgData, 0, 0);
 segmentedPersonCanvas = outputCanvas;
 }

 // Manual Brush Tool
 btnToggleManualBrush.addEventListener('click', () => {
 if (!croppedPortraitCanvas) {
 alert('Please upload and crop your photo first.');
 return;
 }
 isManualBrushActive = !isManualBrushActive;
 if (isManualBrushActive) {
 startManualBrushSession();
 } else {
 endManualBrushSession();
 }
 });

 btnDoneManual.addEventListener('click', endManualBrushSession);

 brushSizeInput.addEventListener('input', (e) => {
 brushRadius = parseInt(e.target.value);
 brushSizeDisplay.innerText = `${brushRadius}px`;
 });

 function startManualBrushSession() {
 manualBrushControls.classList.remove('hidden');
 manualTouchUpCanvas.classList.remove('hidden');
 
 const container = document.getElementById('editorContainer');
 manualTouchUpCanvas.width = container.clientWidth;
 manualTouchUpCanvas.height = container.clientHeight;
 manualCtx = manualTouchUpCanvas.getContext('2d');
 
 manualCtx.clearRect(0, 0, manualTouchUpCanvas.width, manualTouchUpCanvas.height);
 const source = segmentedPersonCanvas || croppedPortraitCanvas;
 manualCtx.drawImage(source, 0, 0, manualTouchUpCanvas.width, manualTouchUpCanvas.height);

 manualTouchUpCanvas.addEventListener('mousedown', onBrushMouseDown);
 manualTouchUpCanvas.addEventListener('mousemove', onBrushMouseMove);
 window.addEventListener('mouseup', onBrushMouseUp);
 
 showNotificationToast('Manual brush active: click and drag to erase BG or restore person.');
 }

 function endManualBrushSession() {
 manualBrushControls.classList.add('hidden');
 manualTouchUpCanvas.classList.add('hidden');
 manualTouchUpCanvas.removeEventListener('mousedown', onBrushMouseDown);
 manualTouchUpCanvas.removeEventListener('mousemove', onBrushMouseMove);
 window.removeEventListener('mouseup', onBrushMouseUp);
 isManualBrushActive = false;

 if (croppedPortraitCanvas) {
 const temp = document.createElement('canvas');
 temp.width = croppedPortraitCanvas.width;
 temp.height = croppedPortraitCanvas.height;
 const tCtx = temp.getContext('2d');
 tCtx.drawImage(manualTouchUpCanvas, 0, 0, temp.width, temp.height);
 segmentedPersonCanvas = temp;
 isBgRemoved = true;
 renderSinglePhotoOutput();
 }
 }

 function onBrushMouseDown(e) { isDrawing = true; applyBrush(e); }
 function onBrushMouseMove(e) { if (isDrawing) applyBrush(e); }
 function onBrushMouseUp() { isDrawing = false; }

 function applyBrush(e) {
 if (!manualCtx) return;
 const rect = manualTouchUpCanvas.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;
 const mode = document.querySelector('input[name="brushMode"]:checked')?.value || 'erase';
 
 manualCtx.save();
 if (mode === 'erase') {
 manualCtx.globalCompositeOperation = 'destination-out';
 manualCtx.beginPath();
 manualCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
 manualCtx.fill();
 } else {
 manualCtx.globalCompositeOperation = 'source-over';
 manualCtx.beginPath();
 manualCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
 manualCtx.clip();
 if (croppedPortraitCanvas) {
 manualCtx.drawImage(croppedPortraitCanvas, 0, 0, manualTouchUpCanvas.width, manualTouchUpCanvas.height);
 }
 }
 manualCtx.restore();
 }

 // ==========================================
 // FACE CLEAN & STUDIO LIGHTING ENGINE
 // ==========================================
 chkEnableFaceClean.addEventListener('change', (e) => {
 isFaceCleanActive = e.target.checked;
 renderSinglePhotoOutput();
 });

 faceCleanPresets.forEach(btn => {
 btn.addEventListener('click', (e) => {
 faceCleanPresets.forEach(b => {
 b.classList.remove('active', 'bg-blue-700', 'text-white');
 b.classList.add('bg-white', 'text-blue-900');
 });
 const clicked = e.currentTarget;
 clicked.classList.remove('bg-white', 'text-blue-900');
 clicked.classList.add('active', 'bg-blue-700', 'text-white');

 const preset = clicked.dataset.preset;
 if (preset === 'official') {
 chkEnableFaceClean.checked = true;
 isFaceCleanActive = true;
 shadowFillAmount = 65;
 sharpnessAmount = 45;
 toneBalanceAmount = 0;
 exposureAmount = 5;
 } else if (preset === 'shadowlift') {
 chkEnableFaceClean.checked = true;
 isFaceCleanActive = true;
 shadowFillAmount = 85;
 sharpnessAmount = 30;
 toneBalanceAmount = 5;
 exposureAmount = 10;
 } else if (preset === 'crisp') {
 chkEnableFaceClean.checked = true;
 isFaceCleanActive = true;
 shadowFillAmount = 50;
 sharpnessAmount = 70;
 toneBalanceAmount = 0;
 exposureAmount = 0;
 } else if (preset === 'raw') {
 chkEnableFaceClean.checked = false;
 isFaceCleanActive = false;
 }

 syncSliderUI();
 renderSinglePhotoOutput();
 });
 });

 function syncSliderUI() {
 sliderShadowFill.value = shadowFillAmount;
 sliderShadowFillVal.innerText = `${shadowFillAmount}%`;
 sliderSharpness.value = sharpnessAmount;
 sliderSharpnessVal.innerText = `${sharpnessAmount}%`;
 sliderToneBalance.value = toneBalanceAmount;
 sliderToneBalanceVal.innerText = `${toneBalanceAmount > 0 ? '+' : ''}${toneBalanceAmount}`;
 sliderExposure.value = exposureAmount;
 sliderExposureVal.innerText = `${exposureAmount > 0 ? '+' : ''}${exposureAmount}%`;
 }

 sliderShadowFill.addEventListener('input', (e) => {
 shadowFillAmount = parseInt(e.target.value);
 sliderShadowFillVal.innerText = `${shadowFillAmount}%`;
 chkEnableFaceClean.checked = true;
 isFaceCleanActive = true;
 renderSinglePhotoOutput();
 });

 sliderSharpness.addEventListener('input', (e) => {
 sharpnessAmount = parseInt(e.target.value);
 sliderSharpnessVal.innerText = `${sharpnessAmount}%`;
 chkEnableFaceClean.checked = true;
 isFaceCleanActive = true;
 renderSinglePhotoOutput();
 });

 sliderToneBalance.addEventListener('input', (e) => {
 toneBalanceAmount = parseInt(e.target.value);
 sliderToneBalanceVal.innerText = `${toneBalanceAmount > 0 ? '+' : ''}${toneBalanceAmount}`;
 chkEnableFaceClean.checked = true;
 isFaceCleanActive = true;
 renderSinglePhotoOutput();
 });

 sliderExposure.addEventListener('input', (e) => {
 exposureAmount = parseInt(e.target.value);
 sliderExposureVal.innerText = `${exposureAmount > 0 ? '+' : ''}${exposureAmount}%`;
 chkEnableFaceClean.checked = true;
 isFaceCleanActive = true;
 renderSinglePhotoOutput();
 });

 // High Precision Pixel Studio Clean Algorithm
 function applyStudioFaceCleanFilter(sourceCanvas) {
 if (!isFaceCleanActive) return sourceCanvas;

 const w = sourceCanvas.width;
 const h = sourceCanvas.height;
 const tempCanvas = document.createElement('canvas');
 tempCanvas.width = w;
 tempCanvas.height = h;
 const ctx = tempCanvas.getContext('2d');
 ctx.drawImage(sourceCanvas, 0, 0);

 const imgData = ctx.getImageData(0, 0, w, h);
 const data = imgData.data;

 // Factors normalized
 const shadowFactor = shadowFillAmount / 100; // 0 to 1
 const exposureMultiplier = 1 + (exposureAmount / 100);
 const toneR = 1 + (toneBalanceAmount / 150);
 const toneB = 1 - (toneBalanceAmount / 150);

 // 1. Soft Front Studio Light & Harsh Shadow Reduction + Tone Normalization
 for (let i = 0; i < data.length; i += 4) {
 // Ignore fully transparent background pixels
 if (data[i + 3] === 0) continue;

 let r = data[i];
 let g = data[i + 1];
 let b = data[i + 2];

 // Luminance
 const lum = 0.299 * r + 0.587 * g + 0.114 * b;

 // Harsh Shadow Fill: Target dark and mid-shadow regions (lum < 130)
 if (lum < 130 && shadowFactor > 0) {
 const shadowWeight = (130 - lum) / 130;
 const lift = shadowWeight * shadowFactor * 42;
 r += lift;
 g += lift;
 b += lift;
 }

 // Studio Exposure & Daylight Tone Balance
 r = r * exposureMultiplier * toneR;
 g = g * exposureMultiplier;
 b = b * exposureMultiplier * toneB;

 // Clamp
 data[i] = Math.min(255, Math.max(0, r));
 data[i + 1] = Math.min(255, Math.max(0, g));
 data[i + 2] = Math.min(255, Math.max(0, b));
 }

 ctx.putImageData(imgData, 0, 0);

 // 2. Crisp Sharpness (Unsharp Masking for Sharp Open Eyes, Hair & Edges)
 if (sharpnessAmount > 0) {
 const sharpWeight = (sharpnessAmount / 100) * 0.45;
 const sharpCanvas = document.createElement('canvas');
 sharpCanvas.width = w;
 sharpCanvas.height = h;
 const sCtx = sharpCanvas.getContext('2d');
 sCtx.drawImage(tempCanvas, 0, 0);

 const srcData = ctx.getImageData(0, 0, w, h).data;
 const sharpImgData = sCtx.getImageData(0, 0, w, h);
 const dst = sharpImgData.data;

 // 3x3 Sharpen Kernel
 for (let y = 1; y < h - 1; y++) {
 for (let x = 1; x < w - 1; x++) {
 const idx = (y * w + x) * 4;
 if (srcData[idx + 3] === 0) continue;

 for (let c = 0; c < 3; c++) {
 const top = srcData[((y - 1) * w + x) * 4 + c];
 const bottom = srcData[((y + 1) * w + x) * 4 + c];
 const left = srcData[(y * w + (x - 1)) * 4 + c];
 const right = srcData[(y * w + (x + 1)) * 4 + c];
 const center = srcData[idx + c];

 // Laplacian edge
 const laplacian = (4 * center) - (top + bottom + left + right);
 const enhanced = center + laplacian * sharpWeight;
 dst[idx + c] = Math.min(255, Math.max(0, enhanced));
 }
 }
 }
 sCtx.putImageData(sharpImgData, 0, 0);
 return sharpCanvas;
 }

 return tempCanvas;
 }

 // ==========================================
 // STEP 4: BACKGROUND COLOR CONTROLS
 // ==========================================
 bgPresetBtns.forEach(btn => {
 btn.addEventListener('click', (e) => {
 bgPresetBtns.forEach(b => {
 b.classList.remove('border-2', 'border-blue-600', 'active');
 b.classList.add('border', 'border-slate-300');
 });
 const clicked = e.currentTarget;
 clicked.classList.remove('border', 'border-slate-300');
 clicked.classList.add('border-2', 'border-blue-600', 'active');

 selectedBgColor = clicked.dataset.color;
 customColorPicker.value = selectedBgColor;
 customColorHex.value = selectedBgColor;
 updateBgLabel(selectedBgColor, clicked.title);

 renderSinglePhotoOutput();
 updateValidationChecklist();
 });
 });

 customColorPicker.addEventListener('input', (e) => {
 selectedBgColor = e.target.value.toUpperCase();
 customColorHex.value = selectedBgColor;
 updateBgLabel(selectedBgColor, 'Custom HEX');
 renderSinglePhotoOutput();
 updateValidationChecklist();
 });

 customColorHex.addEventListener('change', (e) => {
 let val = e.target.value.trim();
 if (!val.startsWith('#')) val = '#' + val;
 if (/^#[0-9A-F]{6}$/i.test(val)) {
 selectedBgColor = val.toUpperCase();
 customColorPicker.value = selectedBgColor;
 updateBgLabel(selectedBgColor, 'Custom HEX');
 renderSinglePhotoOutput();
 updateValidationChecklist();
 }
 });

 function updateBgLabel(hex, title) {
 if (currentBgLabel) {
 currentBgLabel.innerText = `${title || 'Color'} (${hex})`;
 }
 }

 // ==========================================
 // STEP 5, 6 & 7: SIZES, DPI & QUALITY SPECS
 // ==========================================
 sizePreset.addEventListener('change', (e) => {
 const val = e.target.value;
 if (val === 'custom') {
 customSizeBox.classList.remove('hidden');
 parseCustomDimensions();
 } else {
 customSizeBox.classList.add('hidden');
 if (val === '35x45') {
 photoWidthMM = 35;
 photoHeightMM = 45;
 } else if (val === '2x2') {
 photoWidthMM = 50.8;
 photoHeightMM = 50.8;
 } else if (val === '1.2x1.6') {
 photoWidthMM = 30.48;
 photoHeightMM = 40.64;
 }
 applyUpdatedDimensions();
 }
 });

 [customWidthVal, customHeightVal, customUnitVal].forEach(elem => {
 elem.addEventListener('input', parseCustomDimensions);
 });

 function parseCustomDimensions() {
 let w = parseFloat(customWidthVal.value) || 35;
 let h = parseFloat(customHeightVal.value) || 45;
 const unit = customUnitVal.value;

 if (unit === 'cm') { w *= 10; h *= 10; }
 else if (unit === 'inch') { w *= 25.4; h *= 25.4; }
 else if (unit === 'pixel') {
 w = (w * 25.4) / photoDPI;
 h = (h * 25.4) / photoDPI;
 }

 photoWidthMM = Math.max(15, w);
 photoHeightMM = Math.max(15, h);
 applyUpdatedDimensions();
 }

 function applyUpdatedDimensions() {
 if (cropper) {
 cropper.setAspectRatio(photoWidthMM / photoHeightMM);
 executeCropAndProcess();
 }
 updateValidationChecklist();
 }

 dpiSelect.addEventListener('change', (e) => {
 photoDPI = parseInt(e.target.value) || 300;
 if (cropper) executeCropAndProcess();
 updateValidationChecklist();
 });

 // ==========================================
 // RENDER SINGLE PASSPORT PHOTO OUTPUT
 // ==========================================
 function renderSinglePhotoOutput() {
 if (!croppedPortraitCanvas) return;

 const targetPxWidth = Math.round((photoWidthMM * photoDPI) / 25.4);
 const targetPxHeight = Math.round((photoHeightMM * photoDPI) / 25.4);

 singlePhotoCanvas.width = targetPxWidth;
 singlePhotoCanvas.height = targetPxHeight;
 const ctx = singlePhotoCanvas.getContext('2d');

 // Draw Selected Background Color (Pure White #FFFFFF by default)
 ctx.fillStyle = selectedBgColor;
 ctx.fillRect(0, 0, targetPxWidth, targetPxHeight);

 // Subject (Segmented person or raw crop)
 let subject = (isBgRemoved && segmentedPersonCanvas && !chkKeepOriginalBg.checked) 
 ? segmentedPersonCanvas 
 : croppedPortraitCanvas;

 // Apply Studio Face Clean & Lighting Filter (if enabled)
 if (isFaceCleanActive) {
 subject = applyStudioFaceCleanFilter(subject);
 }

 ctx.drawImage(subject, 0, 0, targetPxWidth, targetPxHeight);

 // Border
 if (chkBorder.checked) {
 ctx.strokeStyle = '#D1D5DB';
 ctx.lineWidth = Math.max(1, Math.round((0.2 * photoDPI) / 25.4));
 ctx.strokeRect(0, 0, targetPxWidth, targetPxHeight);
 }

 // Live quality stats
 statPixels.innerText = `${targetPxWidth} - ${targetPxHeight} px`;
 statPhysical.innerText = `${photoWidthMM.toFixed(1)} - ${photoHeightMM.toFixed(1)} mm`;
 statDpi.innerText = `${photoDPI} DPI`;
 
 singlePhotoCanvas.toBlob((blob) => {
 if (blob) {
 statFileSize.innerText = `~${Math.round(blob.size / 1024)} KB`;
 }
 }, 'image/jpeg', 0.95);

 singlePhotoSpecsBadge.innerText = `${photoWidthMM.toFixed(0)} - ${photoHeightMM.toFixed(0)} mm (${photoDPI} DPI)`;
 }

 // Single Photo Downloads
 btnDownloadSingleJpg.addEventListener('click', () => downloadSinglePhoto('image/jpeg', 'jpg'));
 btnDownloadSinglePng.addEventListener('click', () => downloadSinglePhoto('image/png', 'png'));

 function downloadSinglePhoto(format, ext) {
 if (!croppedPortraitCanvas) {
 alert('Please crop your photo first.');
 return;
 }
 renderSinglePhotoOutput();
 const link = document.createElement('a');
 link.download = `AMAAN_CSC_PassportPhoto_${photoWidthMM}x${photoHeightMM}mm_${Date.now()}.${ext}`;
 link.href = singlePhotoCanvas.toDataURL(format, 0.95);
 link.click();
 showNotificationToast(`Downloaded Single Passport Photo (${ext.toUpperCase()})`);
 }

 // ==========================================
 // STEP 9 & 10: PRINT SHEET LAYOUT (A4 & 4 - 6)
 // ==========================================
 btnApply8Photos.addEventListener('click', () => {
 paperSize.value = '4x6';
 paperOrientation.value = 'landscape';
 copiesSelect.value = '8';
 sheetSpacing.value = '1.5';
 sheetMargin.value = '3';
 showNotificationToast('Configured 4 - 6 sheet (8 Photos layout preset).');
 if (croppedPortraitCanvas) {
 generateSheetLayout();
 previewModal.classList.remove('hidden');
 }
 });

 btnGeneratePreview.addEventListener('click', () => {
 if (!croppedPortraitCanvas) {
 alert('Please upload a photo first.');
 return;
 }
 renderSinglePhotoOutput();
 const success = generateSheetLayout();
 if (success) {
 previewModal.classList.remove('hidden');
 }
 });

 btnClosePreview.addEventListener('click', () => {
 previewModal.classList.add('hidden');
 });

 function generateSheetLayout() {
 let pWidthMM = paperSize.value === 'A4' ? 210 : 101.6;
 let pHeightMM = paperSize.value === 'A4' ? 297 : 152.4;

 const orientation = paperOrientation.value;
 if (orientation === 'landscape') {
 const temp = pWidthMM;
 pWidthMM = pHeightMM;
 pHeightMM = temp;
 }

 const marginMM = parseFloat(sheetMargin.value) || 3;
 const spacingMM = parseFloat(sheetSpacing.value) || 1.5;

 const printableWidthMM = pWidthMM - (marginMM * 2);
 const printableHeightMM = pHeightMM - (marginMM * 2);

 const cols = Math.floor((printableWidthMM + spacingMM) / (photoWidthMM + spacingMM));
 const rows = Math.floor((printableHeightMM + spacingMM) / (photoHeightMM + spacingMM));
 const maxPhysicalFit = cols * rows;

 if (maxPhysicalFit <= 0) {
 alert(`Error: Selected photo size (${photoWidthMM} - ${photoHeightMM} mm) is larger than the paper printable bounds.`);
 return false;
 }

 let requestedCopies = copiesSelect.value === 'auto' ? maxPhysicalFit : parseInt(copiesSelect.value);
 if (requestedCopies > maxPhysicalFit) {
 alert(`Note: Only ${maxPhysicalFit} photos can physically fit on this ${paperSize.value} sheet without overlap. Adjusting to ${maxPhysicalFit} copies.`);
 requestedCopies = maxPhysicalFit;
 }

 const mmToPx = (mm) => Math.round((mm * photoDPI) / 25.4);
 const sheetWidthPx = mmToPx(pWidthMM);
 const sheetHeightPx = mmToPx(pHeightMM);
 const photoWidthPx = mmToPx(photoWidthMM);
 const photoHeightPx = mmToPx(photoHeightMM);
 const marginPx = mmToPx(marginMM);
 const spacingPx = mmToPx(spacingMM);

 const sheetCanvas = document.createElement('canvas');
 sheetCanvas.width = sheetWidthPx;
 sheetCanvas.height = sheetHeightPx;
 sheetCanvas.id = 'finalPrintSheetCanvas';
 const ctx = sheetCanvas.getContext('2d');

 // Clean white paper
 ctx.fillStyle = '#FFFFFF';
 ctx.fillRect(0, 0, sheetWidthPx, sheetHeightPx);

 const actualGridCols = Math.min(cols, requestedCopies);
 const actualGridRows = Math.ceil(requestedCopies / actualGridCols);
 const totalGridWidthPx = (actualGridCols * photoWidthPx) + ((actualGridCols - 1) * spacingPx);
 const totalGridHeightPx = (actualGridRows * photoHeightPx) + ((actualGridRows - 1) * spacingPx);

 const startX = Math.round((sheetWidthPx - totalGridWidthPx) / 2);
 const startY = Math.round((sheetHeightPx - totalGridHeightPx) / 2);

 let drawn = 0;
 const drawCutLines = chkCutLines.checked;

 for (let r = 0; r < actualGridRows; r++) {
 for (let c = 0; c < actualGridCols; c++) {
 if (drawn >= requestedCopies) break;

 const x = startX + (c * (photoWidthPx + spacingPx));
 const y = startY + (r * (photoHeightPx + spacingPx));

 ctx.drawImage(singlePhotoCanvas, x, y, photoWidthPx, photoHeightPx);

 if (drawCutLines) {
 ctx.save();
 ctx.strokeStyle = '#94A3B8';
 ctx.lineWidth = Math.max(1, mmToPx(0.15));
 ctx.setLineDash([mmToPx(1), mmToPx(1)]);
 ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
 ctx.restore();
 }

 drawn++;
 }
 }

 // CSC Footer Marking
 ctx.fillStyle = '#64748B';
 ctx.font = `${Math.round(mmToPx(2.2))}px sans-serif`;
 ctx.fillText(`AMAAN CSC CENTER - Main Road, In Front of Devigali, Pipili, Puri (Mo: 9078765653) - Passport Photos (${photoWidthMM} - ${photoHeightMM}mm) - ${drawn} Copies`, marginPx, sheetHeightPx - Math.round(mmToPx(1.2)));

 printCanvasContainer.innerHTML = '';
 sheetCanvas.style.maxWidth = '100%';
 sheetCanvas.style.maxHeight = '65vh';
 printCanvasContainer.appendChild(sheetCanvas);

 previewStatsBar.innerHTML = `
 <strong>Paper:</strong> ${paperSize.value} (${orientation}) | 
 <strong>Photo:</strong> ${photoWidthMM} - ${photoHeightMM} mm | 
 <strong>Copies:</strong> <span class="text-emerald-700 font-bold">${drawn} Photos</span> | 
 <strong>DPI:</strong> ${photoDPI}
 `;

 billOrderPhotoSize.innerText = `${photoWidthMM} - ${photoHeightMM} mm`;
 billOrderBgColor.innerText = selectedBgColor;
 billOrderPaperSize.innerText = `${paperSize.value} (${orientation})`;
 billOrderCopies.innerText = `${drawn} Photos`;
 billOrderAmount.value = drawn <= 8 ? 50 : 100;

 return true;
 }

 // ==========================================
 // STEP 12 & 13: SHEET EXPORT (JPG, PNG, PDF, PRINT)
 // ==========================================
 btnDownloadSheetJpg.addEventListener('click', () => {
 const canvas = document.getElementById('finalPrintSheetCanvas');
 if (!canvas) return;
 const link = document.createElement('a');
 link.download = `AMAAN_CSC_PassportSheet_${paperSize.value}_${Date.now()}.jpg`;
 link.href = canvas.toDataURL('image/jpeg', 0.95);
 link.click();
 showNotificationToast('Downloaded Passport Sheet (JPG)');
 });

 btnDownloadSheetPng.addEventListener('click', () => {
 const canvas = document.getElementById('finalPrintSheetCanvas');
 if (!canvas) return;
 const link = document.createElement('a');
 link.download = `AMAAN_CSC_PassportSheet_${paperSize.value}_${Date.now()}.png`;
 link.href = canvas.toDataURL('image/png');
 link.click();
 showNotificationToast('Downloaded Passport Sheet (PNG)');
 });

 btnDownloadPdfSheet.addEventListener('click', () => {
 const canvas = document.getElementById('finalPrintSheetCanvas');
 if (!canvas) return;

 const orientation = paperOrientation.value === 'landscape' ? 'l' : 'p';
 const pSize = paperSize.value;
 const format = pSize === 'A4' ? 'a4' : [101.6, 152.4];

 const { jsPDF } = window.jspdf;
 const pdf = new jsPDF({
 orientation: orientation,
 unit: 'mm',
 format: format
 });

 const imgData = canvas.toDataURL('image/jpeg', 0.95);
 const w = orientation === 'l' ? (pSize === 'A4' ? 297 : 152.4) : (pSize === 'A4' ? 210 : 101.6);
 const h = orientation === 'l' ? (pSize === 'A4' ? 210 : 101.6) : (pSize === 'A4' ? 297 : 152.4);

 pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
 pdf.save(`AMAAN_CSC_PrintReady_PassportSheet_${Date.now()}.pdf`);
 showNotificationToast('Generated Print-Ready PDF Sheet (Preserved mm dimensions)');
 });

 btnDirectPrintSheet.addEventListener('click', () => {
 window.print();
 });

 // ==========================================
 // SERVICE INTEGRATION & BILLING
 // ==========================================
 if (btnAddToBillFromPreview) {
 btnAddToBillFromPreview.addEventListener('click', () => {
 window.location.href = 'billing.html';
 });
 }

 if (btnPrintAtCscDirect) {
 btnPrintAtCscDirect.addEventListener('click', () => {
 window.location.href = 'billing.html';
 });
 }

 // ==========================================
 // VALIDATION CHECKLIST & HISTORY
 // ==========================================
 function updateValidationChecklist() {
 const hasPhoto = !!croppedPortraitCanvas;
 const hasBg = !!selectedBgColor;
 const hasDim = photoWidthMM > 0 && photoHeightMM > 0;
 const hasDpi = photoDPI >= 150;
 const hasPaper = !!paperSize.value;
 const hasCopies = !!copiesSelect.value;
 const printableArea = true;
 const noOverlap = true;
 const exportReady = hasPhoto && hasBg && hasDim && hasDpi && hasPaper && hasCopies;

 setCheck('vCheckPhoto', hasPhoto);
 setCheck('vCheckBg', hasBg);
 setCheck('vCheckDim', hasDim);
 setCheck('vCheckDpi', hasDpi);
 setCheck('vCheckPaper', hasPaper);
 setCheck('vCheckCopies', hasCopies);
 setCheck('vCheckPrintable', printableArea);
 setCheck('vCheckOverlap', noOverlap);
 setCheck('vCheckReady', exportReady);
 }

 function setCheck(elemId, status) {
 const el = document.getElementById(elemId);
 if (!el) return;
 if (status) {
 el.innerHTML = `<span class="text-emerald-600 font-bold"> - </span> <span class="text-slate-800 font-medium">${el.innerText.replace(/[ - ]/g, '').trim()}</span>`;
 } else {
 el.innerHTML = `<span class="text-slate-400"> - </span> <span class="text-slate-500">${el.innerText.replace(/[ - ]/g, '').trim()}</span>`;
 }
 }

 function savePresetToHistory(label) {
 try {
 let history = JSON.parse(localStorage.getItem('amaan_passport_history') || '[]');
 history.unshift({
 date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
 label: label,
 size: `${photoWidthMM} - ${photoHeightMM}mm`,
 paper: paperSize.value,
 bg: selectedBgColor
 });
 if (history.length > 5) history = history.slice(0, 5);
 localStorage.setItem('amaan_passport_history', JSON.stringify(history));
 renderHistoryList();
 } catch (e) {}
 }

 function renderHistoryList() {
 if (!historyList) return;
 try {
 const history = JSON.parse(localStorage.getItem('amaan_passport_history') || '[]');
 if (history.length === 0) {
 historyList.innerHTML = '<p class="text-slate-400 italic text-[11px]">No recent designs yet. Privacy preserved.</p>';
 return;
 }
 historyList.innerHTML = '';
 history.forEach(item => {
 const row = document.createElement('div');
 row.className = 'p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center text-[11px]';
 row.innerHTML = `
 <div>
 <strong class="text-blue-950">${item.size}</strong> (${item.paper})
 <span class="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 ml-1" style="background-color: ${item.bg}"></span>
 </div>
 <span class="text-slate-400 font-mono">${item.date}</span>
 `;
 historyList.appendChild(row);
 });
 } catch (e) {}
 }

 if (btnClearHistory) {
 btnClearHistory.addEventListener('click', () => {
 localStorage.removeItem('amaan_passport_history');
 renderHistoryList();
 });
 }

 renderHistoryList();
 updateValidationChecklist();

 function showNotificationToast(msg) {
 if (typeof showToast === 'function') {
 showToast(msg);
 } else {
 console.log(msg);
 }
 }
});
