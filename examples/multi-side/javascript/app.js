
/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * This example app demonstrates how to use BlinkID In-browser SDK to achieve the following:
 *
 * - Change default SDK settings
 * - Scan front and back side of the identity document with web camera (multi-side experience)
 * - Provide visual feedback to the end-user during the scan
 */

// General UI helpers
const initialMessageEl = document.getElementById("msg");
const progressEl = document.getElementById("load-progress");

// UI elements for scanning feedback
const cameraFeed = document.getElementById("camera-feed");
const cameraFeedback = document.getElementById("camera-feedback");
const drawContext = cameraFeedback.getContext("2d");
const scanFeedback = document.getElementById("camera-guides");

/**
 * Display comprehensive Driver's License data
 */
function displayDriverLicenseData(result) {
  // Helper function to format date
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return 'N/A';
    return `${dateObj.month}/${dateObj.day}/${dateObj.year}`;
  };
  
  // Helper function to get text value
  const getText = (field) => {
    if (!field) return 'N/A';
    return field.latin || field.cyrillic || field.arabic || field.description || 'N/A';
  };

  // Extract all fields
  const data = {
    // Personal Information
    firstName: getText(result.firstName) || result.mrz?.secondaryID || 'N/A',
    lastName: getText(result.lastName) || result.mrz?.primaryID || 'N/A',
    fullName: getText(result.fullName) || 'N/A',
    
    // Document Information
    documentNumber: getText(result.documentNumber) || 'N/A',
    documentType: result.classInfo?.documentType || 'N/A',
    issuingAuthority: getText(result.issuingAuthority) || 'N/A',
    
    // Dates
    dateOfBirth: formatDate(result.dateOfBirth) || formatDate(result.mrz?.dateOfBirth),
    dateOfExpiry: formatDate(result.dateOfExpiry) || formatDate(result.mrz?.dateOfExpiry),
    dateOfIssue: formatDate(result.dateOfIssue),
    
    // Address
    address: getText(result.address) || 'N/A',
    
    // Physical Description
    sex: getText(result.sex) || result.mrz?.gender || 'N/A',
    nationality: getText(result.nationality) || result.mrz?.nationality || 'N/A',
    
    // Driver License Specific
    licenseCategories: getText(result.licenseCategories) || getText(result.vehicleClassesInfo) || 'N/A',
    restrictions: getText(result.restrictions) || 'N/A',
    endorsements: getText(result.endorsements) || 'N/A',
    
    // Additional fields
    placeOfBirth: getText(result.placeOfBirth) || 'N/A',
    personalIdNumber: getText(result.personalIdNumber) || 'N/A',
    
    // Barcode data if available
    barcodeData: result.barcodeResult ? {
      firstName: result.barcodeResult.firstName || 'N/A',
      lastName: result.barcodeResult.lastName || 'N/A',
      address: result.barcodeResult.street || 'N/A',
      city: result.barcodeResult.city || 'N/A',
      jurisdiction: result.barcodeResult.jurisdiction || 'N/A',
      postalCode: result.barcodeResult.postalCode || 'N/A',
      documentNumber: result.barcodeResult.documentNumber || 'N/A',
      dateOfBirth: formatDate(result.barcodeResult.dateOfBirth),
      dateOfExpiry: formatDate(result.barcodeResult.dateOfExpiry),
      dateOfIssue: formatDate(result.barcodeResult.dateOfIssue),
      sex: result.barcodeResult.sex || 'N/A',
      height: result.barcodeResult.height || 'N/A',
      weight: result.barcodeResult.weight || 'N/A',
      eyeColour: result.barcodeResult.eyeColour || 'N/A',
      hairColour: result.barcodeResult.hairColour || 'N/A',
      vehicleClass: result.barcodeResult.vehicleClass || 'N/A',
      restrictions: result.barcodeResult.restrictions || 'N/A',
      endorsements: result.barcodeResult.endorsements || 'N/A'
    } : null
  };

  // Build HTML result display
  let html = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; overflow: auto; padding: 20px; box-sizing: border-box;">
      <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Driver's License Data (Multi-Side Scan)</h2>
        
        <h3 style="color: #4CAF50; margin-top: 20px;">Personal Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Full Name:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.fullName !== 'N/A' ? data.fullName : (data.firstName + ' ' + data.lastName)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">First Name:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.firstName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Last Name:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.lastName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Date of Birth:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.dateOfBirth}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Sex:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.sex}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Nationality:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.nationality}</td></tr>
          ${data.placeOfBirth !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Place of Birth:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.placeOfBirth}</td></tr>` : ''}
        </table>
        
        <h3 style="color: #4CAF50; margin-top: 20px;">Document Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Document Number:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.documentNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Document Type:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.documentType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Issuing Authority:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.issuingAuthority}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Date of Issue:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.dateOfIssue}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Date of Expiry:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.dateOfExpiry}</td></tr>
        </table>
        
        <h3 style="color: #4CAF50; margin-top: 20px;">Address</h3>
        <p style="padding: 8px; background: #f5f5f5; border-left: 3px solid #4CAF50;">${data.address}</p>
        
        <h3 style="color: #4CAF50; margin-top: 20px;">License Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Vehicle Class:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.licenseCategories}</td></tr>
          ${data.restrictions !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Restrictions:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.restrictions}</td></tr>` : ''}
          ${data.endorsements !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Endorsements:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.endorsements}</td></tr>` : ''}
        </table>
  `;

  // Add barcode data if available
  if (data.barcodeData) {
    html += `
        <h3 style="color: #4CAF50; margin-top: 20px;">Barcode Data (AAMVA)</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Document Number:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.barcodeData.documentNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Full Address:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.barcodeData.address}, ${data.barcodeData.city}, ${data.barcodeData.jurisdiction} ${data.barcodeData.postalCode}</td></tr>
          ${data.barcodeData.height !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Height:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.barcodeData.height}</td></tr>` : ''}
          ${data.barcodeData.weight !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Weight:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.barcodeData.weight}</td></tr>` : ''}
          ${data.barcodeData.eyeColour !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Eye Color:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.barcodeData.eyeColour}</td></tr>` : ''}
          ${data.barcodeData.hairColour !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Hair Color:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.barcodeData.hairColour}</td></tr>` : ''}
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Vehicle Class:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.barcodeData.vehicleClass}</td></tr>
        </table>
    `;
  }

  html += `
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="this.parentElement.parentElement.parentElement.remove(); location.reload();" style="background: #4CAF50; color: white; border: none; padding: 15px 30px; font-size: 16px; border-radius: 5px; cursor: pointer;">Close & Scan Again</button>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px; font-size: 12px;">
          <strong>Raw JSON data available in console</strong> - Press F12 to view complete results
        </div>
      </div>
    </div>
  `;

  // Display the results
  document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Check browser support, customize settings and load WASM SDK.
 */
