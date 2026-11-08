# Data Retention

## Storage model

The application does not persist plaintext Aadhaar files on the application server. It decrypts in memory only, validates the file content and signature, and uploads the original document to the restricted Google Drive folder.

## Host-managed deletion

The authorized host can delete the wedding documents root folder after the hotel verification process is complete. This is the intended retention boundary for the temporary wedding workflow.

## Limitations

Third-party services may retain operational copies due to backups or service-level handling. The application avoids unnecessary duplication and does not create public or unmanaged document copies. It documents the reliance on the host-managed Google Drive folder lifecycle rather than claiming automatic erasure everywhere.
