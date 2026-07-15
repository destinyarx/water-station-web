# Document storage acceptance

- A valid PDF/image upload creates active metadata with `original_name` and `file_path`, then appears without a reload.
- Missing, unsupported, and over-10-MiB files are rejected with a user-facing message.
- Another organization cannot read the metadata, storage object, or signed URL.
- Other staff cannot read an `only_me` document; its creator and organization owner can.
- Open file uses a short-lived signed URL from the private bucket.
- Upload failure leaves no active metadata row and no orphaned uploaded object.
- Loading, error, empty, no-result, and paginated-list states remain available.
