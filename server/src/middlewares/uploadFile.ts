import multer, {FileFilterCallback} from "multer"
import path from "path"
import fs from 'fs'
import { Request } from "express"
import {v4 as uuid4} from "uuid"
import { unlink } from "fs/promises"
import { log } from "console"

const baseVideoUploadPath: string = path.resolve(__dirname, "../../uploads")
if (!fs.existsSync(baseVideoUploadPath)){
    fs.mkdirSync(baseVideoUploadPath, {recursive: true})
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueId = uuid4()
        const fileDetails = path.parse(file.originalname)
        const uniqueFolderName = path.join(baseVideoUploadPath, (fileDetails.name + uniqueId))
        if (!fs.existsSync(uniqueFolderName)){
            fs.mkdirSync(uniqueFolderName, {recursive: true})
        }
        (req as any).uniqueId = uniqueId
        cb(null, uniqueFolderName)
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueId = (req as any).uniqueId
        const fileDetails = path.parse(file.originalname)
        const uniqueFilename = fileDetails.name + uniqueId + fileDetails.ext
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
        const fileType = await fs.promises.lstat(filePath)
        if (fileType.isDirectory()){
            await fs.promises.rm(filePath, {recursive: true, force: true})
            log(`folder at path ${filePath} deleted successfully`)
        } else {
            await unlink(filePath)
            log(`file at path ${filePath} deleted successfully`)
        }
    } catch (error) {
        console.error("failed to delete file on path: ", filePath)
    }
}