import { FileSystem, Folder, File, SerializedFolder } from './fileSystem'

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

  static removeFileText(file: File) {
    window.localStorage.removeItem(file.getAbsolutePath());
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

  static deserializeFolder(serializedFolderJSON: string): Folder {
    const serializedFolder: SerializedFolder = JSON.parse(serializedFolderJSON);
    const folder = new Folder(serializedFolder.name);
    // TODO: fix function by transforming SerializedFolder result into nested Folder structure
    return folder;
  }
}

export { Storage };