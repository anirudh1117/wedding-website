# Drive Access Control

## Intended configuration

The wedding root folder should remain owned by the authorized host account and accessible only to the human host plus the technically authorized Google service identity. Guests do not receive Drive access.

## Supported arrangement

- Root folder under the host account.
- Restricted permissions only.
- No `anyone` or public links.
- No public previews.
- No public sharing or folder duplication.
- Family folders created under the wedding root.

## Important caveat

The service-account model can create folders and upload files, but it does not automatically guarantee that the resulting files are owned by the target human account unless the deployment is explicitly configured to use a supported, restricted Drive arrangement. This application assumes a restricted, host-managed Google Drive configuration and documents the supported model rather than silently changing permissions.
