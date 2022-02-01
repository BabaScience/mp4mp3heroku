const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')

const app = express()
app.use(express.static('public'))
const PORT = process.env.PORT || 3000


var dir = 'public'
var subdir = 'public/uploads'


if(!fs.existsSync(dir)){
    fs.mkdirSync(dir)
    fs.mkdirSync(subdir)
}

var storage = multer.diskStorage({
    destination:  function(req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }

})

var upload = multer({
    storage: storage
})

app.get('/', (req, res) => {
    res.sendFile(__dirname +  '/home.html')
})

app.post('/convert', upload.single('file'),(req, res) => {
    if(req.file){
        console.log(req.file.path)
        var output = `OUTPUT-${Date.now()}.mp3`

        exec(`ffmpeg -i ${req.file.path} ${output}`, (error, stdout, strerr) => {
            if(error) {
                console.log( `error: ${error.message}`)
            }
            else {
                console.log("file is converted")
                res.download(output, err => {
                    if (err) {
                        throw err
                    }
                    fs.unlinkSync(req.file.path)
                    fs.unlinkSync(output)
                })
            }
        })
    }
})

app.listen(PORT, () => {
    console.log(`App listening on Port ${PORT}`)
})