Cutout (background removed) for Ninnis photos

  photo-no-background.png
    From Desktop …/Ninnis/PHOTO-2026-05-10-15-17-00 11.jpg
    rembg: u2net_human_seg + alpha matting only (no extra color correction—those hurt quality).

  julies-dad-no-background.png
    Solo portrait of Julie’s dad (mustache, checkered shirt). Source:
    ninnis/julies-dad-source-portrait.png — rebuilt with rembg **isnet-general-use**,
    **alpha_matting off** (u2net_human_seg + matting mis-read the bright side of the
    face as background and punched holes in the head on this photo).

  julies-dad-preview-gray-bg.jpg
    Same cutout flattened on gray for clear Finder thumbnails.

  Rebuild photo-no-background (selfie):  python3 tools/rembg_ninnis_cutout.py
  Rebuild julies-dad cutout:             python3 tools/rembg_julies_dad_cutout.py

  Copy also synced to: Desktop/…/mejor-vida-html /Ninnis/photo-no-background.png
