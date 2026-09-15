# AMAAN CSC CENTER MASTER PROMPT

## DIRECT SERVICE LINK SYSTEM – VERY IMPORTANT

Every CSC service must have a **direct clickable service link**.

Do not create service cards that only display information.

Each service card must contain:

### SERVICE DETAILS

* Service Name
* Service Category
* Short Description
* Required Documents
* Eligibility
* Service Charge
* Processing Information
* Official Website / Portal
* Apply Now
* Customer Enquiry
* Call
* WhatsApp

---

# OFFICIAL DIRECT LINK SYSTEM

Create a dedicated field in the database:

`official_url`

Each service must have its own URL.

Example:

```text
Service Name: PAN Card Apply
Official URL: [Admin enters official portal URL]
Button: APPLY NOW
```

When the customer clicks **APPLY NOW**, open the configured official portal in a new secure browser tab.

Use:

```html
target="_blank"
rel="noopener noreferrer"
```

Do NOT create fake URLs.

Do NOT use unofficial websites as government portals.

If a service does not have a confirmed official online portal, display:

**“Online Link Currently Unavailable – Contact AMAAN CSC CENTER”**

---

# DIRECT LINK SERVICE DIRECTORY

Create direct-link cards for ALL services.

## GOVERNMENT SERVICES

### 1. PAN Card Apply

Button:
**APPLY NOW → OFFICIAL PAN PORTAL**

### 2. Voter ID Apply

Button:
**APPLY NOW → OFFICIAL VOTER PORTAL**

### 3. E-Shram Card

Button:
**APPLY NOW → OFFICIAL E-SHRAM PORTAL**

### 4. Health ID / ABHA

Button:
**APPLY NOW → OFFICIAL HEALTH PORTAL**

### 5. Caste Certificate

Button:
**APPLY NOW → OFFICIAL ODISHA PORTAL**

### 6. Income Certificate

Button:
**APPLY NOW → OFFICIAL ODISHA PORTAL**

### 7. Resident Certificate

Button:
**APPLY NOW → OFFICIAL ODISHA PORTAL**

### 8. Character Certificate

Button:
**APPLY NOW → OFFICIAL PORTAL**

### 9. Ration Card

Button:
**APPLY NOW → OFFICIAL FOOD & CIVIL SUPPLIES PORTAL**

### 10. EC / Encumbrance Certificate

Button:
**APPLY NOW → OFFICIAL LAND/REGISTRATION PORTAL**

### 11. MSME Registration

Button:
**APPLY NOW → OFFICIAL MSME PORTAL**

### 12. Marriage Certificate

Button:
**APPLY NOW → OFFICIAL REGISTRATION PORTAL**

### 13. Driving Licence Apply

Button:
**APPLY NOW → OFFICIAL PARIVAHAN PORTAL**

### 14. DL Replacement

Button:
**APPLY NOW → OFFICIAL PARIVAHAN PORTAL**

### 15. DBT / Bank Linking

Button:
**APPLY NOW → OFFICIAL SERVICE PORTAL**

### 16. Electricity New Connection

Button:
**APPLY NOW → OFFICIAL ELECTRICITY PORTAL**

### 17. Road Tax

Button:
**APPLY NOW → OFFICIAL PARIVAHAN PORTAL**

### 18. Hypothecation Termination

Button:
**APPLY NOW → OFFICIAL PARIVAHAN PORTAL**

### 19. LATRIN Apply

Button:
**APPLY NOW → OFFICIAL LOCAL/GOVERNMENT PORTAL**

### 20. Online FIR

Button:
**APPLY NOW → OFFICIAL ODISHA POLICE PORTAL**

### 21. Sale Deed Slot Booking

Button:
**APPLY NOW → OFFICIAL REGISTRATION PORTAL**

### 22. Land Mutation

Button:
**APPLY NOW → OFFICIAL ODISHA LAND PORTAL**

### 23. Legal Heir Certificate

Button:
**APPLY NOW → OFFICIAL GOVERNMENT PORTAL**

### 24. EWS Certificate

Button:
**APPLY NOW → OFFICIAL ODISHA PORTAL**

### 25. New Solar Connection

Button:
**APPLY NOW → OFFICIAL SOLAR/ELECTRICITY PORTAL**

### 26. RTO Services

Button:
**APPLY NOW → OFFICIAL PARIVAHAN PORTAL**

### 27. FSSAI Certificate

Button:
**APPLY NOW → OFFICIAL FSSAI PORTAL**

---

# YOJANA DIRECT LINKS

Create direct-link buttons for:

* Krushak Odisha
* Subhadra Yojana
* Pension Yojana
* Madhubabu Pension Yojana
* Life Certificate
* Other Government Schemes

Every card must contain:

**OFFICIAL WEBSITE**

**APPLY NOW**

**REQUIRED DOCUMENTS**

