/*
 * faf-image.js — shrink phone photos in the browser before they are uploaded.
 *
 * window.fafShrinkImage(file, opts) -> Promise<File>
 *   - Photos are scaled so the longest side is at most opts.maxDim (default 1600px)
 *     and saved as JPEG at opts.quality (default 0.82) — visually the same on screen,
 *     typically 5-10x smaller than a straight phone photo.
 *   - Orientation from the phone (EXIF) is applied, so photos are never sideways.
 *   - Transparent PNGs are flattened onto white.
 *   - If anything goes wrong, the file is not an image we can decode (HEIC on some
 *     browsers, PDFs, ...), or the result would not be smaller, the ORIGINAL file is
 *     returned unchanged. It never blocks an upload.
 */
(function () {
  window.fafShrinkImage = async function fafShrinkImage(file, opts) {
    try {
      opts = opts || {};
      var maxDim = opts.maxDim || 1600;
      var quality = opts.quality || 0.82;
      var skipUnder = opts.skipUnder || 400 * 1024; // already small enough: leave as is
      if (!file || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type || "")) return file;

      var bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      var scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
      if (scale === 1 && file.size < skipUnder) { if (bmp.close) bmp.close(); return file; }

      var w = Math.max(1, Math.round(bmp.width * scale));
      var h = Math.max(1, Math.round(bmp.height * scale));
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();

      var blob = await new Promise(function (res) { canvas.toBlob(res, "image/jpeg", quality); });
      if (!blob || blob.size >= file.size) return file;

      var name = (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg";
      return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
    } catch (e) {
      return file;
    }
  };
})();