function main()
{
  // Check if browser has proper support for WebAssembly
  if (!BlinkIDSDK.isBrowserSupported())
  {
    initialMessageEl.innerText = "This browser is not supported!";
    return;
  }

  // 1. It's possible to obtain a free trial license key on microblink.com
  let licenseKey = "sRwCAA0xOTIuMTY4LjEuMTQ3BmxleUpEY21WaGRHVmtUMjRpT2pFM05qTXhNVFF4TnpJMk1qSXNJa055WldGMFpXUkdiM0lpT2lKaU5UazBaVGsxWVMwek9ERTJMVFF3TVdVdFltSTNOeTB6WkdSbE9EUTBNakEwTVRFaWZRPT2bhhRL3L3Gks2Srr7Isp4cMNWbL9JCWmm8/OBMNJXxA/Xf1AxsVQ1zTV8qjhgtx5qM2Po063l9vOr+oZbFpcZnvG30oNMruWuJ4X1nqG2vK9L21hiyx5UePLp6o/f1";

  if (window.location.hostname === "blinkid.github.io")
  {
    licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRmaAJoXl2O0cr5LY5eMMHTC+1Q6ALScByPrv+d1Dn8VUwI53ALBxbvzGqCKoriIY9B69Db3kUCaQmsCMMyTLBs7torQL1d9qazrOfPeC5DgMxsT4t0uRZOB/FYsVW4Lsm3ubXEQ4tEBUt1WjjmeEnHlvWeOEBqca/7IRD4nfepU0SmuHpKP8VdvVft9NE1Dsrl1TMee+Q81bZieD7beHS+jYfbWTIF5pc84LmImDOvu4wk47uzxJUKGiw1bvqCYq7R6LR6yEPTZfQeVJK6t9oldcBcPFAvLu/WS0iasJFbcgsEvs8a5VemOCRRLHwO5YGA==";
  }

  // 2. Create instance of SDK load settings with your license key
  const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(licenseKey);

  // [OPTIONAL] Change default settings

  // Show or hide hello message in browser console when WASM is successfully loaded
  loadSettings.allowHelloMessage = true;

  // In order to provide better UX, display progress bar while loading the SDK
  loadSettings.loadProgressCallback = (progress) => progressEl.value = progress;

  // Set absolute location of the engine, i.e. WASM and support JS files
  loadSettings.engineLocation = window.location.origin + "/resources";

  // Set absolute location of the worker file
  loadSettings.workerLocation = window.location.origin + "/resources/BlinkIDWasmSDK.worker.min.js";

  // 3. Load SDK
  BlinkIDSDK.loadWasmModule(loadSettings).then(

    (sdk) =>
    {
      document.getElementById("screen-initial")?.classList.add("hidden");
      document.getElementById("screen-start")?.classList.remove("hidden");
      document.getElementById("start-scan")?.addEventListener("click", (ev) =>
      {
        ev.preventDefault();
        startScan(sdk);
      });
    },
    (error) =>
    {
      initialMessageEl.innerText = "Failed to load SDK!";
      console.error("Failed to load SDK!", error);
    }
  );
}

