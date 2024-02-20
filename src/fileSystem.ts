class FileSystem {
  root: Folder

  public constructor() {
    this.root = new Folder("~");
  }
}

class File {
  name: string
  text: string

  public constructor(name: string, text: string) {
    this.name = name;
    this.text = text;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setText(text: string) {
    this.text = text;
  }
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

  public getName(): string {
    return this.name;
  }

  public getFullName(): string {
    let fullName = this.name;
    let parent = this.parent;
    while (parent) {
      fullName = `${parent.name}\\${fullName}`;
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
}

export { FileSystem, File, Folder };