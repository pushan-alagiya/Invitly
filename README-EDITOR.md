# Wedding Invitation Editor

A comprehensive Canva-style template editor specifically designed for creating beautiful wedding invitation PDFs. Built with Next.js, React, and Fabric.js.

## 🎨 Features

### Core Editor Features

- **Canvas Rendering**: High-quality canvas with Fabric.js
- **Multiple Canvas Sizes**: Support for various invitation formats (Portrait, Square, Landscape)
- **Real-time Preview**: See changes instantly as you design
- **Responsive Design**: Works on desktop and tablet devices

### Text Editing

- **Rich Text Support**: Add, edit, and style text elements
- **Font Library**: 14+ fonts including wedding-specific fonts (Dancing Script, Great Vibes, Playfair Display)
- **Text Styling**: Bold, italic, underline, font size, color picker
- **Text Alignment**: Left, center, right, justify alignment
- **Advanced Typography**: Letter spacing, line height, opacity
- **Wedding Text Templates**: Pre-written wedding invitation text snippets

### Image Management

- **Upload Images**: Support for JPG, PNG, SVG files
- **URL Import**: Load images directly from URLs
- **Stock Image Library**: Curated collection of wedding-themed images
- **Image Manipulation**: Resize, rotate, crop, and reposition
- **Image Effects**: Brightness, contrast, opacity adjustments
- **Quick Filters**: Grayscale, sepia, blur, vintage effects

### Shapes and Graphics

- **Basic Shapes**: Rectangle, circle, triangle, ellipse, line
- **Wedding Shapes**: Heart, diamond, star, flower icons
- **Shape Styling**: Fill color, stroke color, stroke width
- **Advanced Properties**: Border radius, shadows, opacity
- **Vector Support**: SVG file import and editing

### Layer Management

- **Layer Panel**: Visual layer hierarchy like Photoshop
- **Layer Controls**: Show/hide, lock/unlock layers
- **Layer Ordering**: Bring forward, send backward
- **Layer Actions**: Duplicate, delete, rename layers
- **Layer Properties**: View position, size, opacity of each layer

### Background Customization

- **Solid Colors**: Full color picker for backgrounds
- **Background Images**: Set images as canvas backgrounds
- **Gradient Support**: Linear and radial gradients
- **Pattern Overlays**: Wedding-themed background patterns

### Template System

- **Template Gallery**: Pre-designed wedding invitation templates
- **Template Categories**: Classic, Modern, Vintage, Minimal, Elegant
- **Template Preview**: See templates before applying
- **Custom Templates**: Create and save your own templates
- **Template Import**: Load templates from files

### Export Options

- **PDF Export**: High-quality PDF generation with pdf-lib
- **PNG Export**: High-resolution PNG images
- **Multiple Formats**: Support for various export formats
- **Print-Ready**: Optimized for professional printing

### Advanced Features

- **Undo/Redo**: Full history management
- **Keyboard Shortcuts**: Professional editing shortcuts
- **Grid System**: Snap-to-grid functionality
- **Alignment Guides**: Visual guides for precise positioning
- **Zoom Controls**: Zoom in/out with mouse wheel and buttons
- **Save/Load**: Save designs to localStorage or backend
- **Auto-save**: Automatic saving of work in progress

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Next.js 14+

### Installation

1. **Install Dependencies**

```bash
npm install fabric pdf-lib lucide-react
```

2. **Add Fonts** (Optional)
   Add Google Fonts to your `layout.tsx`:

```tsx
import {
  Playfair_Display,
  Dancing_Script,
  Great_Vibes,
} from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });
const dancing = Dancing_Script({ subsets: ["latin"] });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"] });
```

3. **Setup Canvas**
   The editor is ready to use at:

```
/app/(common)/projects/[id]/events/[event_id]/template-creator/page.tsx
```

## 📁 Project Structure

```
components/
├── editor/
│   ├── TextEditor.tsx          # Text editing component
│   ├── ShapeEditor.tsx         # Shape tools and styling
│   ├── ImageEditor.tsx         # Image upload and manipulation
│   ├── LayerPanel.tsx          # Layer management interface
│   ├── TemplateGallery.tsx     # Template selection gallery
│   └── EditorToolbar.tsx       # Main toolbar with actions
app/
└── (common)/projects/[id]/events/[event_id]/template-creator/
    └── page.tsx                # Main editor page
```

