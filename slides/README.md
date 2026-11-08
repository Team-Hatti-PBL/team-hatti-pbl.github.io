# Presentation Slides

Export your Canva presentation and place the slide images in this folder.

## How to export from Canva

1. Open your design in Canva.
2. Click **Share** → **Download**.
3. Choose **PNG** (or JPG) as the file type.
4. Under "Select pages", choose **All pages**, then download.

## Naming

Name the images sequentially so the website can detect them automatically:

```
slides/slide-1.png
slides/slide-2.png
slides/slide-3.png
...
```

`.jpg` / `.jpeg` are also supported. After adding or renaming slides, update
`slides/manifest.json` with the ordered list of filenames so the carousel
can show them immediately (without probing each file over the network).
