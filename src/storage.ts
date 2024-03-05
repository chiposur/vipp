import { FileSystem, Folder, File, SerializedFolder, SerializedFile } from './fileSystem'

class NLevelChild {
  parentFolder: Folder
  serializedFolder: SerializedFolder
}

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
    if (serializedFolder) {
      const folder = this.createFolder(serializedFolder);
      return folder;
    }
    return null;
  }

  static createFolder(serializedFolder: SerializedFolder): Folder {
    const folder = new Folder(serializedFolder.name);
    let nLevelChildren = serializedFolder.children.map((c) => {
      const nLevelChild = new NLevelChild();
      nLevelChild.parentFolder = folder;
      nLevelChild.serializedFolder = c;
      return nLevelChild;
    });
    this.createFiles(folder, serializedFolder.files);
    while (nLevelChildren.length > 0) {
      const nextLevelChildren: Array<NLevelChild> = [];
      nLevelChildren.forEach((c) => {
        const newFolder = new Folder(c.serializedFolder.name);
        newFolder.setParent(c.parentFolder);
        c.parentFolder.addChildFolder(newFolder);
        this.createFiles(newFolder, c.serializedFolder.files);
        c.serializedFolder.children.forEach((sf) => {
          nextLevelChildren.push({
            parentFolder: newFolder,
            serializedFolder: sf,
           });
        });
      });
      nLevelChildren = nextLevelChildren;
    }
    return folder;
  }

  static createFiles(folder: Folder, serializedFiles: Array<SerializedFile>) {
    serializedFiles.forEach((f) => {
      const file = new File(f.name, "");
      file.setParent(folder);
      folder.addFile(file);
      const text = window.localStorage.getItem(file.getAbsolutePath());
      if (text) {
        file.setText(text);
      }
    });
  }
}

export { Storage };
