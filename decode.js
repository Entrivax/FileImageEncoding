let selectedFile = null
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', submit)
    document.body.addEventListener('drop', (ev) => {
        ev.preventDefault()
        document.getElementById('drop-zone').classList.remove('show')
        if (event.dataTransfer.files.length === 1 && event.dataTransfer.files[0].type === 'image/png') {
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
    document.querySelector('#file-input').addEventListener('change', fileChanged)
})
function submit(event) {
    event.preventDefault()
    /** @type {HTMLInputElement} */
    let fileInput = document.getElementById('file-input')
    let passwordInput = document.getElementById('password-input')
    let password = passwordInput ? passwordInput.value : null
    if (selectedFile) {
        decode(selectedFile, (decodedData, fileName) => {
            saveAs(decodedData, fileName)
        }, password)
    }
    return false
}
document.addEventListener('paste', (event) => {
    if (event.clipboardData.files.length === 1 && event.clipboardData.files[0].type === 'image/png') {
        let passwordInput = document.getElementById('password-input')
        let password = passwordInput ? passwordInput.value : null
        decode(event.clipboardData.files[0], (decodedData, filename) => {
            saveAs(decodedData, filename)
        }, password)
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