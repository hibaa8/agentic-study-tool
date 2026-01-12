const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Value of pdf:', pdf);
try {
    const fs = require('fs');
    // Create a dummy buffer
    const buffer = Buffer.from('dummy pdf content');
    // Don't actually parse, just check if function call throws "not a function"
    // (It will likely fail parsing, but that's a different error)
    pdf(buffer).catch(e => console.log('Promise rejected (expected):', e.message));
} catch (e) {
    console.log('Synchronous error:', e.message);
}
