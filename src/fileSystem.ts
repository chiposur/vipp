class FolderResult {
  exists: boolean
  folder: Folder
}

class FileSystem {
  root: Folder

  public constructor() {
    this.root = new Folder("~");
  }

  public isValidFoldername(name: string): boolean {
    const illegalChars = [
      '/',
      '\\',
      '?',
      '%',
      '*',
      ':',
      '|',
      '"',
      '<',
      '>',
      '.',
      ',',
      ';',
      '='
    ];
    const containsIllegalChar =
      illegalChars.filter((c) => name.indexOf(c) >= 0).length > 0;
    if (containsIllegalChar) {
      return false;
    }
    if (this.isReservedFoldername(name)) {
      return false;
    }
    return true;
  }

  private isReservedFoldername(name: string) {
    return name === "." || name === ".." || name === "~";
  }

  public resolveFolder(curr: Folder, path: string): FolderResult {
    let result = new FolderResult();
    if (this.isReservedFoldername(path)) {
      result.exists = true;
      result.folder = this.updateCurrentFolderFromReservedName(curr, path);
      return result;
    }
    const seqFolders = path.split('/');
    if (this.isSequentialFolderPathValid(seqFolders)) {
      result = this.resolveFolderByRelativePath(curr, seqFolders)
    }
    return result;
  }

  private isSequentialFolderPathValid(seqFolders: Array<string>): boolean {
    if (seqFolders.length === 0) {
      return false;
    }
    const firstFoldername = seqFolders[0];
    if (!this.isReservedFoldername(firstFoldername) && !this.isValidFoldername(firstFoldername)) {
      return false;
    }
    for (let i = 1; i < seqFolders.length; i += 1) {
      const name = seqFolders[i];
      if (!this.isValidFoldername(name)) {
        return false;
      }
    }
    return true;
  }

  private updateCurrentFolderFromReservedName(curr: Folder, reservedFoldername: string): Folder {
    if (reservedFoldername === "..") {
      curr = curr.parent;
    } else if (reservedFoldername === "~") {
      curr = this.root;
    }
    return curr;
  }

  private resolveFolderByRelativePath(curr: Folder, seqFolders: Array<string>): FolderResult {
    const result = new FolderResult();
    if (!curr || seqFolders.length === 0) {
      return result;
    }
    const firstFoldername = seqFolders[0];
    if (this.isReservedFoldername(firstFoldername)) {
      seqFolders = seqFolders.slice(1, seqFolders.length - 1);
      curr = this.updateCurrentFolderFromReservedName(curr, firstFoldername);
    }
    if (!curr) {
      return result;
    }
    let folder: Folder;
    let currIndex = 0;
    if (seqFolders.length === 0) {
      result.exists = true;
      result.folder = curr;
      return result;
    }
    while (currIndex < seqFolders.length) {
      const foundIndex = curr.children.findIndex(f => f.name === seqFolders[currIndex]);
      if (foundIndex > -1) {
        folder = curr.children[foundIndex];
        currIndex += 1;
      } else {
        return result;
      }
    }
    result.exists = true;
    result.folder = folder;
    return result;
  }
}

class SerializedFile {
  name: string
}

class File {
  name: string
  text: string
  parent: Folder

  public constructor(name: string, text: string) {
    this.name = name;
    this.text = text;
  }

  public setParent(parent: Folder) {
    this.parent = parent;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setText(text: string) {
    this.text = text;
  }

  public getAbsolutePath(): string {
    return `${this.parent.getFullName()}/${this.name}`;
  }

  public toJSON(): SerializedFile {
    return {
      name: this.name,
    };
  }
}

class SerializedFolder {
  children: Array<SerializedFolder>
  files: Array<SerializedFile>
  name: string
}

class Folder {
  parent: Folder
  children: Array<Folder>
  files: Array<File>
  name: string

  public constructor(name: string) {
    this.name = name;
    this.parent = null;
    this.children = [];
    this.files = [];
  }

  public containsFile(name: string): boolean {
    return this.files.findIndex((f) => f.name === name) > -1;
  }

  public containsFolder(name: string): boolean {
    return this.children.findIndex((f) => f.name === name) > -1;
  }

  public getName(): string {
    return this.name;
  }

  public getFullName(): string {
    let fullName = this.name;
    let parent = this.parent;
    while (parent) {
      fullName = `${parent.name}/${fullName}`;
      parent = parent.parent;
    }
    return fullName;
  }

  public setParent(parent: Folder) {
    this.parent = parent;
  }

  public setChildren(children: Array<Folder>) {
    this.children = children;
  }

  public addChildFolder(folder: Folder) {
    this.children.push(folder);
  }

  public addFile(file: File) {
    this.files.push(file);
  }

  public getFile(name: string): File {
    const index = this.files.findIndex((f) => f.name === name);
    if (index > -1) {
      return this.files[index];
    }
    return null;
  }

  public removeFile(name: string) {
    const index = this.files.findIndex((f) => f.name === name);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  public removeFolder(name: string) {
    const index = this.children.findIndex((f) => f.name === name);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  public toJSON(): SerializedFolder {
    return {
      children: this.children.map((c) => c.toJSON()),
      files: this.files.map((f) => f.toJSON()),
      name: this.name,
    };
  }
}

export { FileSystem, File, Folder, SerializedFolder, SerializedFile };