/**
 * Scan single side of identity document with web camera.
 */
async function startScan(sdk)
{
  document.getElementById("screen-start")?.classList.add("hidden");
  document.getElementById("screen-scanning")?.classList.remove("hidden");

  // 1. Create a recognizer objects which will be used to recognize single image or stream of images.
  //
  // BlinkID Multi-side Recognizer - scan ID documents on both sides
  const multiSideGenericIDRecognizer = await BlinkIDSDK.createBlinkIdMultiSideRecognizer(sdk);
  
  // Configure recognizer settings for maximum success rate (like mobile app)
  const settings = await multiSideGenericIDRecognizer.currentSettings();
  
  // Image return settings
  settings.returnFullDocumentImage = true;
  settings.returnFaceImage = true;
  settings.returnSignatureImage = false;
  
  // Reduce quality requirements for easier scanning
  settings.allowBlurFilter = false; // Don't reject blurry images
  settings.allowUnparsedMrzResults = true; // Accept even if MRZ parsing fails
  settings.allowUnverifiedMrzResults = true; // Accept even if MRZ check digits don't match
  settings.validateResultCharacters = false; // Don't be strict about character validation
  
  // Additional settings to improve success rate
  settings.paddingEdge = 0.0; // No padding required
  
  await multiSideGenericIDRecognizer.updateSettings(settings);
  
  console.log("Multi-side recognizer settings:", settings);
  
  // Track which side we're scanning
  let isFirstSide = true;

  // Create a callbacks object that will receive recognition events, such as detected object location etc.
  const callbacks = {
    onQuadDetection: (quad) => {
      drawQuad(quad);
      updateScanFeedback(isFirstSide ? "Scanning front side - hold steady" : "Scanning back side - hold steady", false);
    },
    onDetectionFailed: () => updateScanFeedback(isFirstSide ? "Position front side in frame" : "Position back side in frame", true),

    // This callback is required for multi-side experience.
    onFirstSideResult: () => {
      isFirstSide = false;
      alert("✓ Front side captured!\n\nNow flip the document and show the BACK side");
      updateScanFeedback("Now scan the back side", false);
    }
  };

  // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
  //    recognizer objects.
  const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(

    // SDK instance to use
    sdk,
    // List of recognizer objects that will be associated with created RecognizerRunner object
    [multiSideGenericIDRecognizer],
    // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
    false,
    // Callbacks object that will receive recognition events
    callbacks
  );

  // 3. Create a VideoRecognizer object and attach it to HTMLVideoElement that will be used for displaying the camera feed
  const videoRecognizer = await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(

    cameraFeed,
    recognizerRunner
  );

  // 4. Start the recognition and get results from callback
  try
  {
    videoRecognizer.startRecognition(

      // 5. Obtain the results
      async (recognitionState) =>
      {
        console.log("=== CALLBACK TRIGGERED ===");
        console.log("Recognition State:", recognitionState);
        console.log("Recognition State Value:", BlinkIDSDK.RecognizerResultState);
        console.log("VideoRecognizer exists:", !!videoRecognizer);
        
        if (!videoRecognizer)
        {
          console.log("EXIT: No videoRecognizer");
          return;
        }

        // Pause recognition before performing any async operation
        videoRecognizer.pauseRecognition();
        console.log("Recognition paused");

        if (recognitionState === BlinkIDSDK.RecognizerResultState.Empty)
        {
          console.log("EXIT: Recognition state is Empty");
          console.log("Resuming recognition to continue scanning...");
          videoRecognizer.resumeRecognition(true);
          return;
        }

        console.log("Getting result from recognizer...");
        const result = await multiSideGenericIDRecognizer.getResult();
        
        console.log("Result state:", result.state);
        console.log("Full result:", result);

        if (result.state === BlinkIDSDK.RecognizerResultState.Empty)
        {
          console.log("EXIT: Result state is Empty");
          console.log("Resuming recognition to continue scanning...");
          videoRecognizer.resumeRecognition(true);
          return;
        }

        console.log("=== SUCCESS - DISPLAYING RESULTS ===");
        console.log("BlinkID Multi-side recognizer results", result);

        // Display comprehensive DL data
        displayDriverLicenseData(result);

        // 6. Release all resources allocated on the WebAssembly heap and associated with camera stream

        // Release browser resources associated with the camera stream
        videoRecognizer?.releaseVideoFeed();

        // Release memory on WebAssembly heap used by the RecognizerRunner
        recognizerRunner?.delete();

        // Release memory on WebAssembly heap used by the recognizer
        multiSideGenericIDRecognizer?.delete();

        // Clear any leftovers drawn to canvas
        clearDrawCanvas();

        // Hide scanning screen and show scan button again
        document.getElementById("screen-start")?.classList.remove("hidden");
        document.getElementById("screen-scanning")?.classList.add("hidden");
      }
    );
  }
  catch (error)
  {
    console.error("Error during initialization of VideoRecognizer:", error);
    return;
  }
}

