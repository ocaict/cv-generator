# 🎨 CV Templates & Design Roadmap

This roadmap outlines the evolution of the CV Generator's visual system, moving from static templates to a dynamic, customizable design engine.

## 🌈 Phase 1: Dynamic Theming (CSS Variables)
- [ ] **Color Customization**: Add a Primary Color picker in the Editor sidebar.
- [ ] **Variable Injection**: Refactor [pdf-view.ejs](file:///c:/Users/oluegwuc/Desktop/projects/nodejs/cv_generator/views/cv-editor/pdf-view.ejs) to use `--primary-color` instead of hardcoded `indigo-600`.
- [ ] **Live Theme Preview**: Ensure the editor preview updates colors instantly when the user picks a new one.

## 📁 Phase 2: Template Architecture Refactor
- [ ] **Modular Sections**: Break down CV sections (Header, Experience, Skills) into reusable EJS partials or clean blocks.
- [ ] **Layout Library**: 
    - [ ] **The "Executive"**: A clean, single-column, center-aligned template.
    - [ ] **The "Minimalist"**: High white-space, very clean lines, no sidebar.
    - [ ] **The "Grid"**: Unique 2-column layout for technical/skill-heavy CVs.
- [ ] **Template Metadata**: Store "modern", "classic", "executive", etc., in the database.

## 🖋️ Phase 3: Advanced Typography & Spacing
- [ ] **Font Pairing Selector**: Offer curated font sets (e.g., "Sleek", "Academic", "Bold").
- [ ] **Spacing Control**: A slider or toggle for "Compact" vs "Spacious" layouts.
- [ ] **Section Reordering**: Allow users to drag-and-drop sections (e.g., Education above Experience).

## 🖼️ Phase 4: Layout Toggles
- [ ] **Sidebar Orientation**: Switch sidebar from Left to Right.
- [ ] **Profile Photo Styles**: Toggle between Square, Rounded, or Hidden.
- [ ] **Section Icons**: Toggle between modern SVG icons or clean text headers.

## 🏁 Phase 5: The "Template Marketplace" UI
- [ ] **Template Browser**: A visual gallery where users can see a thumbnail of each template before selecting.
- [ ] **Preset Designs**: One-click "Full Designs" (e.g., "The Startup Guru", "The Wall St Banker").
