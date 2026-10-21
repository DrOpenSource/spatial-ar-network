# Target Marker Compilation

MindAR.js uses compiled `.mind` target files to achieve fast 60fps feature-tracking in mobile browsers without sending video to a cloud server.

## How to Create Your Own Sticker Target (Under 2 Minutes)

1. Design your high-contrast QR sticker (e.g. your logo or stylized QR code). Ensure it has clear geometric features, high contrast, and sharp edges. Save as PNG/JPG.
2. Open MindAR's free official web compiler in your browser:  
   👉 **https://hiukim.github.io/mind-ar-js-doc/tools/compile**
3. Drop your image into the browser window.
4. Click **Start**. The compiler runs completely in your local browser and outputs a `targets.mind` file.
5. Place the exported `targets.mind` file into this directory (`assets/targets/targets.mind`).
6. Update line 15 in `src/app.js`:
   ```javascript
   imageTargetSrc: './assets/targets/targets.mind'
   ```
7. Print the image on paper or sticker sheet. Point your phone camera at it to test!
