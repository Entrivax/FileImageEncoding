function encode (file, callback, filename, password) {
    let reader = new FileReader()
    reader.onload = () => {
        let uintArrayBuffer = new Uint8Array(reader.result)
        let fileNameArray = new TextEncoder().encode((filename ? filename : file.name))
        let array = new Uint8Array(uintArrayBuffer.length + fileNameArray.length + 4)
        array.set(fileNameArray, 4)
        let fileLengthArray = new ArrayBuffer(4)
        new Uint32Array(fileLengthArray)[0] = fileNameArray.length
        array.set(new Uint8Array(fileLengthArray), 0)
        array.set(uintArrayBuffer, 4 + fileNameArray.length)
        uintArrayBuffer = array
        if (password != null && password.trim() !== '') {
            wordArray = byteArrayToWordArray(uintArrayBuffer)
            uintArrayBuffer = new TextEncoder().encode(CryptoJS.AES.encrypt(wordArray, password))
        }
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        let bytesCount = uintArrayBuffer.length + 4
        let pixelsCount = Math.ceil(bytesCount / 3)
        let squareSideSize = Math.ceil(Math.sqrt(pixelsCount))
        canvas.width = squareSideSize
        canvas.height = squareSideSize
        let imageData = new ImageData(squareSideSize, squareSideSize)
        imageData.data[0] = (uintArrayBuffer.length & 0xFF000000) >> 24
        imageData.data[1] = (uintArrayBuffer.length & 0x00FF0000) >> 16
        imageData.data[2] = (uintArrayBuffer.length & 0x0000FF00) >> 8
        imageData.data[3] = 255
        imageData.data[4] = (uintArrayBuffer.length & 0x000000FF) >> 0
        imageData.data[7] = 255
        for (let i = 0; i < uintArrayBuffer.length; i++) {
            let pixelEditing = Math.trunc((i + 5) / 3)
            let pixelOffset = (i + 5) % 3
            imageData.data[pixelEditing * 4 + pixelOffset] = uintArrayBuffer[i]
            if (pixelOffset === 0) {
                imageData.data[pixelEditing * 4 + 3] = 255
            }
        }
        ctx.putImageData(imageData, 0, 0)
        canvas.toBlob((b) => {
            callback(b, (filename ? filename : file.name) + '.png')
        }, 'image/png')
    }
    reader.readAsArrayBuffer(file)
}

function decode (file, callback, password) {
    let reader = new FileReader()
    reader.onload = () => {
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        let image = new Image()
        image.onload = () => {
            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight
            ctx.drawImage(image, 0, 0)
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            let length = (imageData.data[0] << 24) | (imageData.data[1] << 16) | (imageData.data[2] << 8) | (imageData.data[4])
            let uintArrayBuffer = new Uint8Array(length)
            for (let i = 0; i < length; i++) {
                let pixelEditing = Math.trunc((i + 5) / 3)
                let pixelOffset = (i + 5) % 3
                uintArrayBuffer[i] = imageData.data[pixelEditing * 4 + pixelOffset]
            }
            if (password != null && password.trim() !== '') {
                let cipherParams = new TextDecoder().decode(uintArrayBuffer)
                uintArrayBuffer = wordArrayToByteArray(CryptoJS.AES.decrypt(cipherParams, password))
            }
            let fileNameLength = new Uint32Array(uintArrayBuffer.slice(0, 4))[0]
            let fileName = new TextDecoder().decode(uintArrayBuffer.slice(4, 4 + fileNameLength))
            callback(new Blob([uintArrayBuffer.slice(4 + fileNameLength)]), fileName)
        }
        image.src = reader.result
    }
    reader.readAsDataURL(file)
}

// https://gist.github.com/artjomb/7ef1ee574a411ba0dd1933c1ef4690d1
function byteArrayToWordArray(ba) {
    var wa = [],
        i;
    for (i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i);
    }

    return CryptoJS.lib.WordArray.create(wa, ba.length);
}

function wordToByteArray(word, length) {
    var ba = [],
        i,
        xFF = 0xFF;
    if (length > 0)
        ba.push(word >>> 24);
    if (length > 1)
        ba.push((word >>> 16) & xFF);
    if (length > 2)
        ba.push((word >>> 8) & xFF);
    if (length > 3)
        ba.push(word & xFF);

    return ba;
}

function wordArrayToByteArray(wordArray, length) {
    if (wordArray.hasOwnProperty("sigBytes") && wordArray.hasOwnProperty("words")) {
        length = wordArray.sigBytes;
        wordArray = wordArray.words;
    }

    var result = [],
        bytes,
        i = 0;
    while (length > 0) {
        bytes = wordToByteArray(wordArray[i], Math.min(4, length));
        length -= bytes.length;
        result.push(bytes);
        i++;
    }
    return new Uint8Array(result.flat());
}