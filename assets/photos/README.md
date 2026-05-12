# Photo Assets

Drop your `.jpg`, `.png`, or `.webp` files into the appropriate sub-folder and then add their **filenames** (not full paths) to `photos.json`.

## Folder structure

```
assets/photos/
├── bloom/       → Circular photo bubbles around the flower in Scene 2
├── timeline/    → Thumbnail images inside each timeline card in Scene 3
├── gift/        → Polaroid-style reveal cards after the gift opens in Scene 4
├── letter/      → Dreamy backdrop bubbles behind the love letter in Scene 5
├── gallery/     → Tiles for the dedicated photo-gallery scene
├── photos.json  → Manifest that lists filenames per category
└── README.md    → This file
```

## Example `photos.json`

```json
{
  "bloom": ["rose1.jpg", "sunset.webp"],
  "timeline": ["morning.jpg", "cafe.png", "lunch.jpg", "adventure.webp", "dinner.jpg"],
  "gift": ["gift1.jpg", "gift2.png"],
  "letter": ["memory1.jpg", "memory2.webp"],
  "gallery": ["photo1.jpg", "photo2.jpg", "photo3.png"]
}
```

The website will read this file on load. If the file is missing or a category is empty the site still renders normally — photos are optional enhancements.
