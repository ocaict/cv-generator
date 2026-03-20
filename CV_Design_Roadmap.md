# 🎨 CV Templates & Design Roadmap

This roadmap outlines the evolution of the CV Generator's visual system, moving from static templates to a dynamic, customizable design engine.

## 🌈 Phase 1: Dynamic Theming (CSS Variables)
- [x] **Color Customization**: Add a Primary Color picker in the Editor sidebar.
- [x] **Variable Injection**: Refactor `pdf-view.ejs` to use `--primary-color` instead of hardcoded `indigo-600`.
- [x] **Live Theme Preview**: Ensure the editor preview updates colors instantly when the user picks a new one.

## 📁 Phase 2: Template Architecture Refactor
- [x] **Modular Sections**: Break down CV sections (Header, Experience, Skills) into reusable EJS partials or clean blocks.
- [ ] **Layout Library**: 
    - [x] **The "Executive"**: A clean, single-column, center-aligned template. (Implemented as "Classic")
    - [x] **The "Minimalist"**: High white-space, very clean lines, no sidebar.
    - [x] **The "Grid"**: Unique 2-column layout for technical/skill-heavy CVs.
- [x] **Template Metadata**: Store "modern", "classic", "executive", etc., in the database.

## 🖋️ Phase 3: Advanced Typography & Spacing
- [x] **Font Pairing Selector**: Offer curated font sets (e.g., "Sleek", "Academic", "Bold").
- [x] **Spacing Control**: A slider or toggle for "Compact" vs "Spacious" layouts.
- [x] **Section Reordering**: Allow users to drag-and-drop sections (e.g., Education above Experience).

## 🖼️ Phase 4: Layout Toggles
- [x] **Sidebar Orientation**: Switch sidebar from Left to Right.
- [x] **Profile Photo Styles**: Toggle between Square, Rounded, or Hidden.
- [x] **Section Icons**: Toggle between modern SVG icons or clean text headers.

## 🏁 Phase 5: The "Template Marketplace" UI
- [x] **Template Browser**: A visual gallery where users can see a thumbnail of each template before selecting.
- [x] **Preset Designs**: One-click "Full Designs" (e.g., "The Startup Guru", "The Wall St Banker").

## 🧠 Phase 6: Professional Intelligence & Multitenancy
- [x] **AI Bullet Generation**: Integrated Groq (Llama 3.3) to suggest high-impact STAR-method bullet points, professional summaries, and skill lists with "Undo AI" support.
- [ ] **User Authentication**: Implement secure sign-in (Firebase/Passport) to allow users to save multiple CVs.
- [ ] **Multi-Format Export**: Support one-click "Export to DOCX" (Word) alongside PDF.
- [ ] **CV Dashboard**: A user home for managing version control (e.g., "Resume v1 - Senior Dev", "Resume v2 - Project Lead").
- [ ] **Dark Mode Theme**: Add a sleek "Onyx" dark mode variant for all existing layouts.

