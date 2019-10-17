import {PptKind} from "white-react-sdk";
import uuidv4 from "uuid/v4";
// import {MultipartUploadResult} from "ali-oss";

// const timeout = (ms) => new Promise(res => setTimeout(res, ms));

export const PPTProgressPhase = {
  Uploading: 0,
  Converting: 1,
}

export class UploadManager {
  constructor(ossClient, room) {
    this.ossClient = ossClient;
    this.room = room;
  }

  createUUID = () => {
    const uuid = uuidv4();
    return uuid.replace(/-/g, "");
  }

  getFileType = (fileName) => {
    const index1 = fileName.lastIndexOf(".");
    const index2 = fileName.length;
    return fileName.substring(index1, index2);
  }

  convertFile = async (
    rawFile,
    pptConverter,
    kind,
    onProgress,
  ) => {
    const filename = this.createUUID();
    const fileType = this.getFileType(rawFile.name);
    const path = `/ppt/${filename}${fileType}`;
    const pptURL = await this.addFile(path, rawFile, onProgress);
    let res;
    if (kind === PptKind.Static) {
            res = await pptConverter.convert({
            url: pptURL,
            kind: kind,
            onProgressUpdated: progress => {
                if (onProgress) {
                    onProgress(PPTProgressPhase.Converting, progress);
                }
            },
        });
    } else {
        res = await pptConverter.convert({
            url: pptURL,
            kind: kind,
            onProgressUpdated: progress => {
                if (onProgress) {
                    onProgress(PPTProgressPhase.Converting, progress);
                }
            },
        });
    }

      if (onProgress) {
          onProgress(PPTProgressPhase.Converting, 1);
      }
    this.room.putScenes(`/${filename}`, res.scenes);
    this.room.setScenePath(`/${filename}/${res.scenes[0].name}`);
  }
  getImageSize(imageInnerSize) {
    const windowSize = {width: window.innerWidth, height: window.innerHeight};
    const widthHeightProportion = imageInnerSize.width / imageInnerSize.height;
    const maxSize = 960;
    if ((imageInnerSize.width > maxSize && windowSize.width > maxSize) || (imageInnerSize.height > maxSize && windowSize.height > maxSize)) {
      if (widthHeightProportion > 1) {
        return {
          width: maxSize,
          height: maxSize / widthHeightProportion,
        };
      } else {
        return {
          width: maxSize * widthHeightProportion,
          height: maxSize,
        };
      }
    } else {
      if (imageInnerSize.width > windowSize.width || imageInnerSize.height > windowSize.height) {
        if (widthHeightProportion > 1) {
          return {
            width: windowSize.width,
            height: windowSize.width / widthHeightProportion,
          };
        } else {
          return {
            width: windowSize.height * widthHeightProportion,
            height: windowSize.height,
          };
        }
      } else {
        return {
          width: imageInnerSize.width,
          height: imageInnerSize.height,
        };
      }
    }
  }
  uploadImageFiles = async (imageFiles, x, y, onProgress) => {
    const newAcceptedFilePromises = imageFiles.map(file => this.fetchWhiteImageFileWith(file, x, y));
    const newAcceptedFiles = await Promise.all(newAcceptedFilePromises);
    await this.uploadImageFilesArray(newAcceptedFiles, onProgress);
  }
  fetchWhiteImageFileWith(file, x, y) {
    return new Promise(resolve => {
      const image = new Image();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        image.src = reader.result;
        image.onload = async () => {
          const res = this.getImageSize(image);
          const imageFile = {
            width: res.width,
            height: res.height,
            file,
            coordinateX: x,
            coordinateY: y,
          };
          resolve(imageFile);
        };
      };
    });
  }
  uploadImageFilesArray = async (imageFiles, onProgress) => {
    if (imageFiles.length > 0) {

      const tasks = imageFiles.map(imageFile => {
        return {
          uuid: uuidv4(),
          imageFile: imageFile,
        };
      });

      for (const {uuid, imageFile} of tasks) {
        const {x, y} = this.room.convertToPointInWorld({x: imageFile.coordinateX, y: imageFile.coordinateY});
        this.room.insertImage({
          uuid: uuid,
          centerX: x,
          centerY: y,
          width: imageFile.width,
          height: imageFile.height,
        });
      }
      await Promise.all(tasks.map(task => this.handleUploadTask(task, onProgress)));
      this.room.setMemberState({
        currentApplianceName: "selector",
      });
    }
  }
  handleUploadTask = async (task, onProgress) => {
    const fileUrl = await this.addFile(`${task.uuid}${task.imageFile.file.name}`, task.imageFile.file, onProgress);
    this.room.completeImageUpload(task.uuid, fileUrl);
  }


  getFile = (name) => {
    return this.ossClient.generateObjectUrl(name);
  }
  addFile = async (path, rawFile, onProgress) => {
    const res = await this.ossClient.multipartUpload(
      path,
      rawFile,
      {
        progress: (p) => {
            if (onProgress) {
                onProgress(PPTProgressPhase.Uploading, p);
            }
        },
      });
    if (res.res.status === 200) {
      return this.getFile(path);
    } else {
      throw new Error(`upload to ali oss error, status is ${res.res.status}`);
    }
  }
}
