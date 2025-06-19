import multer, {FileFilterCallback} from "multer"
import path from "path"
import fs from 'fs'
import { Request } from "express"
import {v4 as uuid4} from "uuid"
import { unlink } from "fs/promises"
import { log } from "console"

const videoUploadPath: string = path.resolve(__dirname, "../../uploads")
if (!fs.existsSync(videoUploadPath)){
    fs.mkdirSync(videoUploadPath, {recursive: true})
}

const storage = multer.diskStorage({
    destination: videoUploadPath,
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const fileDetails = path.parse(file.originalname)
        const uniqueFilename = fileDetails.name + uuid4() + fileDetails.ext
        cb(null, uniqueFilename);
    }
});


export const uploadVideo = multer({
    storage: storage,
    limits: {
        fileSize: 100000000
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        checkFileType(file, cb);
    }
})


function checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
    const filetypes = /mp4|mov|avi|mkv|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        throw new Error("Error: Videos Only!")
    }
}

export const deleteUploadedFile = async (filePath: string) => {
    try {
        await unlink(filePath)
        log(`file at path ${filePath} deleted successfully`)
    } catch (error) {
        console.error("failed to delete file on path: ", filePath)
    }
}