export class UserImage {
  filename = '';
  filetype = '';
  value = '';

  public toString = (): string => {
    return '\nfilename: ' + this.filename +
      '\nfiletype: ' + this.filetype +
      '\nvalue: ' + this.value;
  }
}
