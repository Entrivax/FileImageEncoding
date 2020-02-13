let selectedFile = null
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#encode-file').addEventListener('submit', submit)
    document.body.addEventListener('drop', (ev) => {
        ev.preventDefault()
        document.getElementById('drop-zone').classList.remove('show')
        if (event.dataTransfer.files.length === 1) {
            selectFile(event.dataTransfer.files[0])
        }
    })
    document.body.addEventListener('dragover', (ev) => {
        ev.preventDefault()
        document.getElementById('drop-zone').classList.add('show')
    })
    document.body.addEventListener('dragleave', (ev) => {
        ev.preventDefault()
        document.getElementById('drop-zone').classList.remove('show')
    })
    document.querySelector('#encode-text').addEventListener('submit', submitText)
    document.querySelector('#file-input').addEventListener('change', fileChanged)
})
function submit (event) {
    event.preventDefault()
    let passwordInput = document.getElementById('password-input')
    let password = passwordInput ? passwordInput.value : null
    if (selectedFile) {
        encode(selectedFile, (encodedData, fileName) => {
            saveAs(encodedData, fileName)
        }, null, password)
    }
    return false
}

function submitText (event) {
    event.preventDefault()
    /** @type {HTMLTextAreaElement} */
    let textInput = document.getElementById('text-input')
    let passwordInput = document.getElementById('password-text-input')
    let filenameInput = document.getElementById('file-name-input')
    let password = passwordInput && passwordInput.value ? passwordInput.value : null
    let filename = filenameInput && filenameInput.value && filenameInput.value.trim() !== '' ? filenameInput.value : 'untitled.txt'
    encode(new Blob([textInput.value]), (encodedData, fileName) => {
        saveAs(encodedData, fileName)
    }, filename, password)
    return false
}
document.addEventListener('paste', (event) => {
    if (event.clipboardData.files.length === 1) {
        let passwordInput = document.getElementById('password-input')
        let password = passwordInput ? passwordInput.value : null
        encode(event.clipboardData.files[0], (encodedData, filename) => {
            saveAs(encodedData, filename)
        }, null, password)
    }
})

/**
 * @param {File} file 
 */
function selectFile(file) {
    selectedFile = file
    let label = document.querySelector('.custom-file label[for=file-input]')
    label.innerText = file ? file.name : 'Choose file'
}

function fileChanged(event) {
    let file = event.target.files[0]
    selectFile(file)
}