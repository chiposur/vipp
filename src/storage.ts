import { FileSystem, Folder, File } from './fileSystem'

class Storage {
  static rootKey: string = "FILE_SYSTEM_ROOT";

  static saveFileSystem(root: Folder) {
    const serializedFolder = this.serializeFolder(root);
    window.localStorage.setItem(this.rootKey, serializedFolder);
  }

  static loadFileSystem(): FileSystem {
    const fs = new FileSystem();
    const serializedFolder = window.localStorage.getItem(this.rootKey);
    if (serializedFolder) {
      const deserializedFolder = this.deserializeFolder(serializedFolder);
      if (deserializedFolder) {
        fs.root = deserializedFolder;
      }
    }
    return fs;
  }

  static saveFileText(file: File) {
    window.localStorage.setItem(file.getAbsolutePath(), file.text);
  }

  static loadFileText(absolutePath: string): string {
    const text = window.localStorage.getItem(absolutePath);
    if (text) {
      return text;
    }
    return "";
  }

  static serializeFolder(folder: Folder): string {
    return JSON.stringify(folder);
  }

  static deserializeFolder(serializedFolder: string): Folder {
    const folder: Folder = JSON.parse(serializedFolder);
    return folder;
  }
}

export { Storage };