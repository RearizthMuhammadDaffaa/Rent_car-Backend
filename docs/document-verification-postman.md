# Document Verification API

All endpoints require a JWT in the `Authorization` header:

```text
Authorization: Bearer <JWT>
```

## Submit or re-upload documents

`POST http://localhost:5001/api/v1/documents/me`

Authorization: customer JWT. Use `form-data` with these file fields:

| Key | Type | Value |
| --- | --- | --- |
| `ktp` | File | KTP image (`jpg`, `png`, or `webp`) |
| `sim` | File | SIM image (`jpg`, `png`, or `webp`) |

Re-uploading replaces the user's documents and resets the status to `PENDING`.

## View own documents

`GET http://localhost:5001/api/v1/documents/me`

The authenticated user can only see their own document record.

## Delete own documents

`DELETE http://localhost:5001/api/v1/documents/me`

## List documents for review

`GET http://localhost:5001/api/v1/documents/`

Authorization: admin JWT (`ADMIN` or `SUPERADMIN`).

## Approve or reject a document

`PATCH http://localhost:5001/api/v1/documents/<DOCUMENT_ID>/status`

Authorization: admin JWT. Use raw JSON:

```json
{
  "status": "APPROVED"
}
```

or:

```json
{
  "status": "REJECTED"
}
```

Only an `APPROVED` document allows the owner to create a booking. A `REJECTED` document can be submitted again through the upload endpoint.