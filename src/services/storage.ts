import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/lib/firebase";

export async function uploadProductImage({
  organizationId,
  productId,
  file,
}: {
  organizationId: string;
  productId: string;
  file: File;
}) {
  const extension =
    file.name.split(".").pop() ?? "jpg";

  const imageRef = ref(
    storage,
    `organizations/${organizationId}/products/${productId}.${extension}`
  );

  await uploadBytes(imageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(imageRef);
}
