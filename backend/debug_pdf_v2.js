const { PDFParse } = require('pdf-parse');

(async () => {
    try {
        const fs = require('fs');
        // Create a dummy PDF-like buffer? or just empty buffer might throw
        // Using a real PDF would be better but I can't easily make one.
        // Let's just check if it instantiates.
        const buffer = Buffer.from('dummy pdf content');

        console.log('PDFParse class:', PDFParse);

        /* 
         If I use dummy content, it might fail parsing, but that is fine. 
         I just want to ensure "PDFParse is not a constructor" doesn't happen 
         and "pdf is not a function" is gone.
        */

        const parser = new PDFParse({ data: buffer });
        console.log('Parser instantiated successfully');

        try {
            const result = await parser.getText();
            console.log('Text extracted:', result.text);
        } catch (e) {
            console.log('Extraction failed (expected for dummy content):', e.message);
        }

    } catch (e) {
        console.error('Error:', e);
    }
})();