**ENQUIRY**

The admin can update the official link at any time.

---

# TICKET & INSURANCE LINKS

Create separate cards for:

### Train Ticket

**BOOK / OFFICIAL LINK**

### Flight Ticket

**BOOK / OFFICIAL LINK**

### Vehicle Insurance

**INSURANCE LINK**

### Health Insurance

**INSURANCE LINK**

Only use authorized/official or configured service-provider links.

Never present a third-party website as a government website.

---

# PRINTING SERVICE LINKS

Printing services should not necessarily redirect to an external website.

Instead, create internal service pages:

* Xerox
* Printout
* Lamination
* Passport Photo
* Spiral Binding
* Birthday Card
* Pamphlet
* Mug Printing
* Pillow Printing
* T-Shirt Printing
* Gift Items

Each should have:

**ORDER NOW**

which opens the internal order/upload system.

---

# ADVANCED PASSPORT PHOTO TOOL

Create a dedicated professional tool:

# INDIAN PASSPORT PHOTO MAKER

This must be a real working image-processing tool, not a static design.

---

# PASSPORT PHOTO TOOL WORKFLOW

### STEP 1 – UPLOAD PHOTO

Large drag-and-drop area:

**UPLOAD PHOTO**

Supported:

* JPG
* JPEG
* PNG
* WEBP

Show instant preview.

Buttons:

* Upload
* Replace Photo
* Remove Photo
* Reset

---

# STEP 2 – PHOTO CROP

Provide an interactive crop editor.

Features:

* Move
* Zoom
* Rotate
* Crop
* Face positioning guide
* Head positioning guide
* Center alignment

Show a visual passport-photo frame.

---

# STEP 3 – BACKGROUND REMOVAL

Add a prominent button:

# REMOVE BACKGROUND

Provide options:

### Automatic Background Removal

Automatically detect the person and remove the original background.

### Manual Background Removal

Provide an optional manual editing mode for correcting difficult edges.

### Keep Original Background

Allow the user to disable background removal.

Do not claim perfect segmentation for every photograph; show a manual correction option when automatic removal has errors.

---

# STEP 4 – BACKGROUND COLOUR OPTIONS

After background removal, provide selectable background colours:

### Presets

* Pure White `#FFFFFF`
* Light Blue
* Blue
* Red
* Green
* Grey
* Light Grey

Also provide:

### CUSTOM COLOUR

Use a color picker.

Allow the user to enter a HEX colour.

Example:

`#FFFFFF`

Show live preview.

---

# STEP 5 – PASSPORT PHOTO SIZE

Create a size selector.

### PRESET

**Indian Passport / ID Photo**

Include a configurable standard preset.

Important:

Do not permanently assume one universal Indian passport-photo dimension because different authorities/forms can specify different dimensions.

Therefore provide:

### CUSTOM SIZE

Fields:

**Width:** ___

**Height:** ___

Unit:

* mm
* cm
* inch
* pixel

DPI:

* 150
* 200
* 300
* Custom

Default:

**300 DPI**

---

# STEP 6 – COMMON PHOTO PRESETS

Add:

### Passport / ID Photo

### 1.2 × 1.6 inch

### 35 × 45 mm

### 2 × 2 inch

### Custom Size

The user can select any preset and modify it.

---

# STEP 7 – PHOTO QUALITY

Show:

* Pixel dimensions
* DPI
* Physical print size
* File size
* Background colour

Provide:

**HIGH QUALITY**

**STANDARD QUALITY**

**COMPRESSED**

---

# STEP 8 – FACE POSITIONING

Create an optional face-position guide.

Display:

* Face center line
* Eye-level guide
* Head boundary
* Shoulder boundary

Allow:

**AUTO CENTER**

and

**MANUAL POSITION**

Do NOT alter the person's identity.

Do NOT beautify the face.

Do NOT whiten skin.

Do NOT reshape facial features.

Do NOT change eyes, nose, mouth or face structure.

The tool should only perform cropping, positioning, background processing and print-layout preparation.

---

# STEP 9 – A4 PASSPORT PHOTO SHEET

Create an automatic A4 print layout.

Paper:

**A4**

Size:

**210 × 297 mm**

Allow:

* Portrait
* Landscape

Automatically place as many selected-size photos as physically fit.

Show:

### PHOTO COUNT

Automatically calculated.

Allow:

* 1
* 2
* 4
* 6
* 8
* Custom maximum

Provide:

**AUTO ARRANGE**

---

# STEP 10 – 4×6 PHOTO PAPER

Create a dedicated preset:

# 4×6 PHOTO PAPER

Paper size:

**4 × 6 inch**

Allow the user to select:

### 8 PHOTOS

Automatically arrange **8 passport photos** on the 4×6 sheet whenever the selected photo dimensions and margins physically allow it.

Show a live layout preview.

Provide:

