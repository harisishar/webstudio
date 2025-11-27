import { arrayBuffer } from "node:stream/consumers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type AssetData, getAssetData } from "../../utils/get-asset-data";
import { createSizeLimiter } from "../../utils/size-limiter";

export const uploadToSupabase = async ({
  supabase,
  name,
  type,
  data: dataStream,
  maxSize,
  bucket,
  assetInfoFallback,
}: {
  supabase: SupabaseClient;
  name: string;
  type: string;
  data: AsyncIterable<Uint8Array>;
  maxSize: number;
  bucket: string;
  assetInfoFallback:
    | { width: number; height: number; format: string }
    | undefined;
}): Promise<AssetData> => {
  const limitSize = createSizeLimiter(maxSize, name);

  // Convert stream to buffer (same pattern as S3 client)
  const data = await arrayBuffer(limitSize(dataStream));

  // Upload to Supabase Storage
  const { error } = await supabase.storage.from(bucket).upload(name, data, {
    contentType: type,
    cacheControl: "public, max-age=31536004, immutable",
    upsert: true,
  });

  if (error) {
    throw Error(`Cannot upload file ${name}: ${error.message}`);
  }

  if (type.startsWith("video") && assetInfoFallback !== undefined) {
    return {
      size: data.byteLength,
      format: assetInfoFallback?.format,
      meta: {
        width: assetInfoFallback?.width ?? 0,
        height: assetInfoFallback?.height ?? 0,
      },
    };
  }

  const assetData = await getAssetData({
    type: type.startsWith("image") ? "image" : "font",
    size: data.byteLength,
    data: new Uint8Array(data),
    name,
  });

  return assetData;
};