/**
 * Utility functions for drawing detected quadrilateral onto canvas.
 */
function drawQuad(quad)
{
  clearDrawCanvas();

  // Based on detection status, show appropriate color and message
  setupColor(quad);
  setupMessage(quad);

  applyTransform(quad.transformMatrix);
  drawContext.beginPath();
  drawContext.moveTo(quad.topLeft.x, quad.topLeft.y);
  drawContext.lineTo(quad.topRight.x, quad.topRight.y);
  drawContext.lineTo(quad.bottomRight.x, quad.bottomRight.y);
  drawContext.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
  drawContext.closePath();
  drawContext.stroke();
}

/**
 * This function will make sure that coordinate system associated with detectionResult
 * canvas will match the coordinate system of the image being recognized.
 */
function applyTransform(transformMatrix)
{
  const canvasAR = cameraFeedback.width / cameraFeedback.height;
  const videoAR = cameraFeed.videoWidth / cameraFeed.videoHeight;

  let xOffset = 0;
  let yOffset = 0;
  let scaledVideoHeight = 0;
  let scaledVideoWidth = 0;

  if (canvasAR > videoAR)
  {
    // pillarboxing: https://en.wikipedia.org/wiki/Pillarbox
    scaledVideoHeight = cameraFeedback.height;
    scaledVideoWidth = videoAR * scaledVideoHeight;
    xOffset = (cameraFeedback.width - scaledVideoWidth) / 2.0;
  } else

  {
    // letterboxing: https://en.wikipedia.org/wiki/Letterboxing_(filming)
    scaledVideoWidth = cameraFeedback.width;
    scaledVideoHeight = scaledVideoWidth / videoAR;
    yOffset = (cameraFeedback.height - scaledVideoHeight) / 2.0;
  }

  // first transform canvas for offset of video preview within the HTML video element (i.e. correct letterboxing or pillarboxing)
  drawContext.translate(xOffset, yOffset);
  // second, scale the canvas to fit the scaled video
  drawContext.scale(

    scaledVideoWidth / cameraFeed.videoWidth,
    scaledVideoHeight / cameraFeed.videoHeight
  );

  // finally, apply transformation from image coordinate system to
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
  drawContext.transform(

    transformMatrix[0],
    transformMatrix[3],
    transformMatrix[1],
    transformMatrix[4],
    transformMatrix[2],
    transformMatrix[5]
  );
}

