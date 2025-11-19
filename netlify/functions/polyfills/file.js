if (typeof globalThis.File === "undefined") {
  class File extends Blob {
    constructor(bits, name, options = {}) {
      super(bits, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
    }
  }
  globalThis.File = File;
}