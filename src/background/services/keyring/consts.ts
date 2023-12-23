export enum KeyringServiceError {
  UnsupportedExportAccount = "`KeyringController - The keyring for the current address does not support the method exportAccount",
  UnsupportedSignPersonalMessage = "KeyringController - The keyring for the current address does not support the method signPersonalMessage.",
}
