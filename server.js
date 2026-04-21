const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const os = require('os');

const app = express();
const port = 3000;

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

// INCREASE PAYLOAD LIMIT TO FIX "Payload Too Large" ERROR
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// API: Preview (Process Single Image)
app.post('/api/preview', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const { format = 'webp', quality = 80, rotation = 0 } = req.body;
        const q = parseInt(quality, 10) || 80;
        const rot = parseInt(rotation, 10) || 0;
        
        let outputBuffer;
        let finalFormat = format.toLowerCase();
        const inputBuffer = req.file.buffer;

        // Auto-fix EXIF rotation, then manual rotation
        let sharpInstance = sharp(inputBuffer).rotate();
        if (rot > 0) {
            sharpInstance = sharpInstance.rotate(rot);
        }

        // Apply Resize and sharpen AFTER rotation
        sharpInstance = sharpInstance.resize({
            width: 1920,
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: true
        });

        if (finalFormat === 'pdf') {
            outputBuffer = await sharpInstance.jpeg({ quality: q }).toBuffer();
            const pdfDoc = await PDFDocument.create();
            const jpgImage = await pdfDoc.embedJpg(outputBuffer);
            const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
            page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
            const pdfBytes = await pdfDoc.save();
            outputBuffer = Buffer.from(pdfBytes);
        } else if (finalFormat === 'jpg' || finalFormat === 'jpeg') {
            outputBuffer = await sharpInstance.jpeg({ quality: q }).toBuffer();
            finalFormat = 'jpg';
        } else if (finalFormat === 'png') {
            const compLevel = Math.floor(9 - (q / 100) * 9) || 9;
            outputBuffer = await sharpInstance.png({ compressionLevel: compLevel }).toBuffer();
        } else {
            outputBuffer = await sharpInstance.webp({ quality: q, effort: 4 }).toBuffer();
            finalFormat = 'webp';
        }

        // For original base64, we ALSO want it rotated so it visually aligns with compressed version
        let rotatedOrigSharp = sharp(inputBuffer).rotate();
        if (rot > 0) rotatedOrigSharp = rotatedOrigSharp.rotate(rot);
        const rotatedOrigBuffer = await rotatedOrigSharp.toBuffer();
        
        const originalBase64 = `data:${req.file.mimetype};base64,${rotatedOrigBuffer.toString('base64')}`;
        
        let previewBase64 = '';
        if (finalFormat === 'pdf') {
            // Must create a FRESH sharp instance — the original sharpInstance was already consumed above
            let previewSharp = sharp(inputBuffer).rotate();
            if (rot > 0) previewSharp = previewSharp.rotate(rot);
            const previewJpgBuffer = await previewSharp.resize(800).jpeg({ quality: q }).toBuffer();
            previewBase64 = `data:image/jpeg;base64,${previewJpgBuffer.toString('base64')}`;
        } else {
            const mimeType = finalFormat === 'jpg' ? 'image/jpeg' : `image/${finalFormat}`;
            previewBase64 = `data:${mimeType};base64,${outputBuffer.toString('base64')}`;
        }

        res.json({
            originalSize: inputBuffer.length,
            compressedSize: outputBuffer.length,
            originalBase64,
            previewBase64,
            finalFormat,
            rawCompressedBase64: outputBuffer.toString('base64')
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


app.listen(port, () => {
    console.log(`Image Optimizer Web App listening at http://localhost:${port}`);
});