function clearDrawCanvas()
{
  cameraFeedback.width = cameraFeedback.clientWidth;
  cameraFeedback.height = cameraFeedback.clientHeight;

  drawContext.clearRect(

    0,
    0,
    cameraFeedback.width,
    cameraFeedback.height
  );
}

function setupColor(displayable)
{
  let color = "#FFFF00FF";

  if (displayable.detectionStatus === 0)
  {
    color = "#FF0000FF";
  } else
  if (displayable.detectionStatus === 1)
  {
    color = "#00FF00FF";
  }

  drawContext.fillStyle = color;
  drawContext.strokeStyle = color;
  drawContext.lineWidth = 5;
}

function setupMessage(displayable)
{
  switch (displayable.detectionStatus) {

    case BlinkIDSDK.DetectionStatus.Failed:
      updateScanFeedback("Scanning...");
      break;
    case BlinkIDSDK.DetectionStatus.Success:
    case BlinkIDSDK.DetectionStatus.FallbackSuccess:
      updateScanFeedback("Detection successful");
      break;
    case BlinkIDSDK.DetectionStatus.CameraAngleTooSteep:
      updateScanFeedback("Adjust the angle");
      break;
    case BlinkIDSDK.DetectionStatus.CameraTooFar:
      updateScanFeedback("Move document closer");
      break;
    case BlinkIDSDK.DetectionStatus.CameraTooClose:
    case BlinkIDSDK.DetectionStatus.DocumentTooCloseToCameraEdge:
    case BlinkIDSDK.DetectionStatus.DocumentPartiallyVisible:
      updateScanFeedback("Move document farther");
      break;
    default:
      console.warn("Unhandled detection status!", displayable.detectionStatus);
  }
}

let scanFeedbackLock = false;

/**
 * The purpose of this function is to ensure that scan feedback message is
 * visible for at least 1 second.
 */
function updateScanFeedback(message, force)
{
  if (scanFeedbackLock && !force)
  {
    return;
  }

  scanFeedbackLock = true;
  scanFeedback.innerText = message;

  window.setTimeout(() => scanFeedbackLock = false, 1000);
}

// Run
main();
