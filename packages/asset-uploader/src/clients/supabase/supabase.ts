import { createClient } from "@supabase/supabase-js";
import type { AssetClient } from "../../client";
import { uploadToSupabase } from "./upload";

type SupabaseClientOptions = {
  supabaseUrl: string;
  supabaseKey: string;
  bucket: string;
  maxUploadSize: number;
};

export const createSupabaseClient = (
  options: SupabaseClientOptions
): AssetClient => {
  const supabase = createClient(options.supabaseUrl, options.supabaseKey);

  const uploadFile: AssetClient["uploadFile"] = async (
    name,
    type,
    data,
    assetInfoFallback
  ) => {
    return uploadToSupabase({
      supabase,
      name,
      type,
      data,
      maxSize: options.maxUploadSize,
      bucket: options.bucket,
      assetInfoFallback,
    });
  };

  return {
    uploadFile,
  };
};