* 8 Photos
* Auto spacing
* Cut lines
* Margins
* Rotation
* Center alignment

If the selected passport-photo dimensions cannot physically fit eight copies, the software must **calculate the layout instead of forcing an overlapping design** and clearly tell the user how many copies fit.

---

# A4 + 4×6 LAYOUT OPTIONS

Provide:

### Paper

* A4
* 4×6 inch
* Custom

### Orientation

* Portrait
* Landscape

### Copies

* Auto
* 2
* 4
* 6
* 8
* 10
* 12
* Custom

### Spacing

* 0 mm
* 1 mm
* 2 mm
* 3 mm
* Custom

### Margin

* Minimum
* Standard
* Custom

### Cut Lines

ON / OFF

### Border

ON / OFF

---

# STEP 11 – PRINT PREVIEW

Before downloading, show a full printable preview.

Display:

* Paper size
* Photo size
* DPI
* Number of copies
* Background colour
* Margins
* Spacing
* Cut lines

Buttons:

**EDIT**

**DOWNLOAD JPG**

**DOWNLOAD PNG**

**DOWNLOAD PDF**

**PRINT**

---

# STEP 12 – PRINT-READY PDF

Generate a print-ready PDF.

The PDF must preserve:

* Selected physical dimensions
* Correct page size
* Selected DPI/image quality
* Correct number of photos
* Correct spacing
* Correct orientation

Do not simply stretch the preview to fill the PDF.

---

# STEP 13 – PHOTO DOWNLOAD

Provide:

### Download Individual Photo

### Download Photo Sheet

### Download PDF Sheet

### Print Sheet

---

# STEP 14 – PASSPORT PHOTO HISTORY

Optional local history:

* Recent designs
* Last selected size
* Last background colour
* Last paper size

Do not permanently store uploaded personal photographs unless the user explicitly enables storage.

---

# PASSPORT PHOTO TOOL UI

Use a 3-column desktop interface:

### LEFT

Upload + Original Photo

### CENTER

Live Edited Photo

### RIGHT

Settings

Settings:

* Background Remove
* Background Colour
* Photo Size
* Custom Width
* Custom Height
* DPI
* Paper Size
* Copies
* Spacing
* Margins
* Cut Lines

On mobile, convert it into a step-by-step wizard.

---

# PASSPORT PHOTO TOOL BUTTONS

Use large buttons:

**UPLOAD PHOTO**

**REMOVE BACKGROUND**

**CHANGE BACKGROUND**

**CROP PHOTO**

**CUSTOM SIZE**

**AUTO CENTER**

**CREATE A4 SHEET**

**CREATE 4×6 SHEET**

**8 PHOTO LAYOUT**

**DOWNLOAD**

**PRINT**

---

# PASSPORT PHOTO VALIDATION

Before export, display:

✓ Photo loaded

✓ Background selected

✓ Photo dimensions

✓ DPI

✓ Paper size

✓ Number of copies

✓ Printable area

✓ No overlap

✓ Export ready

If there is an error:

**Do not generate an incorrect print sheet.**

Explain the exact problem and provide an automatic correction where possible.

---

# SERVICE + TOOL INTEGRATION

Connect the Passport Photo Maker directly to:

**Printing Services → Passport Size Photo**

When a customer clicks:

**Passport Size Photo → Create Photo**

open the Passport Photo Maker.

After creating the sheet, provide:

**PRINT AT AMAAN CSC CENTER**

This should open an internal print-order form.

The form should automatically carry:

* Service: Passport Size Photo
* Photo size
* Background colour
* Paper size
* Number of copies
* File
* Amount

The operator can edit the amount before generating the bill.

---

# BILLING INTEGRATION

After a tool/service order is completed, show:

**ADD TO BILL**

Example:

Service:
Passport Size Photo

Quantity:
8 Photos

Paper:
4×6

Amount:
₹____

The amount must remain fully editable.

Buttons:

**ADD TO BILL**

**GENERATE BILL**

**PRINT BILL**

**DOWNLOAD PDF**

---

# FINAL REQUIREMENT

The AMAAN CSC CENTER platform must behave as one connected system:

**SERVICE DIRECTORY**
↓
**OFFICIAL DIRECT LINK / INTERNAL SERVICE**
↓
**UPLOAD / APPLICATION / TOOL**
↓
**PREVIEW**
↓
**ORDER**
↓
**BILLING**
↓
**PRINT / DOWNLOAD**
↓
**CUSTOMER ENQUIRY**

Every service and tool must have a clear path back to:

**AMAAN CSC CENTER**
* Address: Main Road, In Front of Devigali, Pipili, Puri, Odisha (PIN: 752104)
* Mobile: +91 9078765653
* Email: amaancsc.pipili@gmail.com

Do not create disconnected demo pages.

Everything should feel like one professional CSC operating system.