## 🎯 Usage Guide

### Creating a New Invitation

1. **Choose Template**

   - Select from the template gallery
   - Choose canvas size (800x1000, 1000x1000, etc.)
   - Start with a blank canvas or pre-designed template

2. **Add Text**

   - Click "Add Text" button
   - Use wedding text templates for common phrases
   - Customize font, size, color, and alignment

3. **Add Images**

   - Upload your own photos
   - Use stock images from the library
   - Import images from URLs

4. **Add Shapes**

   - Insert decorative shapes
   - Use wedding-themed icons
   - Style with colors and effects

5. **Organize Layers**

   - Use the layer panel to manage elements
   - Reorder layers for proper stacking
   - Lock layers to prevent accidental changes

6. **Export**
   - Export as PDF for printing
   - Save as PNG for digital sharing
   - Save design for future editing

### Keyboard Shortcuts

| Shortcut | Action             |
| -------- | ------------------ |
| `Ctrl+Z` | Undo               |
| `Ctrl+Y` | Redo               |
| `Ctrl+D` | Duplicate selected |
| `Delete` | Delete selected    |
| `Ctrl+S` | Save design        |
| `Ctrl+A` | Select all         |
| `G`      | Toggle grid        |
| `Ctrl+=` | Zoom in            |
| `Ctrl+-` | Zoom out           |
| `Ctrl+0` | Reset zoom         |

### Best Practices

1. **Design Workflow**

   - Start with a template or blank canvas
   - Add background first
   - Layer text and images
   - Use alignment guides for precision
   - Save frequently

2. **Text Tips**

   - Use 2-3 fonts maximum per design
   - Ensure good contrast for readability
   - Use wedding-specific fonts for elegance
   - Keep text hierarchy clear

3. **Image Guidelines**

   - Use high-resolution images (300 DPI for print)
   - Maintain aspect ratios when resizing
   - Use stock images for professional look
   - Apply filters sparingly

4. **Export Settings**
   - Use PDF for printing (vector quality)
   - Use PNG for digital sharing
   - Set appropriate resolution (300 DPI for print)
   - Include bleed area for professional printing

## 🔧 Customization

### Adding New Fonts

1. Add font files to `/public/fonts/`
2. Update the fonts array in `TextEditor.tsx`
3. Add font-face declarations in CSS

### Custom Templates

1. Create template JSON files
2. Add to template gallery
3. Include preview images

### Custom Shapes

1. Add SVG files to `/public/shapes/`
2. Update shapes array in `ShapeEditor.tsx`
3. Implement shape rendering logic

## 🐛 Troubleshooting

### Common Issues

1. **Canvas Not Loading**

   - Check Fabric.js installation
   - Verify canvas element exists
   - Check browser console for errors

2. **Images Not Uploading**

   - Check file size limits
   - Verify supported formats
   - Check network connectivity

3. **PDF Export Failing**

   - Ensure pdf-lib is installed
   - Check canvas size limits
   - Verify image formats

4. **Performance Issues**
   - Reduce canvas size
   - Limit number of objects
   - Use optimized images

### Performance Optimization

1. **Canvas Size**

   - Use appropriate canvas dimensions
   - Avoid extremely large canvases
   - Consider mobile performance

2. **Image Optimization**

   - Compress images before upload
   - Use appropriate formats (PNG for graphics, JPG for photos)
   - Limit image resolution for web use

3. **Object Management**
   - Group related objects
   - Delete unused layers
   - Use efficient rendering settings

## 📱 Mobile Support

The editor is optimized for desktop use but includes responsive features:

- Touch-friendly controls
- Adaptive toolbar layout
- Mobile-optimized canvas size
- Touch gesture support

## 🔒 Security Considerations

1. **File Upload**

   - Validate file types
   - Limit file sizes
   - Sanitize file names
   - Use secure upload endpoints

2. **Data Storage**
   - Encrypt sensitive data
   - Use secure localStorage
   - Implement proper authentication
   - Validate user permissions

## 🚀 Future Enhancements

### Planned Features

- [ ] Multi-page support
- [ ] Advanced drawing tools
- [ ] Collaboration features
- [ ] Real-time sharing
- [ ] Advanced filters and effects
- [ ] Mobile app version
- [ ] Cloud storage integration
- [ ] Print service integration

### Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review troubleshooting guide
- Contact the development team

---

**Happy Designing! 🎨💒**
