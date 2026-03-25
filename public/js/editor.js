const experienceList = document.getElementById('experience-list');
const educationList = document.getElementById('education-list');
const hobbiesList = document.getElementById('hobbies-list');
const referencesList = document.getElementById('references-list');
const addExperienceBtn = document.getElementById('add-experience');
const addEducationBtn = document.getElementById('add-education');
const addHobbyBtn = document.getElementById('add-hobby');
const addReferenceBtn = document.getElementById('add-reference');
const refOnRequestCheckbox = document.getElementById('references-on-request');
const editorForm = document.getElementById('editor-form');
const saveBtn = document.getElementById('save-btn');
const cvTitle = document.getElementById('cv-title');
const previewContent = document.getElementById('preview-content');
const splitPreviewFrame = document.getElementById('split-preview-frame');
const splitPreviewContent = document.getElementById('split-preview-content');
const viewNormalBtn = document.getElementById('view-normal-btn');
const viewSplitBtn = document.getElementById('view-split-btn');
const previewViewport = document.getElementById('preview-viewport');
const zoomInBtn = document.getElementById('preview-zoom-in');
const zoomOutBtn = document.getElementById('preview-zoom-out');
const zoomLevelText = document.getElementById('zoom-level');

let isSplitView = false;
let currentZoom = 1;
let originalCvDataSnapshot = null;

const templateGalleryModal = document.getElementById('template-gallery-modal');
const templateGalleryPanel = document.getElementById('template-gallery-panel');
const templateGalleryBackdrop = document.getElementById('template-gallery-backdrop');
const templateGalleryClose = document.getElementById('template-gallery-close');
const browseTemplatesBtn = document.getElementById('browse-templates-btn');
const galleryGrid = document.getElementById('gallery-grid');

// --- CV Title Edits ---
if (cvTitle) {
    cvTitle.addEventListener('input', () => {
        triggerAutoSave();
    });
    
    // Prevent new lines in title
    cvTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            cvTitle.blur();
        }
    });
}
const toggleBtn = document.getElementById('toggle-additional-info');
const additionalPanel = document.getElementById('additional-info-panel');
const toggleIcon = document.getElementById('toggle-icon');
const saveStatusText = document.getElementById('save-status-text');
const saveStatusIndicator = document.getElementById('save-status-indicator');
const exportBtn = document.getElementById('export-btn');
const exportDocxBtn = document.getElementById('export-docx-btn');

let autoSaveTimeout;

const preFillBtn = document.getElementById('pre-fill-btn');
if (preFillBtn) {
    preFillBtn.addEventListener('click', () => {
        if (confirm('This will replace your current data with sample content. Continue?')) {
            fillSampleData();
        }
    });
}

function syncDataToInputs() {
    const data = cvData;
    if (!data) return;

    // 1. Fill Personal Info Inputs
    if (data.personalInfo) {
        Object.keys(data.personalInfo).forEach(key => {
            const input = document.querySelector(`[name="personalInfo.${key}"]`);
            if (input) input.value = data.personalInfo[key] || '';
        });
        
        // Set Summary Quill correctly by ID
        const summaryEditor = document.getElementById('summary-editor');
        if (summaryEditor) {
            const quill = Quill.find(summaryEditor);
            if (quill) {
                quill.root.innerHTML = data.personalInfo.summary || '';
            } else {
                summaryEditor.innerHTML = data.personalInfo.summary || '';
            }
        }
        const summaryHidden = document.querySelector('[name="personalInfo.summary"]');
        if (summaryHidden) summaryHidden.value = data.personalInfo.summary || '';
    }

    // 2. Fill Skills
    if (data.skills) {
        Object.keys(data.skills).forEach(key => {
            const input = document.querySelector(`[name="skills.${key}"]`);
            if (input) input.value = Array.isArray(data.skills[key]) ? data.skills[key].join(', ') : (data.skills[key] || '');
        });
    }

    // 3. Clear and Fill Lists
    experienceList.innerHTML = '';
    (data.experience || []).forEach(exp => addExperienceItem(exp));

    educationList.innerHTML = '';
    (data.education || []).forEach(edu => addEducationItem(edu));

    hobbiesList.innerHTML = '';
    (data.hobbies || []).forEach(hobby => addHobbyItem(typeof hobby === 'string' ? hobby : hobby.name));

    referencesList.innerHTML = '';
    (data.references || []).forEach(ref => addReferenceItem(ref));

    if (refOnRequestCheckbox) {
        refOnRequestCheckbox.checked = data.referencesOnRequest || false;
    }

    // 4. Update Design Controls
    const templateRadio = document.querySelector(`input[name="templateId"][value="${data.templateId || 'modern'}"]`);
    if (templateRadio) templateRadio.checked = true;

    const themeColor = data.themeColor || '#4f46e5';
    const colorRadio = document.querySelector(`input[name="themeColor"][value="${themeColor}"]`);
    if (colorRadio) {
        colorRadio.checked = true;
    } else {
        const customPicker = document.getElementById('custom-color-picker');
        if (customPicker) customPicker.value = themeColor;
    }

    const fontSelect = document.querySelector('select[name="fontPairing"]');
    if (fontSelect) fontSelect.value = data.fontPairing || 'outfit-inter';

    const densitySelect = document.querySelector('select[name="density"]');
    if (densitySelect) densitySelect.value = data.density || 'standard';

    // 5. Final Refresh
    updatePreview();
}

function fillSampleData() {
    const sample = {
        personalInfo: {
            firstName: "Alex",
            lastName: "Rivers",
            email: "alex.rivers@example.com",
            phone: "+1 (555) 000-1122",
            address: "123 Innovation Drive",
            city: "San Francisco",
            zipCode: "94103",
            jobTitle: "Senior Cloud Architect",
            summary: "<p>Strategic Cloud Architect with 12+ years of experience in designing and scaling distributed systems. Proven track record of reducing infrastructure costs by 40% while improving system reliability. Expert in Kubernetes, AWS, and serverless architectures.</p>"
        },
        experience: [
            {
                jobTitle: "Senior Cloud Architect",
                company: "Global Tech Solutions",
                startMonth: "Jan",
                startYear: "2020",
                isPresent: true,
                responsibilities: "<ul><li>Led the migration of 200+ microservices to a multi-region Kubernetes cluster.</li><li>Architected an AI-driven monitoring system that reduced mean-time-to-recovery (MTTR) by 60%.</li><li>Mentored a team of 15 engineers in cloud-native best practices.</li></ul>"
            },
            {
                jobTitle: "Lead Full Stack Developer",
                company: "Innovate AI",
                startMonth: "Mar",
                startYear: "2016",
                startYear: "2016",
                endMonth: "Dec",
                endYear: "2019",
                responsibilities: "<ul><li>Developed a real-time data processing engine using Node.js and Redis.</li><li>Implemented CI/CD pipelines that reduced deployment time from 2 hours to 10 minutes.</li><li>Spearheaded the redesign of the core product dashboard using React and GraphQL.</li></ul>"
            }
        ],
        education: [
            {
                degree: "M.S. in Computer Science",
                school: "Stanford University",
                year: "2015",
                description: "<p>Specialization in Distributed Systems and Artificial Intelligence. Recipient of the Academic Excellence Award.</p>"
            }
        ],
        skills: {
            technical: ["AWS", "Kubernetes", "Docker", "Terraform", "Node.js", "Python", "React", "GraphQL", "Redis", "PostgreSQL"],
            soft: ["Strategic Leadership", "Cross-functional Collaboration", "Public Speaking", "Problem Solving", "Agile Mentoring"]
        },
        hobbies: ["Mountain Biking", "Open Source"],
        references: [
            { name: "Sarah Chen", position: "CTO at Global Tech", company: "Global Tech Labs", contact: "sarah.chen@example.com" }
        ],
        referencesOnRequest: false,
        themeColor: "#4f46e5",
        fontPairing: "outfit-inter",
        density: "airy",
        templateId: "modern"
    };

    // 1. Update global cvData
    Object.assign(cvData, sample);

    // 2. Sync UI
    syncDataToInputs();
    triggerAutoSave();
    
    // Notify user
    alert('✨ Sample data loaded successfully!');
}

function updateSaveStatus(status) {
    if (!saveStatusText || !saveStatusIndicator) return;
    
    if (status === 'saving') {
        saveStatusIndicator.className = 'w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse';
        saveStatusText.innerText = 'Saving...';
    } else if (status === 'saved') {
        saveStatusIndicator.className = 'w-1.5 h-1.5 rounded-full bg-green-500';
        saveStatusText.innerText = 'Saved';
    } else if (status === 'error') {
        saveStatusIndicator.className = 'w-1.5 h-1.5 rounded-full bg-red-500';
        saveStatusText.innerText = 'Error';
    } else if (status === 'unsaved') {
        saveStatusIndicator.className = 'w-1.5 h-1.5 rounded-full bg-orange-300';
        saveStatusText.innerText = 'Unsaved';
    }
}

// Multi-step Navigation State
let currentStep = 1;
const stepBtns = document.querySelectorAll('.step-btn');
const formSteps = document.querySelectorAll('.step-form');
const nextBtns = document.querySelectorAll('.next-step-btn');
const prevBtns = document.querySelectorAll('.prev-step-btn');
const tabContentBtn = document.getElementById('tab-content-btn');
const tabDesignBtn = document.getElementById('tab-design-btn');
const contentStepper = document.getElementById('content-stepper');

if (tabContentBtn && tabDesignBtn) {
    tabContentBtn.addEventListener('click', () => switchToTab('content'));
    tabDesignBtn.addEventListener('click', () => switchToTab('design'));
}

const goToDesignBtn = document.getElementById('go-to-design-btn');
if (goToDesignBtn) {
    goToDesignBtn.addEventListener('click', () => switchToTab('design'));
}

const returnToContentBtn = document.getElementById('return-to-content-btn');
if (returnToContentBtn) {
    returnToContentBtn.addEventListener('click', () => switchToTab('content'));
}

function switchToTab(tab) {
    if (tab === 'content') {
        tabContentBtn.className = 'flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 transition-all';
        tabDesignBtn.className = 'flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all';
        contentStepper.classList.remove('hidden');
        goToStep(currentStep); // Resume last content step
    } else {
        tabDesignBtn.className = 'flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 transition-all';
        tabContentBtn.className = 'flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all';
        contentStepper.classList.add('hidden');
        
        // Hide all steps, show only Design (6)
        formSteps.forEach(section => section.classList.add('hidden'));
        document.getElementById('step-form-6').classList.remove('hidden');
    }
}

function goToStep(step) {
    currentStep = parseInt(step);
    
    if (currentStep === 6) {
        switchToTab('design');
        return;
    }
    
    // Update Stepper UI
    stepBtns.forEach(btn => {
        const btnStep = parseInt(btn.dataset.step);
        const icon = btn.querySelector('div');
        const text = btn.querySelector('span');
        
        if (btnStep === currentStep) {
            btn.classList.add('active');
            icon.className = 'w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-100 transition-all';
            text.className = 'text-[10px] font-bold text-indigo-600 mt-2 block uppercase tracking-widest text-center';
        } else if (btnStep < currentStep) {
            btn.classList.remove('active');
            icon.className = 'w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-green-100 transition-all';
            text.className = 'text-[10px] font-bold text-green-500 mt-2 block uppercase tracking-widest text-center';
            icon.innerHTML = '✓';
        } else {
            btn.classList.remove('active');
            icon.className = 'w-10 h-10 rounded-xl bg-white border-2 border-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm transition-all';
            text.className = 'text-[10px] font-bold text-gray-400 mt-2 block uppercase tracking-widest text-center';
            icon.innerHTML = btnStep;
        }
    });
    
    // Show/Hide Form Sections
    formSteps.forEach(section => {
        if (parseInt(section.id.replace('step-form-', '')) === currentStep) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

nextBtns.forEach(btn => btn.addEventListener('click', () => goToStep(btn.dataset.next)));
prevBtns.forEach(btn => btn.addEventListener('click', () => goToStep(btn.dataset.prev)));
stepBtns.forEach(btn => btn.addEventListener('click', () => goToStep(btn.dataset.step)));

function applyPreset(presetName) {
    const presets = {
        'startup': {
            templateId: 'modern',
            themeColor: '#10b981', // Emerald/Teal
            fontPairing: 'outfit-inter',
            density: 'airy'
        },
        'executive': {
            templateId: 'classic',
            themeColor: '#475569', // Slate
            fontPairing: 'serif-inter',
            density: 'standard'
        },
        'creative': {
            templateId: 'grid',
            themeColor: '#f43f5e', // Rose
            fontPairing: 'outfit-inter',
            density: 'airy'
        },
        'executive_sidebar': {
            templateId: 'executive_sidebar',
            themeColor: '#1e293b', // Navy Slate
            fontPairing: 'outfit-inter',
            density: 'standard'
        },
        'centered': {
            templateId: 'centered_modern',
            themeColor: '#4f46e5', // Indigo
            fontPairing: 'serif-inter',
            density: 'airy'
        },
        'asymmetric': {
            templateId: 'asymmetric',
            themeColor: '#475569', // Slate
            fontPairing: 'outfit-inter',
            density: 'standard'
        },
        'banner': {
            templateId: 'creative_banner',
            themeColor: '#4f46e5', // Indigo
            fontPairing: 'outfit-inter',
            density: 'airy'
        }
    };

    const config = presets[presetName];
    if (!config) return;

    // Apply values to DOM
    // 1. Template ID
    const templateRadio = document.querySelector(`input[name="templateId"][value="${config.templateId}"]`);
    if (templateRadio) templateRadio.checked = true;

    // 2. Theme Color (both picker and radio)
    const colorRadio = document.querySelector(`input[name="themeColor"][value="${config.themeColor}"]`);
    if (colorRadio) {
        colorRadio.checked = true;
    } else {
        const customPicker = document.getElementById('custom-color-picker');
        if (customPicker) customPicker.value = config.themeColor;
    }

    // 3. Font Pairing
    const fontSelect = document.querySelector('select[name="fontPairing"]');
    if (fontSelect) fontSelect.value = config.fontPairing;

    // 4. Density
    const densitySelect = document.querySelector('select[name="density"]');
    if (densitySelect) densitySelect.value = config.density;

    // Trigger updates
    updatePreview();
    triggerAutoSave();
    
    // Smooth scroll to preview top
    const previewContainer = document.querySelector('.sticky-preview');
    if (previewContainer) {
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Live update listener
editorForm.addEventListener('input', () => updatePreview());

// Date Helpers
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '<option value="">Year</option>';
    for (let i = currentYear; i >= currentYear - 50; i--) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}
function getMonthOptions() {
    let options = '<option value="">Month</option>';
    months.forEach((m, i) => {
        options += `<option value="${m}">${m}</option>`;
    });
    return options;
}

// Initialize with existing data
function addExperienceItem(data = {}) {
    const item = document.createElement('div');
    item.className = 'experience-item bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group my-4 draggable';
    item.draggable = true;
    item.innerHTML = `
        <div class="accordion-header flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-white transition-all">
            <div class="flex items-center space-x-3">
                <div class="drag-handle p-1 text-gray-300 hover:text-indigo-600 cursor-move mr-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zM7 9a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zM7 16a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
                </div>
                <div class="accordion-arrow w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
                    <svg class="w-4 h-4 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-gray-900 item-title">${data.jobTitle || 'New Position'}</h4>
                    <div class="flex items-center space-x-2">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest item-subtitle">${data.company || 'Company Name'}</p>
                        <span class="status-badge px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${data.jobTitle && data.company ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}">${data.jobTitle && data.company ? 'Complete' : 'Draft'}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-1">
                <button type="button" class="duplicate-item text-gray-300 hover:text-indigo-500 transition-all p-2" title="Duplicate">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                </button>
                <button type="button" class="remove-item text-gray-300 hover:text-red-500 transition-all p-2" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
        <div class="accordion-content p-6 border-t border-gray-50 hidden grid grid-cols-2 gap-4">
            <div class="col-span-2 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Job Title</label>
                <input type="text" data-key="jobTitle" value="${data.jobTitle || ''}" placeholder="e.g. Senior Product Designer" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
            <div class="col-span-2 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Employer / Company</label>
                <input type="text" data-key="company" value="${data.company || ''}" placeholder="e.g. Apple Inc." class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
            
            <!-- Start Date -->
            <div class="col-span-1 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Start Date</label>
                <div class="grid grid-cols-2 gap-2">
                    <select data-key="startMonth" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">${getMonthOptions()}</select>
                    <select data-key="startYear" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">${getYearOptions()}</select>
                </div>
            </div>

            <!-- End Date -->
            <div class="col-span-1 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">End Date</label>
                <div class="grid grid-cols-2 gap-2 end-date-group">
                    <select data-key="endMonth" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">${getMonthOptions()}</select>
                    <select data-key="endYear" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">${getYearOptions()}</select>
                </div>
            </div>

            <div class="col-span-2 text-left flex items-center space-x-2 mt-1">
                <input type="checkbox" data-key="isPresent" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" ${data.isPresent ? 'checked' : ''}>
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">I currently work here</label>
            </div>

            <div class="col-span-2 text-left mt-2">
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsibilities</label>
                    <button type="button" class="ai-gen-btn text-[9px] font-bold text-indigo-600 uppercase tracking-tighter hover:scale-105 transition-all flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 rounded-full" data-type="experience">
                        <span>✨ AI Refine</span>
                    </button>
                </div>
                <div class="quill-editor h-32 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-inner text-sm"></div>
                <input type="hidden" data-key="responsibilities" value="${data.responsibilities || ''}">
            </div>
        </div>
    `;
    experienceList.appendChild(item);

    // Initialize Quill for Responsibilities
    const quillEl = item.querySelector('.quill-editor');
    const hiddenInput = item.querySelector('[data-key="responsibilities"]');
    const quill = new Quill(quillEl, {
        theme: 'snow',
        modules: {
            toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'bullet' }], ['clean']]
        }
    });

    if (data.responsibilities) {
        quill.root.innerHTML = data.responsibilities;
    }

    quill.on('text-change', () => {
        hiddenInput.value = quill.root.innerHTML;
        updatePreview();
    });

    // Accordion Logic
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const arrow = item.querySelector('svg');
    const titleText = item.querySelector('.item-title');
    const subtitleText = item.querySelector('.item-subtitle');

    header.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) return;
        const isHidden = content.classList.toggle('hidden');
        arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        header.classList.toggle('bg-gray-50');
    });

    // Handle Present Checkbox
    const isPresent = item.querySelector('[data-key="isPresent"]');
    const endDateGroup = item.querySelector('.end-date-group');
    
    isPresent.addEventListener('change', () => {
        const selects = endDateGroup.querySelectorAll('select');
        selects.forEach(s => s.disabled = isPresent.checked);
        if (isPresent.checked) {
            selects.forEach(s => s.value = '');
        }
        updatePreview();
    });

    // Populate existing values if any
    if (data.startMonth) item.querySelector('[data-key="startMonth"]').value = data.startMonth;
    if (data.startYear) item.querySelector('[data-key="startYear"]').value = data.startYear;
    if (data.endMonth) item.querySelector('[data-key="endMonth"]').value = data.endMonth;
    if (data.endYear) item.querySelector('[data-key="endYear"]').value = data.endYear;
    if (data.isPresent) {
        endDateGroup.querySelectorAll('select').forEach(s => s.disabled = true);
    }

    item.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', (e) => {
            if (e.target.dataset.key === 'jobTitle') titleText.innerText = e.target.value || 'New Position';
            if (e.target.dataset.key === 'company') subtitleText.innerText = (e.target.value || 'Company Name').toUpperCase();
            
            // Update Status Badge
            const jt = item.querySelector('[data-key="jobTitle"]').value;
            const comp = item.querySelector('[data-key="company"]').value;
            const badge = item.querySelector('.status-badge');
            if (jt && comp) {
                badge.className = 'status-badge px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-green-100 text-green-700';
                badge.innerText = 'Complete';
            } else {
                badge.className = 'status-badge px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-gray-100 text-gray-400';
                badge.innerText = 'Draft';
            }
            updatePreview();
        });
    });

    item.querySelector('.duplicate-item').addEventListener('click', () => {
        const currentData = {
            jobTitle: item.querySelector('[data-key="jobTitle"]').value,
            company: item.querySelector('[data-key="company"]').value,
            startMonth: item.querySelector('[data-key="startMonth"]').value,
            startYear: item.querySelector('[data-key="startYear"]').value,
            endMonth: item.querySelector('[data-key="endMonth"]').value,
            endYear: item.querySelector('[data-key="endYear"]').value,
            isPresent: item.querySelector('[data-key="isPresent"]').checked,
            responsibilities: item.querySelector('[data-key="responsibilities"]').value
        };
        addExperienceItem(currentData);
        updatePreview();
    });

    // Native Drag and Drop Logic
    item.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('drag-handle') && !e.target.closest('.drag-handle')) {
            // Only allow dragging via handle
            if (!e.target.closest('.drag-handle')) {
                e.preventDefault();
                return;
            }
        }
        item.classList.add('opacity-40');
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('opacity-40');
        item.classList.remove('dragging');
        updatePreview();
    });

    experienceList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem) return;
        const siblings = [...experienceList.querySelectorAll('.experience-item:not(.dragging)')];
        const nextSibling = siblings.find(sibling => e.clientY <= sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2);
        experienceList.insertBefore(draggingItem, nextSibling);
    });

    item.querySelector('.remove-item').addEventListener('click', () => {
        item.remove();
        updatePreview();
    });
}

function addEducationItem(data = {}) {
    const item = document.createElement('div');
    item.className = 'education-item bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group my-4 draggable';
    item.draggable = true;
    item.innerHTML = `
        <div class="accordion-header flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-white transition-all">
            <div class="flex items-center space-x-3">
                <div class="drag-handle p-1 text-gray-300 hover:text-indigo-600 cursor-move mr-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zM7 9a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zM7 16a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
                </div>
                <div class="accordion-arrow w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
                    <svg class="w-4 h-4 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-gray-900 item-title">${data.degree || 'New Degree'}</h4>
                    <div class="flex items-center space-x-2">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest item-subtitle">${data.school || 'University Name'}</p>
                        <span class="status-badge px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${data.degree && data.school ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}">${data.degree && data.school ? 'Complete' : 'Draft'}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-1">
                <button type="button" class="duplicate-item text-gray-300 hover:text-indigo-500 transition-all p-2" title="Duplicate">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                </button>
                <button type="button" class="remove-item text-gray-300 hover:text-red-500 transition-all p-2" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
        <div class="accordion-content p-6 border-t border-gray-50 hidden grid grid-cols-2 gap-4">
            <div class="col-span-2 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Degree / Certificate</label>
                <input type="text" data-key="degree" value="${data.degree || ''}" placeholder="e.g. BS in Design" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
            <div class="col-span-2 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">School / University</label>
                <input type="text" data-key="school" value="${data.school || ''}" placeholder="e.g. Stanford University" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
            <div class="col-span-2 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Graduation Year</label>
                <div class="grid grid-cols-2 gap-2">
                    <select data-key="endMonth" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">${getMonthOptions()}</select>
                    <select data-key="endYear" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">${getYearOptions()}</select>
                </div>
            </div>
            <div class="col-span-2 text-left mt-2">
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description / Achievements</label>
                    <button type="button" class="ai-gen-btn text-[9px] font-bold text-indigo-600 uppercase tracking-tighter hover:scale-105 transition-all flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 rounded-full" data-type="education">
                        <span>✨ AI Refine</span>
                    </button>
                </div>
                <!-- Mini Quill Editor for Education -->
                <div class="quill-editor bg-gray-50 border border-gray-100 rounded-xl text-xs h-32 mb-2 overflow-hidden"></div>
                <input type="hidden" data-key="description" value="${data.description || ''}">
            </div>
        </div>
    `;
    educationList.appendChild(item);
    
    // Initialize Quill for Education Achievements
    const quillEl = item.querySelector('.quill-editor');
    const hiddenInput = item.querySelector('[data-key="description"]');
    const quill = new Quill(quillEl, {
        theme: 'snow',
        modules: {
            toolbar: [['bold', 'italic'], [{ 'list': 'bullet' }], ['clean']]
        }
    });

    if (data.description) {
        quill.root.innerHTML = data.description;
    }

    quill.on('text-change', () => {
        hiddenInput.value = quill.root.innerHTML;
        updatePreview();
    });

    // Accordion Logic
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const arrow = item.querySelector('.accordion-arrow svg');
    const titleText = item.querySelector('.item-title');
    const subtitleText = item.querySelector('.item-subtitle');

    header.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item') || e.target.closest('.duplicate-item') || e.target.closest('.drag-handle')) return;
        const isHidden = content.classList.toggle('hidden');
        arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        header.classList.toggle('bg-gray-50');
    });

    // Populate existing values
    if (data.endMonth) item.querySelector('[data-key="endMonth"]').value = data.endMonth;
    if (data.endYear) item.querySelector('[data-key="endYear"]').value = data.endYear;

    item.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', (e) => {
            if (e.target.dataset.key === 'degree') titleText.innerText = e.target.value || 'New Degree';
            if (e.target.dataset.key === 'school') subtitleText.innerText = (e.target.value || 'University Name').toUpperCase();
            
            // Update Status Badge
            const deg = item.querySelector('[data-key="degree"]').value;
            const sch = item.querySelector('[data-key="school"]').value;
            const badge = item.querySelector('.status-badge');
            if (deg && sch) {
                badge.className = 'status-badge px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-green-100 text-green-700';
                badge.innerText = 'Complete';
            } else {
                badge.className = 'status-badge px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-gray-100 text-gray-400';
                badge.innerText = 'Draft';
            }
            updatePreview();
        });
    });

    item.querySelector('.duplicate-item').addEventListener('click', () => {
        const currentData = {
            degree: item.querySelector('[data-key="degree"]').value,
            school: item.querySelector('[data-key="school"]').value,
            endMonth: item.querySelector('[data-key="endMonth"]').value,
            endYear: item.querySelector('[data-key="endYear"]').value,
            description: item.querySelector('[data-key="description"]')?.value || ''
        };
        addEducationItem(currentData);
        updatePreview();
    });

    // Native Drag and Drop Logic
    item.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('drag-handle') && !e.target.closest('.drag-handle')) {
            if (!e.target.closest('.drag-handle')) {
                e.preventDefault();
                return;
            }
        }
        item.classList.add('opacity-40');
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging-edu');
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('opacity-40');
        item.classList.remove('dragging-edu');
        updatePreview();
    });

    educationList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging-edu');
        if (!draggingItem) return;
        const siblings = [...educationList.querySelectorAll('.education-item:not(.dragging-edu)')];
        const nextSibling = siblings.find(sibling => e.clientY <= sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2);
        educationList.insertBefore(draggingItem, nextSibling);
    });

    item.querySelector('.remove-item').addEventListener('click', () => {
        item.remove();
        updatePreview();
    });
}

addExperienceBtn.addEventListener('click', () => addExperienceItem());
addEducationBtn.addEventListener('click', () => addEducationItem());

function addHobbyItem(data = "") {
    const item = document.createElement('div');
    item.className = 'hobby-item group flex items-center space-x-3 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all';
    item.innerHTML = `
        <div class="flex-grow">
            <input type="text" data-key="hobby" value="${data}" placeholder="e.g. Photography" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
        </div>
        <button type="button" class="remove-item text-gray-300 hover:text-red-500 transition-all p-2 opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    `;
    hobbiesList.appendChild(item);
    
    item.querySelector('input').addEventListener('input', () => updatePreview());
    item.querySelector('.remove-item').addEventListener('click', () => {
        item.remove();
        updatePreview();
    });
}

function addReferenceItem(data = {}) {
    const item = document.createElement('div');
    item.className = 'reference-item bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group mb-4';
    item.innerHTML = `
        <div class="accordion-header flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-white transition-all">
            <div class="flex items-center space-x-3">
                <div class="accordion-arrow w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
                    <svg class="w-4 h-4 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-gray-900 item-title">${data.name || 'New Reference'}</h4>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest item-subtitle">${data.company || 'Company'}</p>
                </div>
            </div>
            <button type="button" class="remove-item text-gray-300 hover:text-red-500 transition-all p-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
        <div class="accordion-content p-6 border-t border-gray-50 hidden grid grid-cols-2 gap-4">
            <div class="col-span-2 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Full Name</label>
                <input type="text" data-key="name" value="${data.name || ''}" placeholder="e.g. Jane Smith" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
            <div class="col-span-2 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Company</label>
                <input type="text" data-key="company" value="${data.company || ''}" placeholder="e.g. Google" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
            <div class="col-span-1 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Phone</label>
                <input type="text" data-key="phone" value="${data.phone || ''}" placeholder="e.g. +1 555..." class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
            <div class="col-span-1 text-left">
                <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Email</label>
                <input type="email" data-key="email" value="${data.email || ''}" placeholder="e.g. jane@company.com" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs outline-none">
            </div>
        </div>
    `;
    referencesList.appendChild(item);

    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const arrow = item.querySelector('.accordion-arrow svg');
    const titleText = item.querySelector('.item-title');
    const subtitleText = item.querySelector('.item-subtitle');

    header.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) return;
        const isHidden = content.classList.toggle('hidden');
        arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        header.classList.toggle('bg-gray-50');
    });

    item.querySelectorAll('input').forEach(el => {
        el.addEventListener('input', (e) => {
            if (e.target.dataset.key === 'name') titleText.innerText = e.target.value || 'New Reference';
            if (e.target.dataset.key === 'company') subtitleText.innerText = (e.target.value || 'Company').toUpperCase();
            updatePreview();
        });
    });

    item.querySelector('.remove-item').addEventListener('click', () => {
        item.remove();
        updatePreview();
    });
}

function updatePreview() {
    const formData = new FormData(editorForm);
    
    // Collect experience
    const experienceData = Array.from(document.querySelectorAll('.experience-item')).map(item => {
        const startMonth = item.querySelector('[data-key="startMonth"]').value;
        const startYear = item.querySelector('[data-key="startYear"]').value;
        const endMonth = item.querySelector('[data-key="endMonth"]').value;
        const endYear = item.querySelector('[data-key="endYear"]').value;
        const isPresent = item.querySelector('[data-key="isPresent"]').checked;
        
        // Format duration for preview
        let duration = "";
        if (startMonth || startYear) duration += `${startMonth} ${startYear}`.trim();
        if (duration && (isPresent || endMonth || endYear)) duration += " — ";
        if (isPresent) {
            duration += "Present";
        } else if (endMonth || endYear) {
            duration += `${endMonth} ${endYear}`.trim();
        }

        return {
            company: item.querySelector('[data-key="company"]').value,
            jobTitle: item.querySelector('[data-key="jobTitle"]').value,
            startMonth, startYear, endMonth, endYear, isPresent,
            duration, // combined for preview
            responsibilities: item.querySelector('[data-key="responsibilities"]').value
        };
    });
    
    // Collect education
    const educationData = Array.from(document.querySelectorAll('.education-item')).map(item => {
        const endMonth = item.querySelector('[data-key="endMonth"]').value;
        const endYear = item.querySelector('[data-key="endYear"]').value;
        
        return {
            school: item.querySelector('[data-key="school"]').value,
            degree: item.querySelector('[data-key="degree"]').value,
            description: item.querySelector('[data-key="description"]')?.value || '',
            endMonth, endYear,
            year: `${endMonth} ${endYear}`.trim() // combined for preview
        };
    });

    const data = {
        templateId: formData.get('templateId') || (typeof TEMPLATE_ID !== 'undefined' ? TEMPLATE_ID : 'modern'),
        region: formData.get('region') || 'us', 
        themeColor: formData.get('themeColor') || formData.get('themeColorCustom') || '#4f46e5',
        fontPairing: formData.get('fontPairing') || 'outfit-inter',
        density: formData.get('density') || 'standard',
        personalInfo: { 
            // Explicitly map nested form data (personalInfo.xxx)
            firstName: formData.get('personalInfo.firstName'),
            lastName: formData.get('personalInfo.lastName'),
            jobTitle: formData.get('personalInfo.jobTitle'),
            headline: formData.get('personalInfo.headline'),
            email: formData.get('personalInfo.email'),
            phone: formData.get('personalInfo.phone'),
            address: formData.get('personalInfo.address'),
            city: formData.get('personalInfo.city'),
            zipCode: formData.get('personalInfo.zipCode'),
            dobDay: formData.get('personalInfo.dobDay'),
            dobMonth: formData.get('personalInfo.dobMonth'),
            dobYear: formData.get('personalInfo.dobYear'),
            dateOfBirth: [formData.get('personalInfo.dobMonth'), formData.get('personalInfo.dobDay'), formData.get('personalInfo.dobYear')].filter(x => x).join(' '),
            nationality: formData.get('personalInfo.nationality'),
            maritalStatus: formData.get('personalInfo.maritalStatus'),
            drivingLicense: formData.get('personalInfo.drivingLicense'),
            linkedin: formData.get('personalInfo.linkedin'),
            website: formData.get('personalInfo.website'),
            summary: summaryEditor ? summaryEditor.root.innerHTML : formData.get('personalInfo.summary'),
            // Preserve the photo from the existing cvData object if it exists
            photo: (typeof cvData !== 'undefined' && cvData.personalInfo) ? cvData.personalInfo.photo : null
        },
        aiTone: formData.get('aiTone') || 'Professional',
        education: educationData,
        experience: experienceData,
        hobbies: Array.from(document.querySelectorAll('.hobby-item')).map(item => item.querySelector('[data-key="hobby"]').value).filter(x => x),
        references: Array.from(document.querySelectorAll('.reference-item')).map(item => ({
            name: item.querySelector('[data-key="name"]').value,
            company: item.querySelector('[data-key="company"]').value,
            phone: item.querySelector('[data-key="phone"]').value,
            email: item.querySelector('[data-key="email"]').value
        })).filter(r => r.name),
        referencesOnRequest: refOnRequestCheckbox ? refOnRequestCheckbox.checked : false,
        sidebarPos: formData.get('sidebarPos') || 'left',
        sidebarStyle: formData.get('sidebarStyle') || 'minimal',
        photoStyle: formData.get('photoStyle') || 'rounded',
        showHeaderIcons: formData.get('showHeaderIcons') || 'text',
        skills: { 
            technical: (formData.get('skills.technical') || '').split(',').map(s => s.trim()).filter(s => s),
            soft: (formData.get('skills.soft') || '').split(',').map(s => s.trim()).filter(s => s)
        },
        sectionVisibility: {
            profile: document.querySelector('input[name="sectionVisibility.profile"]')?.checked ?? true,
            experience: document.querySelector('input[name="sectionVisibility.experience"]')?.checked ?? true,
            education: document.querySelector('input[name="sectionVisibility.education"]')?.checked ?? true,
            skills: document.querySelector('input[name="sectionVisibility.skills"]')?.checked ?? true,
            interests: document.querySelector('input[name="sectionVisibility.interests"]')?.checked ?? true,
            references: document.querySelector('input[name="sectionVisibility.references"]')?.checked ?? true
        }
    };
    
    Object.assign(cvData, data);
    renderPreview(cvData);

    if (isSplitView && originalCvDataSnapshot) {
        renderSplitPreview(originalCvDataSnapshot);
    }

    calculateProfileStrength(); 
    triggerAutoSave();
}

function renderSplitPreview(data) {
    if (!splitPreviewContent) return;
    
    const fullName = `${data.personalInfo.firstName || ''} ${data.personalInfo.lastName || ''}`.trim() || 'Original Profile';
    const locationStr = [data.personalInfo.address, data.personalInfo.city].filter(x => x).join(', ');
    
    // We reuse the styling from the main preview but render into the split content
    const templateId = data.templateId || 'modern';
    let html = '';
    
    if (templateId === 'modern' || templateId === 'onyx') html = renderModernTemplate(data, fullName, locationStr);
    else if (templateId === 'classic') html = renderClassicTemplate(data, fullName, locationStr);
    else if (templateId === 'grid') html = renderGridTemplate(data, fullName, locationStr);
    else if (templateId === 'minimalist') html = renderMinimalistTemplate(data, fullName, locationStr);
    else if (templateId === 'executive_sidebar') html = renderExecutiveSidebarTemplate(data, fullName, locationStr);
    else if (templateId === 'centered_modern') html = renderCenteredModernTemplate(data, fullName, locationStr);
    else if (templateId === 'asymmetric') html = renderAsymmetricGridTemplate(data, fullName, locationStr);
    else if (templateId === 'creative_banner') html = renderCreativeBannerTemplate(data, fullName, locationStr);
    else if (templateId === 'standard_professional') html = renderStandardProfessionalTemplate(data, fullName, locationStr);
    
    splitPreviewContent.innerHTML = html;
}

// --- Preview Viewport Controls ---
if (viewSplitBtn) {
    viewSplitBtn.addEventListener('click', () => {
        isSplitView = true;
        // Take a snapshot of current data if we don't have one, or use it for comparison
        if (!originalCvDataSnapshot) {
            originalCvDataSnapshot = JSON.parse(JSON.stringify(cvData));
        }
        
        previewViewport.classList.remove('justify-center');
        previewViewport.classList.add('justify-start', 'px-8', 'space-x-8');
        
        splitPreviewFrame.classList.remove('hidden');
        setTimeout(() => {
            splitPreviewFrame.classList.remove('opacity-0', '-translate-x-10');
            splitPreviewFrame.classList.add('opacity-100', 'translate-x-0');
        }, 10);
        
        viewSplitBtn.className = 'px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-indigo-600 text-white shadow-sm transition-all flex items-center space-x-1.5';
        viewNormalBtn.className = 'px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-all';
        
        updatePreview();
    });
}

if (viewNormalBtn) {
    viewNormalBtn.addEventListener('click', () => {
        isSplitView = false;
        previewViewport.classList.add('justify-center');
        previewViewport.classList.remove('justify-start', 'px-8', 'space-x-8');
        
        splitPreviewFrame.classList.add('opacity-0', '-translate-x-10');
        setTimeout(() => splitPreviewFrame.classList.add('hidden'), 500);
        
        viewNormalBtn.className = 'px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all';
        viewSplitBtn.className = 'px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-all flex items-center space-x-1.5';
    });
}

if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < 1.5) {
            currentZoom += 0.1;
            applyZoom();
        }
    });
}

if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > 0.5) {
            currentZoom -= 0.1;
            applyZoom();
        }
    });
}

function applyZoom() {
    const frame = document.getElementById('preview-frame');
    const sFrame = document.getElementById('split-preview-frame');
    
    if (frame) frame.style.transform = `scale(${currentZoom})`;
    if (sFrame) sFrame.style.transform = `scale(${currentZoom})`;
    if (zoomLevelText) zoomLevelText.innerText = Math.round(currentZoom * 100) + '%';
}

// --- Template Gallery Logic ---
const PREMIUM_TEMPLATES = [
    { id: 'modern', name: 'The Modernist', type: 'Professional', desc: 'Recruiter favorite for 2024' },
    { id: 'onyx', name: 'Onyx Dark', type: 'Premium', desc: 'High contrast elite design' },
    { id: 'grid', name: 'The Gridsmith', type: 'Tech', desc: 'Structured for engineers & data' },
    { id: 'executive_sidebar', name: 'Executive Navy', type: 'Corporate', desc: 'Balanced for leadership roles' },
    { id: 'minimalist', name: 'Pure Minimal', type: 'Simple', desc: 'Focus on content and clarity' },
    { id: 'centered_modern', name: 'Centered Elegance', type: 'Modern', desc: 'Artistic and clean symmetry' },
    { id: 'asymmetric', name: 'Dynamic Flow', type: 'Content Dense', desc: 'Maximize information real estate' },
    { id: 'creative_banner', name: 'Bold Creator', type: 'Creative', desc: 'Graphic impact for designers' }
];

function populateTemplateGallery() {
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = PREMIUM_TEMPLATES.map(tmp => `
        <div class="template-gallery-item group cursor-pointer" data-id="${tmp.id}">
            <div class="aspect-[3/4] rounded-3xl bg-gray-50 border-2 border-gray-100 dark:border-slate-800 p-2 overflow-hidden group-hover:border-indigo-500 group-hover:shadow-2xl group-hover:shadow-indigo-100 transition-all relative">
                <div class="w-full h-full bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-2 opacity-80 group-hover:opacity-100">
                     <!-- Dummy Preview Graphic -->
                     <div class="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                     <div class="w-20 h-1 bg-gray-100 rounded-full"></div>
                     <div class="w-20 h-1 bg-gray-100 rounded-full"></div>
                     <div class="mt-4 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                     </div>
                </div>
                <div class="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors"></div>
            </div>
            <div class="mt-4 text-left">
                <div class="flex items-center justify-between mb-1">
                    <h5 class="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">${tmp.name}</h5>
                    <span class="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase">${tmp.type}</span>
                </div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${tmp.desc}</p>
            </div>
        </div>
    `).join('');
    
    // Add listeners to gallery items
    galleryGrid.querySelectorAll('.template-gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const radio = document.querySelector(`input[name="templateId"][value="${id}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                closeTemplateGallery();
                // Visual feedback in the main grid
                radio.closest('label')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}

function openTemplateGallery() {
    if (!templateGalleryModal) return;
    populateTemplateGallery();
    templateGalleryModal.classList.remove('hidden');
    setTimeout(() => {
        templateGalleryPanel.classList.remove('translate-x-full');
        templateGalleryBackdrop.classList.remove('opacity-0');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeTemplateGallery() {
    if (!templateGalleryModal) return;
    templateGalleryPanel.classList.add('translate-x-full');
    templateGalleryBackdrop.classList.add('opacity-0');
    setTimeout(() => templateGalleryModal.classList.add('hidden'), 500);
    document.body.style.overflow = '';
}

if (browseTemplatesBtn) browseTemplatesBtn.addEventListener('click', openTemplateGallery);
if (templateGalleryClose) templateGalleryClose.addEventListener('click', closeTemplateGallery);
if (templateGalleryBackdrop) templateGalleryBackdrop.addEventListener('click', closeTemplateGallery);

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = additionalPanel.classList.toggle('hidden');
        toggleIcon.innerText = isHidden ? '+' : '−';
    });
}

// Rich Text Editor Initialization (Summary)
let summaryEditor;
if (document.getElementById('summary-editor')) {
    summaryEditor = new Quill('#summary-editor', {
        theme: 'snow',
        modules: {
            toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'bullet' }], ['clean']]
        }
    });
    summaryEditor.on('text-change', () => {
        const hiddenInput = document.querySelector('input[name="personalInfo.summary"]');
        if (hiddenInput) {
            hiddenInput.value = summaryEditor.root.innerHTML;
            updatePreview();
        }
    });
}

// Photo Upload Logic
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const removePhotoBtn = document.getElementById('remove-photo');

if (photoInput) {
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File too large. Max 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                cvData.personalInfo.photo = event.target.result;
                photoPreview.innerHTML = `<img src="${event.target.result}" class="w-full h-full object-cover">`;
                removePhotoBtn.classList.remove('hidden');
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
        cvData.personalInfo.photo = null;
        photoPreview.innerHTML = `
            <svg class="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
        `;
        removePhotoBtn.classList.add('hidden');
        photoInput.value = '';
        updatePreview();
    });
}

function renderPreview(data) {
    const fullName = `${data.personalInfo.firstName || ''} ${data.personalInfo.lastName || ''}`.trim() || 'Your Name';
    const locationStr = [data.personalInfo.address, data.personalInfo.city].filter(x => x).join(', ');
    const primaryColor = data.themeColor || '#4f46e5';
    
    // Spacing multiplier logic
    const spacingMultipliers = { tight: 0.7, standard: 1.0, airy: 1.4 };
    const sp = spacingMultipliers[data.density] || 1.0;

    // Font definitions
    const fontPairings = {
        'inter-inter': { header: "'Inter', sans-serif", body: "'Inter', sans-serif", googleFonts: 'Inter:wght@400;600;700;800' },
        'outfit-inter': { header: "'Outfit', sans-serif", body: "'Inter', sans-serif", googleFonts: 'Outfit:wght@400;600;700;800&Inter:wght@400;500;600' },
        'serif-inter': { header: "'EB Garamond', serif", body: "'Inter', sans-serif", googleFonts: 'EB+Garamond:wght@400;600;700;800&Inter:wght@400;500;600' }
    };
    const fonts = fontPairings[data.fontPairing] || fontPairings['outfit-inter'];

    // Inject Google Fonts
    const googleFontsLink = document.getElementById('google-fonts-link');
    if (googleFontsLink) {
        googleFontsLink.href = `https://fonts.googleapis.com/css2?family=${fonts.googleFonts}&display=swap`;
    } else {
        const link = document.createElement('link');
        link.id = 'google-fonts-link';
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fonts.googleFonts}&display=swap`;
        document.head.appendChild(link);
    }

    // Dynamic Variable Injection
    const spacingMultiplier = {
        'tight': 0.85,
        'standard': 1,
        'airy': 1.2
    }[cvData.density || 'standard'] || 1;

    const fontStyles = {
        'outfit-inter': { heading: "'Outfit', sans-serif", body: "'Inter', sans-serif" },
        'serif-inter': { heading: "'EB Garamond', serif", body: "'Inter', sans-serif" },
        'inter-inter': { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" }
    }[cvData.fontPairing || 'outfit-inter'] || { heading: "'Outfit', sans-serif", body: "'Inter', sans-serif" };

    const styleOverride = `
        <style>
            :root { 
                --primary: ${primaryColor};
                --font-header: ${fontStyles.heading};
                --font-body: ${fontStyles.body};
                --spacing-m: ${spacingMultiplier};
            }
            .modern-template, .classic-template, .minimalist-template, .grid-template { 
                font-family: var(--font-body) !important; 
                line-height: calc(1.5 * var(--spacing-m));
            }
            h1, h2, h3, h4, .font-heading { font-family: var(--font-header) !important; }
            section { margin-bottom: calc(2.5rem * var(--spacing-m)) !important; }
            .space-y-8 > * + * { margin-top: calc(2rem * var(--spacing-m)) !important; }
            .space-y-6 > * + * { margin-top: calc(1.5rem * var(--spacing-m)) !important; }
            .space-y-4 > * + * { margin-top: calc(1rem * var(--spacing-m)) !important; }
            .space-y-2 > * + * { margin-top: calc(0.5rem * var(--spacing-m)) !important; }
            .mb-10 { margin-bottom: calc(2.5rem * var(--spacing-m)) !important; }
            .mb-8 { margin-bottom: calc(2rem * var(--spacing-m)) !important; }
            .mb-6 { margin-bottom: calc(1.5rem * var(--spacing-m)) !important; }
            .mb-4 { margin-bottom: calc(1rem * var(--spacing-m)) !important; }
            .mb-2 { margin-bottom: calc(0.5rem * var(--spacing-m)) !important; }
            .pb-8 { padding-bottom: calc(2rem * var(--spacing-m)) !important; }
            .pb-2 { padding-bottom: calc(0.5rem * var(--spacing-m)) !important; }
            .px-12 { padding-left: calc(3rem * var(--spacing-m)) !important; padding-right: calc(3rem * var(--spacing-m)) !important; }
            .py-12 { padding-top: calc(3rem * var(--spacing-m)) !important; padding-bottom: calc(3rem * var(--spacing-m)) !important; }
            .px-16 { padding-left: calc(4rem * var(--spacing-m)) !important; padding-right: calc(4rem * var(--spacing-m)) !important; }
            .py-16 { padding-top: calc(4rem * var(--spacing-m)) !important; padding-bottom: calc(4rem * var(--spacing-m)) !important; }
            .gap-10 { gap: calc(2.5rem * var(--spacing-m)) !important; }
            .gap-6 { gap: calc(1.5rem * var(--spacing-m)) !important; }
            .gap-4 { gap: calc(1rem * var(--spacing-m)) !important; }
            .gap-2 { gap: calc(0.5rem * var(--spacing-m)) !important; }
            
            /* Section Header Styles */
            .section-title { 
                position: relative;
                width: fit-content;
                padding-bottom: 2px;
                margin-bottom: 1rem;
            }
            .section-title.underline::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background-color: var(--primary);
                opacity: 0.6;
            }
            .section-title.pill {
                background-color: var(--primary);
                color: white !important;
                padding: 4px 16px;
                border-radius: 9999px;
                margin-bottom: 1.5rem;
                letter-spacing: 0.15em;
            }
            
            /* Preview Template Overrides */
            .modern-template .text-indigo-600, .classic-template .text-indigo-600, .modern-template .text-indigo-700, .classic-template .text-indigo-700, .minimalist-template .text-indigo-600, .grid-template .text-indigo-600 { color: var(--primary) !important; }
            .modern-template .bg-indigo-600, .classic-template .bg-indigo-600, .minimalist-template .bg-indigo-600, .grid-template .bg-indigo-600 { background-color: var(--primary) !important; }
            .modern-template .bg-indigo-50, .classic-template .bg-indigo-50, .minimalist-template .bg-indigo-50, .grid-template .bg-indigo-50 { background-color: rgba(${hexToRgb(primaryColor)}, 0.1) !important; color: var(--primary) !important; }
            .modern-template .border-indigo-600, .classic-template .border-indigo-600, .minimalist-template .border-indigo-600, .grid-template .border-indigo-600 { border-color: var(--primary) !important; }

            /* App UI Immersion (Buttons & Steppers) */
            .bg-indigo-600, .next-step-btn, #export-btn, #final-save-btn { background-color: var(--primary) !important; transition: background 0.3s; }
            .text-indigo-600 { color: var(--primary) !important; }
            .border-indigo-600 { border-color: var(--primary) !important; }
            .bg-indigo-50 { background-color: rgba(${hexToRgb(primaryColor)}, 0.1) !important; }
            .step-btn.active div { background-color: var(--primary) !important; shadow-color: rgba(${hexToRgb(primaryColor)}, 0.2) !important; }
            .step-btn.active span { color: var(--primary) !important; }
            .ai-gen-btn { color: var(--primary) !important; background-color: rgba(${hexToRgb(primaryColor)}, 0.05) !important; }
            .ai-gen-btn:hover { background-color: rgba(${hexToRgb(primaryColor)}, 0.1) !important; }
            
            ${data.templateId === 'onyx' ? `
            .modern-template {
                background-color: #020617 !important; /* slate-950 */
                color: #e2e8f0 !important; /* slate-200 */
            }
            .modern-template .text-gray-900 { color: #ffffff !important; }
            .modern-template .text-gray-800 { color: #f8fafc !important; }
            .modern-template .text-gray-700 { color: #e2e8f0 !important; }
            .modern-template .text-gray-600 { color: #94a3b8 !important; /* slate-400 */ }
            .modern-template .text-gray-500 { color: #64748b !important; /* slate-500 */ }
            .modern-template .text-gray-400 { color: #475569 !important; /* slate-600 */ }
            .modern-template .border-gray-100 { border-color: #1e293b !important; /* slate-800 */ }
            .modern-template .border-gray-200 { border-color: #334155 !important; /* slate-700 */ }
            .modern-template .bg-white { background-color: transparent !important; }
            .modern-template .bg-gray-50 { background-color: rgba(255,255,255,0.03) !important; }
            .modern-template .bg-gray-100 { background-color: rgba(255,255,255,0.06) !important; }
            .modern-template .bg-gray-200 { background-color: rgba(255,255,255,0.1) !important; }
            ` : ''}
        </style>
    `;

    if (data.templateId === 'modern' || data.templateId === 'onyx') {
        previewContent.innerHTML = styleOverride + renderModernTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'classic') {
        previewContent.innerHTML = styleOverride + renderClassicTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'grid') {
        previewContent.innerHTML = styleOverride + renderGridTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'minimalist') {
        previewContent.innerHTML = styleOverride + renderMinimalistTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'executive_sidebar') {
        previewContent.innerHTML = styleOverride + renderExecutiveSidebarTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'centered_modern') {
        previewContent.innerHTML = styleOverride + renderCenteredModernTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'asymmetric') {
        previewContent.innerHTML = styleOverride + renderAsymmetricGridTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'creative_banner') {
        previewContent.innerHTML = styleOverride + renderCreativeBannerTemplate(data, fullName, locationStr);
    } else if (data.templateId === 'standard_professional') {
        previewContent.innerHTML = styleOverride + renderStandardProfessionalTemplate(data, fullName, locationStr);
    }

    // Render QR code into preview slot if showQrCode is enabled
    const qrSlot = document.getElementById('preview-qr-slot');
    if (qrSlot && data.showQrCode && typeof QRCode !== 'undefined') {
        const slug = document.getElementById('share-btn')?.dataset.slug;
        if (slug) {
            qrSlot.innerHTML = '';
            new QRCode(qrSlot, {
                text: window.location.origin + '/p/' + slug,
                width: 64, height: 64,
                colorDark: '#1e293b', colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    }

    renderSectionOrderUI();
}

function renderSectionOrderUI() {
    const mainList = document.getElementById('main-sections-list');
    const sidebarList = document.getElementById('sidebar-sections-list');
    const sbZone = document.getElementById('sidebar-column-zone');
    const mainLabel = document.getElementById('main-column-label');

    if (!mainList || !sidebarList) return;

    // Adjust visibility based on template
    const isTwoCol = ['modern', 'grid', 'onyx'].includes(cvData.templateId);
    if (isTwoCol) {
        sbZone.classList.remove('hidden');
        mainLabel.innerText = 'Main Column';
    } else {
        sbZone.classList.add('hidden');
        mainLabel.innerText = 'All Sections (Single Column)';
    }

    if (mainList.children.length > 0 && mainList.dataset.template === cvData.templateId) return;
    mainList.dataset.template = cvData.templateId;

    mainList.innerHTML = '';
    sidebarList.innerHTML = '';

    const sectionLabels = {
        profile: 'Profile / Summary',
        experience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        contact: 'Contact Info',
        details: 'Personal Details',
        interests: 'Interests / Hobbies',
        references: 'References'
    };

    const renderItem = (id, parent) => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm cursor-move flex items-center justify-between group hover:border-indigo-200 transition-all';
        div.draggable = true;
        div.dataset.id = id;
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-gray-300 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                </svg>
                <span class="text-[10px] font-bold text-gray-600 uppercase tracking-widest">${sectionLabels[id] || id}</span>
            </div>
        `;
        
        div.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', id);
            div.classList.add('opacity-40', 'scale-95');
        };
        div.ondragend = () => div.classList.remove('opacity-40', 'scale-95');
        
        parent.appendChild(div);
    };

    cvData.sectionOrder.main.forEach(id => renderItem(id, mainList));
    cvData.sectionOrder.sidebar.forEach(id => renderItem(id, sidebarList));

    // Handle Drop Zones
    [mainList, sidebarList].forEach(list => {
        list.ondragover = (e) => {
            e.preventDefault();
            list.classList.add('bg-indigo-50/50', 'border-indigo-200');
        };
        list.ondragleave = () => {
            list.classList.remove('bg-indigo-50/50', 'border-indigo-200');
        };
        list.ondrop = (e) => {
            e.preventDefault();
            list.classList.remove('bg-indigo-50/50', 'border-indigo-200');
            const id = e.dataTransfer.getData('text/plain');
            const toListId = list.id === 'main-sections-list' ? 'main' : 'sidebar';
            
            // Remove from whichever list it was in
            cvData.sectionOrder.main = cvData.sectionOrder.main.filter(x => x !== id);
            cvData.sectionOrder.sidebar = cvData.sectionOrder.sidebar.filter(x => x !== id);
            
            // Find insertion point
            const afterElement = getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                cvData.sectionOrder[toListId].push(id);
            } else {
                const targetId = afterElement.dataset.id;
                const idx = cvData.sectionOrder[toListId].indexOf(targetId);
                cvData.sectionOrder[toListId].splice(idx, 0, id);
            }
            
            mainList.dataset.template = ''; // Force redraw
            updatePreview();
            triggerAutoSave();
        };
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('[draggable]:not(.opacity-40)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function renderModernTemplate(data, fullName, locationStr) {
    const getLocalizedHeader = (id) => {
        const region = data.region || 'us';
        const labels = {
            profile: { us: 'Summary', eu: 'Professional Profile', de: 'Profil' },
            experience: { us: 'Work Experience', eu: 'Employment History', de: 'Berufserfahrung' },
            education: { us: 'Education', eu: 'Academic Background', de: 'Ausbildung' },
            skills: { us: 'Skills', eu: 'Core Competencies', de: 'Kenntnisse' },
            details: { us: 'Biographical Data', eu: 'Additional Info', de: 'Persönliche Daten' },
            interests: { us: 'Interests', eu: 'Hobbies & Interests', de: 'Interessen' },
            references: { us: 'References', eu: 'Referees', de: 'Referenzen' },
            contact: { us: 'Contact', eu: 'Contact Details', de: 'Kontakt' }
        };
        return labels[id]?.[region] || labels[id]?.us || id.charAt(0).toUpperCase() + id.slice(1);
    };

    const getSectionHeader = (iconName) => {
        const title = getLocalizedHeader(iconName);
        const icons = {
            profile: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
            experience: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            education: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m18 0l-9 5"></path></svg>',
            skills: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
            contact: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            details: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            interests: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
            references: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>'
        };
        const showIcons = data.showHeaderIcons === 'icons';
        return `
            <h2 class="section-title ${data.sidebarStyle || 'minimal'} font-heading uppercase text-[11px] font-bold text-indigo-600 tracking-widest flex items-center gap-2">
                ${showIcons ? `<span class="opacity-60">${icons[iconName] || ''}</span>` : ''}
                <span>${title}</span>
            </h2>`;
    };

    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        if (id === 'profile') return `
            <section class="mb-10 animate-fade-in origin-top">
                ${getSectionHeader('profile')}
                <div class="text-[11px] leading-relaxed text-gray-800 quill-content">${data.personalInfo.summary || 'Summary...'}</div>
            </section>`;
        if (id === 'experience') return `
            <section class="mb-10 animate-fade-in origin-top">
                ${getSectionHeader('experience')}
                <div class="space-y-8">
                    ${data.experience.map(exp => `
                        <div>
                            <div class="flex justify-between items-start mb-1">
                                <h4 class="text-sm font-bold text-gray-900">${exp.jobTitle || 'Role'}</h4>
                                ${exp.duration ? `<span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">${exp.duration}</span>` : ''}
                            </div>
                            <p class="text-xs font-bold text-gray-400 uppercase mb-2">${exp.company || 'Company'}</p>
                            <div class="text-xs text-gray-800 leading-relaxed quill-content">${exp.responsibilities || ''}</div>
                        </div>
                    `).join('')}
                 </div>
            </section>`;
        if (id === 'education') return `
            <section class="mb-10">
                ${getSectionHeader('education')}
                <div class="space-y-4">
                    ${data.education.map(edu => `
                        <div>
                            <h4 class="text-xs font-bold text-gray-900">${edu.degree || 'Degree'}</h4>
                            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">${edu.school || 'University'} ${edu.year ? '• ' + edu.year : ''}</p>
                            ${edu.description ? `<div class="text-[10px] text-gray-600 leading-relaxed quill-content">${edu.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </section>`;
        if (id === 'skills') return `
            <section class="mb-10">
                ${getSectionHeader('skills')}
                <div class="flex flex-wrap gap-1.5 mb-4">
                    ${data.skills.technical.map(skill => `<span class="px-2 py-0.5 bg-gray-100 text-[9px] font-bold text-gray-700 rounded uppercase tracking-wider">${skill}</span>`).join('')}
                </div>
                <div class="flex flex-wrap gap-1.5">
                    ${data.skills.soft.map(skill => `<span class="px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded uppercase tracking-wider">${skill}</span>`).join('')}
                </div>
            </section>`;
        if (id === 'contact') return `
            <section class="mb-10">
                ${getSectionHeader('contact')}
                <ul class="space-y-2 text-[10px] font-semibold text-gray-600">
                    <li class="flex items-center space-x-2">📧 <span>${data.personalInfo.email || 'email@example.com'}</span></li>
                    <li class="flex items-center space-x-2">📱 <span>${data.personalInfo.phone || '+1 234 567 890'}</span></li>
                    ${locationStr ? `<li class="flex items-center space-x-2">📍 <span>${locationStr}</span></li>` : ''}
                    ${data.personalInfo.linkedin ? `<li class="flex items-center space-x-2">🔗 <span>${data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span></li>` : ''}
                </ul>
            </section>`;
        if (id === 'details') {
            return `
            ${data.personalInfo.dateOfBirth || data.personalInfo.nationality || data.personalInfo.maritalStatus || data.personalInfo.drivingLicense ? `
            <section class="mb-10">
                ${getSectionHeader('details')}
                <ul class="space-y-1 text-[9px] text-gray-500 font-bold uppercase">
                    ${data.personalInfo.dateOfBirth ? `<li>Birth: <span class="text-gray-900">${data.personalInfo.dateOfBirth}</span></li>` : ''}
                    ${data.personalInfo.nationality ? `<li>Nat: <span class="text-gray-900">${data.personalInfo.nationality}</span></li>` : ''}
                    ${data.personalInfo.maritalStatus ? `<li>Status: <span class="text-gray-900">${data.personalInfo.maritalStatus}</span></li>` : ''}
                    ${data.personalInfo.drivingLicense ? `<li>DL: <span class="text-gray-900">${data.personalInfo.drivingLicense}</span></li>` : ''}
                </ul>
            </section>
            ` : ''}`;
        }
        if (id === 'interests') return `
            ${data.hobbies.length > 0 ? `
            <section class="mb-10">
                ${getSectionHeader('interests')}
                <div class="flex flex-wrap gap-2 text-xs text-gray-600 font-medium">
                    ${(data.hobbies || []).map(h => typeof h === 'string' ? h : h.name).join(' • ')}
                </div>
            </section>
            ` : ''}`;
        if (id === 'references') return `
            ${data.references.length > 0 || data.referencesOnRequest ? `
            <section class="mb-10">
                ${getSectionHeader('references')}
                ${data.referencesOnRequest ? `
                    <p class="text-[10px] text-gray-500 italic">Excellent references available upon request.</p>
                ` : `
                    <div class="space-y-4">
                        ${data.references.map(ref => `
                            <div>
                                <h4 class="text-xs font-bold text-gray-900">${ref.name || 'Name'}</h4>
                                <p class="text-[10px] text-gray-500">${ref.position || ''} ${ref.company ? 'at ' + ref.company : ''}</p>
                                <p class="text-[10px] text-indigo-600 font-medium">${ref.contact || ''}</p>
                            </div>
                        `).join('')}
                    </div>
                `}
            </section>
            ` : ''}`;
        return '';
    };

    const isGerman = data.region === 'de';
    const isUS = data.region === 'us';

    const photoStyle = data.photoStyle || 'rounded';
    const photoClasses = {
        'square': 'rounded-none',
        'rounded': 'rounded-2xl',
        'circle': 'rounded-full',
        'hidden': 'hidden'
    }[photoStyle] || 'rounded-2xl';

    // Region forced overrides
    const showPhoto = !isUS && data.personalInfo.photo && photoStyle !== 'hidden';

    return `
            <div class="modern-template animate-fade-in origin-top px-12 py-12 min-h-[1123px]">
                <header class="border-b-2 border-indigo-600 pb-8 mb-10 flex justify-between items-end px-4">
                    <div>
                        <h1 class="text-5xl font-extrabold text-gray-900 mb-1 uppercase tracking-tighter font-heading">${fullName}</h1>
                        <p class="text-2xl font-bold text-indigo-600 uppercase tracking-widest leading-none font-heading">${data.personalInfo.jobTitle || 'Job Role'}</p>
                        ${data.personalInfo.headline ? `<p class="mt-4 text-[11px] font-medium text-gray-500 max-w-lg italic font-serif leading-relaxed">${data.personalInfo.headline}</p>` : ''}
                    </div>
                    <div class="flex items-end space-x-4">
                        ${showPhoto ? `
                            <div class="w-24 h-24 ${photoClasses} overflow-hidden border-4 border-white shadow-xl mb-[-4px]">
                                <img src="${data.personalInfo.photo}" class="w-full h-full object-cover">
                            </div>
                        ` : ''}
                        ${data.showQrCode && document.getElementById('share-btn')?.dataset.slug ? `
                            <div class="flex flex-col items-center flex-shrink-0 mb-[-4px]">
                                <div id="preview-qr-slot" class="w-16 h-16"></div>
                                <p class="text-[7px] text-gray-400 uppercase tracking-widest mt-1 font-bold">Scan to view</p>
                            </div>
                        ` : ''}
                    </div>
                </header>
                <div class="grid grid-cols-3 gap-10">
                    <aside class="col-span-1 ${data.sidebarPos === 'right' ? 'order-last border-l pl-8' : 'border-r pr-8'} border-gray-100">
                        ${data.sectionOrder.sidebar.map(renderSection).join('')}
                    </aside>
                    <div class="col-span-2">
                        ${data.sectionOrder.main.map(renderSection).join('')}
                    </div>
                </div>

                <!-- Page Break Indicator (Visual Guide Only) -->
                <div class="mt-20 border-t-2 border-dashed border-gray-100 flex items-center justify-center relative">
                    <span class="absolute -top-3 bg-white px-4 text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">Potential Page Break</span>
                </div>
            </div>
    `;
}

function renderExecutiveSidebarTemplate(data, fullName, locationStr) {
    const isUS = data.region === 'us';
    const photoStyle = data.photoStyle || 'rounded';
    const photoClasses = { 'square': 'rounded-none', 'rounded': 'rounded-2xl', 'circle': 'rounded-full', 'hidden': 'hidden' }[photoStyle] || 'rounded-2xl';
    const showPhoto = !isUS && data.personalInfo.photo && photoStyle !== 'hidden';

    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        if (id === 'profile') return `<section class="mb-10"><h2 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-900 border-b-2 border-slate-100 pb-2">Executive Summary</h2><div class="text-[11px] text-gray-700 leading-relaxed quill-content">${data.personalInfo.summary || ''}</div></section>`;
        if (id === 'experience') return `<section class="mb-10"><h2 class="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-900 border-b-2 border-slate-100 pb-2">Professional Experience</h2><div class="space-y-8">${data.experience.map(exp => `<div><div class="flex items-baseline justify-between mb-1"><h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">${exp.jobTitle}</h3><span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${exp.duration}</span></div><p class="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3">${exp.company}</p><div class="text-[11px] text-gray-600 leading-relaxed quill-content">${exp.responsibilities}</div></div>`).join('')}</div></section>`;
        if (id === 'education') return `<section class="mb-10"><h2 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-900 border-b-2 border-slate-100 pb-2">Education</h2><div class="space-y-4">${data.education.map(edu => `<div><div class="flex items-baseline justify-between mb-0.5"><h4 class="text-xs font-black text-gray-900 uppercase">${edu.degree}</h4><span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${edu.year}</span></div><p class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">${edu.school}</p> ${edu.description ? `<div class="text-[10px] text-gray-500 italic quill-content">${edu.description}</div>` : ''}</div>`).join('')}</div></section>`;
        if (id === 'skills') return `<section class="mb-10 p-6 bg-slate-800/50 rounded-2xl border border-white/10"><h2 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/60">Competencies</h2><div class="space-y-4"><div><p class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Technical</p><div class="flex flex-wrap gap-1.5">${data.skills.technical.map(skill => `<span class="px-2 py-0.5 bg-white/10 text-[9px] font-bold text-white rounded uppercase tracking-wider border border-white/5">${skill}</span>`).join('')}</div></div><div><p class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Soft Skills</p><div class="flex flex-wrap gap-1.5">${data.skills.soft.map(skill => `<span class="px-2 py-0.5 bg-indigo-500/20 text-[9px] font-bold text-indigo-200 rounded uppercase tracking-wider border border-indigo-400/10">${skill}</span>`).join('')}</div></div></div></section>`;
        if (id === 'contact') return `<section class="mb-10"><h2 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/60">Contact</h2><ul class="space-y-4 text-[10px] font-bold text-white/80 uppercase tracking-widest"><li class="flex items-center space-x-3"><span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300 pointer-events-none">📧</span><span>${data.personalInfo.email}</span></li><li class="flex items-center space-x-3"><span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300 pointer-events-none">📱</span><span>${data.personalInfo.phone}</span></li><li class="flex items-center space-x-3"><span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300 pointer-events-none">📍</span><span>${locationStr}</span></li></ul></section>`;
        return '';
    };

    return `
        <div class="executive-sidebar-template animate-fade-in flex min-h-[1123px]">
            <aside class="w-[32%] bg-[#1e293b] text-white p-10 flex flex-col">
                <div class="mb-10">${showPhoto ? `<div class="w-32 h-32 ${photoClasses} overflow-hidden border-4 border-white/10 shadow-2xl mx-auto mb-6"><img src="${data.personalInfo.photo}" class="w-full h-full object-cover"></div>` : ''}</div>
                ${renderSection('contact')} ${renderSection('skills')}
                <div class="mt-auto pt-10">${data.showQrCode && document.getElementById('share-btn')?.dataset.slug ? `<div class="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center space-x-3"><div id="preview-qr-slot" class="w-12 h-12 bg-white p-1 rounded-lg"></div><div><p class="text-[8px] font-black text-white uppercase tracking-widest leading-tight">Digital<br>Version</p></div></div>` : ''}</div>
            </aside>
            <main class="flex-grow p-12 bg-white"><header class="mb-10"><h1 class="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">${fullName}</h1><p class="text-xl font-bold text-indigo-600 uppercase tracking-[0.2em] mb-6">${data.personalInfo.jobTitle || ''}</p><div class="w-20 h-2 bg-indigo-600 rounded-full mb-8"></div></header><div class="space-y-2">${data.sectionOrder.main.map(renderSection).join('')}</div></main>
        </div>`;
}

function renderCenteredModernTemplate(data, fullName, locationStr) {
    const isUS = data.region === 'us';
    const showPhoto = !isUS && data.personalInfo.photo && (data.photoStyle || 'rounded') !== 'hidden';
    
    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        const titleMap = { profile: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', contact: 'Contact', details: 'Details', interests: 'Interests', references: 'References' };
        if (id === 'profile') return `<section class="mb-12"><h2 class="text-center text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 mb-6 flex items-center justify-center gap-4"><div class="h-px w-8 bg-gray-200"></div>${titleMap[id]}<div class="h-px w-8 bg-gray-200"></div></h2><div class="text-center text-xs text-gray-600 leading-relaxed max-w-2xl mx-auto quill-content">${data.personalInfo.summary || ''}</div></section>`;
        if (id === 'experience' || id === 'education') return `<section class="mb-12"><h2 class="text-center text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 mb-8 flex items-center justify-center gap-4"><div class="h-px w-8 bg-gray-200"></div>${titleMap[id]}<div class="h-px w-8 bg-gray-200"></div></h2><div class="space-y-10">${(id === 'experience' ? data.experience : data.education).map(item => `<div class="text-center"><h3 class="text-sm font-black text-gray-900 uppercase mb-1">${item.jobTitle || item.degree}</h3><p class="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">${item.company || item.school}</p><p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">${item.duration || item.year}</p><div class="text-[11px] text-gray-600 leading-relaxed max-w-2xl mx-auto quill-content">${item.responsibilities || item.description || ''}</div></div>`).join('')}</div></section>`;
        if (id === 'skills') return `<section class="mb-12"><h2 class="text-center text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 mb-6 flex items-center justify-center gap-4"><div class="h-px w-8 bg-gray-200"></div>${titleMap[id]}<div class="h-px w-8 bg-gray-200"></div></h2><div class="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">${data.skills.technical.map(s => `<span class="px-3 py-1 bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-700 rounded-full uppercase tracking-wider">${s}</span>`).join('')}</div></section>`;
        return '';
    };

    return `
        <div class="centered-modern-template animate-fade-in px-20 py-16 min-h-[1123px] bg-white text-center">
            <header class="mb-16">
                ${showPhoto ? `<div class="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg mx-auto mb-6"><img src="${data.personalInfo.photo}" class="w-full h-full object-cover"></div>` : ''}
                <h1 class="text-5xl font-black text-gray-900 uppercase tracking-tight mb-2">${fullName}</h1>
                <p class="text-lg font-bold text-indigo-600 uppercase tracking-[0.4em] mb-6">${data.personalInfo.jobTitle || ''}</p>
                <div class="flex items-center justify-center space-x-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>${data.personalInfo.email}</span><span>•</span><span>${data.personalInfo.phone}</span><span>•</span><span>${locationStr}</span>
                </div>
            </header>
            <div class="space-y-4">
                ${[...data.sectionOrder.main, ...data.sectionOrder.sidebar].filter(id => !['contact', 'skills'].includes(id)).map(renderSection).join('')}
                ${renderSection('skills')}
            </div>
        </div>`;
}

function renderAsymmetricGridTemplate(data, fullName, locationStr) {
    const isUS = data.region === 'us';
    const showPhoto = !isUS && data.personalInfo.photo && (data.photoStyle || 'rounded') !== 'hidden';
    
    const renderSection = (id, isSidebar = false) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        const title = id.charAt(0).toUpperCase() + id.slice(1);
        const header = `<h2 class="text-[11px] font-black uppercase tracking-[0.15em] mb-4 ${isSidebar ? 'text-gray-900' : 'text-indigo-600'}">${title}</h2>`;
        
        if (id === 'profile') return `<section class="mb-10">${header}<div class="text-[11px] text-gray-700 leading-relaxed quill-content">${data.personalInfo.summary || ''}</div></section>`;
        if (id === 'experience') return `<section class="mb-10">${header}<div class="space-y-8">${data.experience.map(exp => `<div><div class="flex justify-between items-baseline mb-1"><h3 class="text-sm font-black text-gray-900 uppercase">${exp.jobTitle}</h3><span class="text-[10px] font-black text-gray-400 uppercase">${exp.duration}</span></div><p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">${exp.company}</p><div class="text-[11px] text-gray-600 leading-relaxed quill-content pl-4 border-l-2 border-slate-100">${exp.responsibilities}</div></div>`).join('')}</div></section>`;
        if (id === 'skills') return `<section class="mb-10">${header}<div class="grid grid-cols-1 gap-4">${data.skills.technical.map(s => `<div><p class="text-[10px] font-bold text-gray-700 uppercase mb-1">${s}</p><div class="w-full h-1 bg-gray-100 rounded-full overflow-hidden"><div class="w-4/5 h-full bg-indigo-500 rounded-full"></div></div></div>`).join('')}</div></section>`;
        if (id === 'contact') return `<section class="mb-10">${header}<ul class="space-y-3 text-[10px] font-bold text-gray-600 uppercase tracking-tight"><li><p class="text-[8px] text-gray-400 mb-0.5">EMAIL</p>${data.personalInfo.email}</li><li><p class="text-[8px] text-gray-400 mb-0.5">PHONE</p>${data.personalInfo.phone}</li><li><p class="text-[8px] text-gray-400 mb-0.5">LOCATION</p>${locationStr}</li></ul></section>`;
        return '';
    };

    return `
        <div class="asymmetric-template animate-fade-in flex min-h-[1123px] bg-white">
            <main class="w-[66%] p-16 border-r border-gray-100">
                <header class="mb-12">
                    <h1 class="text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-4">${fullName}</h1>
                    <p class="text-xl font-bold text-indigo-600 uppercase tracking-widest">${data.personalInfo.jobTitle || ''}</p>
                </header>
                ${data.sectionOrder.main.map(id => renderSection(id, false)).join('')}
            </main>
            <aside class="w-[34%] bg-gray-50 p-12">
                ${showPhoto ? `<div class="mb-10 rounded-3xl overflow-hidden shadow-xl border-8 border-white"><img src="${data.personalInfo.photo}" class="w-full h-full object-cover"></div>` : ''}
                ${renderSection('contact', true)}
                ${data.sectionOrder.sidebar.filter(id => id !== 'contact').map(id => renderSection(id, true)).join('')}
            </aside>
        </div>`;
}

function renderCreativeBannerTemplate(data, fullName, locationStr) {
    const isUS = data.region === 'us';
    const showPhoto = !isUS && data.personalInfo.photo && (data.photoStyle || 'rounded') !== 'hidden';
    
    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        const title = id.toUpperCase();
        if (id === 'experience') return `<section class="mb-10"><h2 class="text-[12px] font-black text-indigo-600 mb-6 flex items-center gap-3"><span>${title}</span><div class="flex-grow h-px bg-indigo-100"></div></h2><div class="relative space-y-8 pl-6 border-l-2 border-indigo-50">${data.experience.map(exp => `<div class="relative"><div class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-600"></div><div class="mb-1 text-[10px] font-black text-indigo-400">${exp.duration}</div><h3 class="text-sm font-black text-gray-900 mb-0.5">${exp.jobTitle}</h3><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">${exp.company}</p><div class="text-[11px] text-gray-600 leading-relaxed quill-content">${exp.responsibilities}</div></div>`).join('')}</div></section>`;
        if (id === 'skills') return `<section class="mb-10"><h2 class="text-xs font-black text-gray-900 mb-4">SKILLS</h2><div class="flex flex-wrap gap-2">${data.skills.technical.map(s => `<span class="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase shadow-lg shadow-indigo-100">${s}</span>`).join('')}</div></section>`;
        return '';
    };

    return `
        <div class="creative-banner-template animate-fade-in bg-white min-h-[1123px]">
            <header class="bg-indigo-600 text-white p-16 pb-20 clip-path-banner">
                <div class="flex justify-between items-start">
                    <div class="max-w-xl">
                        <h1 class="text-6xl font-black uppercase tracking-tight leading-none mb-4">${fullName}</h1>
                        <p class="text-2xl font-bold text-indigo-200 uppercase tracking-widest mb-6">${data.personalInfo.jobTitle || ''}</p>
                        <div class="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-indigo-100 opacity-80">
                            <span>📧 ${data.personalInfo.email}</span><span>📱 ${data.personalInfo.phone}</span><span>📍 ${locationStr}</span>
                        </div>
                    </div>
                    ${showPhoto ? `<div class="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"><img src="${data.personalInfo.photo}" class="w-full h-full object-cover"></div>` : ''}
                </div>
            </header>
            <div class="px-16 -mt-10 grid grid-cols-3 gap-12">
                <aside class="col-span-1 space-y-8">${data.sectionOrder.sidebar.map(renderSection).join('')}</aside>
                <main class="col-span-2 space-y-8">${data.sectionOrder.main.map(renderSection).join('')}</main>
            </div>
        </div>
        <style>.clip-path-banner { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }</style>`;
}

function renderClassicTemplate(data, fullName, locationStr) {
    const getSectionHeader = (title, iconName) => {
        const icons = {
            profile: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
            experience: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            education: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m18 0l-9 5"></path></svg>',
            skills: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
            contact: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            details: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            interests: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
            references: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>'
        };
        const showIcons = data.showHeaderIcons === 'icons';
        return `
            <h2 class="text-xs font-bold border-b border-gray-200 pb-1 mb-3 uppercase tracking-widest text-gray-900 font-outfit flex items-center gap-2">
                ${showIcons ? `<span class="opacity-60">${icons[iconName] || ''}</span>` : ''}
                <span>${title}</span>
            </h2>`;
    };

    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        if (id === 'profile') return `
             <section class="section-profile">
                ${getSectionHeader('Summary', 'profile')}
                <div class="text-sm leading-relaxed text-gray-800 font-serif quill-content">${data.personalInfo.summary || 'Summary...'}</div>
             </section>`;
        if (id === 'experience') return `
             <section class="section-experience">
                ${getSectionHeader('Experience', 'experience')}
                <div class="space-y-6">
                    ${data.experience.map(exp => `
                        <div>
                            <div class="flex justify-between text-sm font-bold">
                                <span class="text-indigo-600">${exp.company}</span>
                                <span class="text-gray-400 font-outfit">${exp.duration}</span>
                            </div>
                            <p class="italic text-sm text-gray-900 mb-2 font-bold">${exp.jobTitle}</p>
                            <div class="text-xs text-gray-600 leading-relaxed font-serif quill-content">${exp.responsibilities}</div>
                        </div>
                    `).join('')}
                </div>
             </section>`;
        if (id === 'education') return `
             <section class="section-education">
                 ${getSectionHeader('Education', 'education')}
                 <div class="space-y-4">
                     ${data.education.map(edu => `
                         <div>
                             <div class="flex justify-between text-sm font-bold">
                                 <span class="text-indigo-600 font-serif">${edu.school}</span>
                                 <span class="text-gray-400 font-outfit">${edu.year}</span>
                             </div>
                             <p class="italic text-sm text-gray-900 font-bold font-serif mb-1">${edu.degree}</p>
                             ${edu.description ? `<div class="text-xs text-gray-600 leading-relaxed font-serif quill-content">${edu.description}</div>` : ''}
                         </div>
                     `).join('')}
                 </div>
             </section>`;
        if (id === 'skills') return `
             <section class="section-skills">
                 ${getSectionHeader('Skills', 'skills')}
                 <p class="text-sm text-gray-700 font-serif"><strong>Technical:</strong> ${data.skills.technical.join(', ')}</p>
                 <p class="text-sm text-gray-700 mt-1 font-serif"><strong>Soft Skills:</strong> ${data.skills.soft.join(', ')}</p>
             </section>`;
        if (id === 'details') return `
             ${data.personalInfo.dateOfBirth || data.personalInfo.nationality || data.personalInfo.maritalStatus || data.personalInfo.drivingLicense ? `
             <section class="section-details pt-4 border-t border-gray-100">
                ${getSectionHeader('Details', 'details')}
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 font-serif">
                    ${data.personalInfo.dateOfBirth ? `<li>Birth: <span class="text-gray-900">${data.personalInfo.dateOfBirth}</span></li>` : ''}
                    ${data.personalInfo.nationality ? `<li>Nat: <span class="text-gray-900">${data.personalInfo.nationality}</span></li>` : ''}
                    ${data.personalInfo.maritalStatus ? `<li>Status: <span class="text-gray-900">${data.personalInfo.maritalStatus}</span></li>` : ''}
                    ${data.personalInfo.drivingLicense ? `<li>DL: <span class="text-gray-900">${data.personalInfo.drivingLicense}</span></li>` : ''}
                </div>
             </section>
             ` : ''}`;
        if (id === 'interests') return `
             ${data.hobbies.length > 0 ? `
                <section class="section-interests">
                    ${getSectionHeader('Interests', 'interests')}
                    <p class="text-xs text-gray-700 font-serif">${data.hobbies.join(', ')}</p>
                </section>
             ` : ''}`;
        if (id === 'references') return `
             ${data.referencesOnRequest || data.references.length > 0 ? `
                <section class="section-references">
                    ${getSectionHeader('References', 'references')}
                    ${data.referencesOnRequest ? `
                        <p class="text-xs italic text-gray-500 font-serif">References available on request</p>
                    ` : `
                        <div class="grid grid-cols-2 gap-4">
                             ${data.references.map(ref => `
                                <div>
                                    <h4 class="text-xs font-bold text-gray-900 font-serif">${ref.name}</h4>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase">${ref.company}</p>
                                    <p class="text-[10px] text-indigo-600 mt-1">${ref.email} ${ref.phone ? '• ' + ref.phone : ''}</p>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </section>
             ` : ''}`;
        return '';
    };

    const combinedOrder = [...data.sectionOrder.sidebar, ...data.sectionOrder.main].filter(id => id !== 'contact');

    return `
            <div class="classic-template animate-fade-in text-center px-16 py-16 min-h-[1123px]">
                ${data.personalInfo.photo ? `
                    <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm mx-auto mb-6">
                        <img src="${data.personalInfo.photo}" class="w-full h-full object-cover">
                    </div>
                ` : ''}
                <h1 class="text-3xl font-serif font-bold text-gray-900 border-b border-gray-900 pb-2 mb-2 italic tracking-tighter">${fullName}</h1>
                <p class="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1 italic">${data.personalInfo.jobTitle || ''}</p>
                ${data.personalInfo.headline ? `<p class="text-[10px] text-gray-500 mb-4 font-serif italic max-w-xl mx-auto">${data.personalInfo.headline}</p>` : ''}
                <p class="text-[10px] text-gray-400 mb-8 font-serif uppercase tracking-widest">
                    ${data.personalInfo.email} | ${data.personalInfo.phone}
                    ${locationStr ? ` | ${locationStr}` : ''}
                    ${data.personalInfo.linkedin ? ` | ${data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}` : ''}
                    ${data.personalInfo.website ? ` | ${data.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}` : ''}
                </p>
                <div class="text-left space-y-8">
                    ${combinedOrder.map(renderSection).join('')}
                </div>

                <!-- Page Break Indicator (Visual Guide Only) -->
                <div class="mt-20 border-t-2 border-dashed border-gray-100 flex items-center justify-center relative">
                    <span class="absolute -top-3 bg-white px-4 text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">Potential Page Break</span>
                </div>
            </div>
    `;
}

function renderStandardProfessionalTemplate(data, fullName, locationStr) {
    const getSectionHeader = (title) => `
        <h2 class="text-[13px] font-bold border-b-2 border-gray-800 pb-1 mb-3 uppercase tracking-widest text-gray-900 mt-6">${title}</h2>
    `;

    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        if (id === 'profile') return `
             <section class="section-profile">
                ${getSectionHeader('Professional Summary')}
                <div class="text-[11px] leading-relaxed text-gray-800 quill-content">${data.personalInfo.summary || 'Summary...'}</div>
             </section>`;
        if (id === 'experience') return `
             <section class="section-experience">
                ${getSectionHeader('Experience')}
                <div class="space-y-4">
                    ${data.experience.map(exp => `
                        <div>
                            <div class="flex justify-between items-baseline mb-0.5">
                                <span class="text-xs font-bold text-gray-900">${exp.jobTitle}</span>
                                <span class="text-[10px] whitespace-nowrap font-medium text-gray-700">${exp.duration}</span>
                            </div>
                            <p class="text-[11px] font-medium text-gray-800 mb-1">${exp.company}</p>
                            <div class="text-[11px] text-gray-800 leading-relaxed quill-content shrink-li-margins">${exp.responsibilities}</div>
                        </div>
                    `).join('')}
                </div>
             </section>`;
        if (id === 'education') return `
             <section class="section-education">
                 ${getSectionHeader('Education')}
                 <div class="space-y-3">
                     ${data.education.map(edu => `
                         <div>
                             <div class="flex justify-between items-baseline mb-0.5">
                                 <span class="text-xs font-bold text-gray-900">${edu.degree}</span>
                                 <span class="text-[10px] whitespace-nowrap font-medium text-gray-700">${edu.year}</span>
                             </div>
                             <p class="text-[11px] text-gray-800">${edu.school}</p>
                             ${edu.description ? `<div class="text-[10px] text-gray-600 leading-relaxed quill-content mt-1 shrink-li-margins">${edu.description}</div>` : ''}
                         </div>
                     `).join('')}
                 </div>
             </section>`;
        if (id === 'skills') return `
             <section class="section-skills">
                 ${getSectionHeader('Skills')}
                 <p class="text-[11px] text-gray-800"><strong>Technical:</strong> ${data.skills.technical.join(', ')}</p>
                 <p class="text-[11px] text-gray-800 mt-1"><strong>Soft Skills:</strong> ${data.skills.soft.join(', ')}</p>
             </section>`;
        if (id === 'details') return `
             ${data.personalInfo.dateOfBirth || data.personalInfo.nationality || data.personalInfo.maritalStatus || data.personalInfo.drivingLicense ? `
             <section class="section-details">
                ${getSectionHeader('Details')}
                <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-800">
                    ${data.personalInfo.dateOfBirth ? `<li>Birth: <span>${data.personalInfo.dateOfBirth}</span></li>` : ''}
                    ${data.personalInfo.nationality ? `<li>Nat: <span>${data.personalInfo.nationality}</span></li>` : ''}
                    ${data.personalInfo.maritalStatus ? `<li>Status: <span>${data.personalInfo.maritalStatus}</span></li>` : ''}
                    ${data.personalInfo.drivingLicense ? `<li>DL: <span>${data.personalInfo.drivingLicense}</span></li>` : ''}
                </div>
             </section>
             ` : ''}`;
        if (id === 'interests') return `
             ${data.hobbies.length > 0 ? `
                <section class="section-interests">
                    ${getSectionHeader('Interests')}
                    <p class="text-[11px] text-gray-800">${data.hobbies.join(', ')}</p>
                </section>
             ` : ''}`;
        if (id === 'references') return `
             ${data.referencesOnRequest || data.references.length > 0 ? `
                <section class="section-references">
                    ${getSectionHeader('References')}
                    ${data.referencesOnRequest ? `
                        <p class="text-[11px] italic text-gray-600">References available on request</p>
                    ` : `
                        <div class="grid grid-cols-2 gap-4 mt-2">
                             ${data.references.map(ref => `
                                <div>
                                    <h4 class="text-[11px] font-bold text-gray-900">${ref.name}</h4>
                                    <p class="text-[10px] text-gray-600 uppercase mb-1">${ref.company}</p>
                                    <p class="text-[10px] text-gray-800">${ref.email}</p>
                                    ${ref.phone ? `<p class="text-[10px] text-gray-800">${ref.phone}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `}
                </section>
             ` : ''}`;
        return '';
    };

    const combinedOrder = [...data.sectionOrder.sidebar, ...data.sectionOrder.main].filter(id => id !== 'contact');

    return `
            <div class="standard-professional-template animate-fade-in text-left px-16 py-16 min-h-[1123px]" style="font-family: Arial, Helvetica, sans-serif;">
                <style>
                    /* Custom styles for resume-now ATS simple look */
                    .shrink-li-margins ul { list-style-type: disc !important; margin-left: 1.5rem !important; margin-top: 0.25rem !important; }
                    .shrink-li-margins li { margin-bottom: 0.25rem !important; }
                    .shrink-li-margins p { margin-bottom: 0.25rem !important; }
                </style>
                <div class="text-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-900 uppercase tracking-tight mb-2">${fullName}</h1>
                    <p class="text-[11px] text-gray-800 mb-1 flex flex-wrap justify-center gap-2">
                        ${data.personalInfo.address ? `<span>${data.personalInfo.address}</span>` : ''}
                        ${data.personalInfo.city ? `<span>${data.personalInfo.city}</span>` : ''}
                        ${data.personalInfo.zipCode ? `<span>${data.personalInfo.zipCode}</span>` : ''}
                    </p>
                    <p class="text-[11px] text-gray-800 flex flex-wrap justify-center gap-x-3 gap-y-1">
                        ${data.personalInfo.phone ? `<span>${data.personalInfo.phone}</span>` : ''}
                        ${data.personalInfo.phone && data.personalInfo.email ? '<span class="text-gray-400">|</span>' : ''}
                        ${data.personalInfo.email ? `<span>${data.personalInfo.email}</span>` : ''}
                        ${(data.personalInfo.phone || data.personalInfo.email) && (data.personalInfo.linkedin || data.personalInfo.website) ? '<span class="text-gray-400">|</span>' : ''}
                        ${data.personalInfo.linkedin ? `<span>${data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>` : ''}
                        ${data.personalInfo.website ? `<span class="text-gray-400">|</span><span>${data.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>` : ''}
                    </p>
                </div>
                
                <div class="text-left space-y-2">
                    ${combinedOrder.map(renderSection).join('')}
                </div>

                <!-- Page Break Indicator (Visual Guide Only) -->
                <div class="mt-20 border-t-2 border-dashed border-gray-100 flex items-center justify-center relative">
                    <span class="absolute -top-3 bg-white px-4 text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">Potential Page Break</span>
                </div>
            </div>
    `;
}

function renderGridTemplate(data, fullName, locationStr) {
    const getSectionHeader = (title, iconName) => {
        const icons = {
            profile: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
            experience: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            education: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m18 0l-9 5"></path></svg>',
            skills: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
            contact: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            details: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            interests: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
            references: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>'
        };
        const showIcons = data.showHeaderIcons === 'icons';
        return `
            <h2 class="section-title ${data.sidebarStyle || 'minimal'} font-heading uppercase text-[11px] font-bold text-indigo-600 tracking-widest flex items-center gap-2">
                ${showIcons ? `<span class="opacity-60">${icons[iconName] || ''}</span>` : ''}
                <span>${title}</span>
            </h2>`;
    };

    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        if (id === 'profile') return `
            <section class="mb-10">
                ${getSectionHeader('Profile', 'profile')}
                <div class="text-xs leading-relaxed text-gray-800 quill-content">${data.personalInfo.summary || ''}</div>
            </section>`;
        if (id === 'experience') return `
            <section class="mb-10">
                ${getSectionHeader('Experience', 'experience')}
                <div class="space-y-8">
                    ${data.experience.map(exp => `
                        <div>
                            <div class="flex justify-between items-start mb-1">
                                <h4 class="text-xs font-bold text-gray-900">${exp.jobTitle || ''}</h4>
                                <span class="text-[9px] text-gray-400 font-bold uppercase">${exp.duration || ''}</span>
                            </div>
                            <p class="text-[10px] font-bold text-indigo-600 uppercase mb-2">${exp.company || ''}</p>
                            <div class="text-[10px] text-gray-800 leading-relaxed quill-content">${exp.responsibilities || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </section>`;
        if (id === 'education') return `
            <section class="mb-10">
                ${getSectionHeader('Education', 'education')}
                <div class="space-y-4">
                    ${data.education.map(edu => `
                        <div>
                            <h4 class="text-xs font-bold text-gray-900">${edu.degree}</h4>
                            <p class="text-[9px] text-gray-400 font-bold uppercase mb-1">${edu.school} • ${edu.year}</p>
                            ${edu.description ? `<div class="text-[10px] text-gray-600 leading-relaxed quill-content">${edu.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </section>`;
        if (id === 'skills') return `
            <section class="mb-10">
                ${getSectionHeader('Skills', 'skills')}
                <div class="space-y-4">
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Technical</p>
                        <div class="flex flex-wrap gap-1.5">
                            ${data.skills.technical.map(skill => `<span class="px-2 py-0.5 bg-gray-100 text-[9px] font-bold text-gray-700 rounded">${skill}</span>`).join('')}
                        </div>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Soft Skills</p>
                        <div class="flex flex-wrap gap-1.5">
                            ${data.skills.soft.map(skill => `<span class="px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </section>`;
        if (id === 'contact') return `
            <section class="mb-10">
                ${getSectionHeader('Contact', 'contact')}
                <ul class="space-y-2 text-[10px] font-semibold text-gray-600">
                    <li>📧 ${data.personalInfo.email}</li>
                    <li>📱 ${data.personalInfo.phone}</li>
                    ${locationStr ? `<li>📍 ${locationStr}</li>` : ''}
                    ${data.personalInfo.linkedin ? `<li>🔗 ${data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</li>` : ''}
                </ul>
            </section>`;
        if (id === 'interests') return `
            ${data.hobbies.length > 0 ? `
            <section class="mb-10">
                ${getSectionHeader('Interests', 'interests')}
                <div class="flex flex-wrap gap-2 text-[10px] text-gray-600 font-medium">
                    ${data.hobbies.join(' • ')}
                </div>
            </section>
            ` : ''}`;
        if (id === 'references') return `
            ${data.referencesOnRequest || data.references.length > 0 ? `
            <section class="mb-10">
                ${getSectionHeader('References', 'references')}
                ${data.referencesOnRequest ? `
                    <p class="text-xs italic text-gray-500">Available on request</p>
                ` : `
                    <div class="space-y-4">
                        ${data.references.map(ref => `
                            <div>
                                <h4 class="text-xs font-bold text-gray-900">${ref.name}</h4>
                                <p class="text-[10px] text-gray-400 font-bold uppercase">${ref.company}</p>
                            </div>
                        `).join('')}
                    </div>
                `}
            </section>
            ` : ''}`;
        return '';
    };

    const photoStyle = data.photoStyle || 'rounded';
    const photoClasses = {
        'square': 'rounded-none',
        'rounded': 'rounded-2xl',
        'circle': 'rounded-full',
        'hidden': 'hidden'
    }[photoStyle] || 'rounded-2xl';

    return `
            <div class="grid-template animate-fade-in origin-top px-12 py-12 min-h-[1123px] text-gray-900">
                <header class="mb-10 border-b-2 border-gray-100 pb-8 flex justify-between items-center px-4">
                    <div>
                        <h1 class="text-4xl font-extrabold text-gray-900 mb-1 uppercase tracking-tight font-heading">${fullName}</h1>
                        <p class="text-lg font-bold text-indigo-600 uppercase tracking-widest leading-none font-heading">${data.personalInfo.jobTitle || ''}</p>
                        ${data.personalInfo.headline ? `<p class="mt-3 text-[10px] font-medium text-gray-500 max-w-sm italic tracking-tight font-serif leading-relaxed">${data.personalInfo.headline}</p>` : ''}
                    </div>
                    ${data.personalInfo.photo && photoStyle !== 'hidden' ? `
                        <div class="w-20 h-20 ${photoClasses} overflow-hidden border-2 border-gray-100">
                            <img src="${data.personalInfo.photo}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                </header>
                
                <div class="grid grid-cols-2 gap-12 mt-10">
                    <div class="space-y-10 ${data.sidebarPos === 'right' ? 'order-first' : 'order-last'}">
                        ${data.sectionOrder.main.map(renderSection).join('')}
                    </div>
                    <div class="space-y-10 ${data.sidebarPos === 'right' ? 'order-last' : 'order-first'}">
                        ${data.sectionOrder.sidebar.map(renderSection).join('')}
                    </div>
                </div>
                
                <!-- Page Break Indicator -->
                <div class="mt-20 border-t-2 border-dashed border-gray-100 flex items-center justify-center relative">
                    <span class="absolute -top-3 bg-white px-4 text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">Potential Page Break</span>
                </div>
            </div>
    `;
}

function renderMinimalistTemplate(data, fullName, locationStr) {
    const getSectionHeader = (title, iconName) => {
        const icons = {
            profile: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
            experience: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            education: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m18 0l-9 5"></path></svg>',
            skills: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
            contact: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            details: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            interests: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
            references: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>'
        };
        const showIcons = data.showHeaderIcons === 'icons';
        return `
            <h2 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                ${showIcons ? `<span class="opacity-60">${icons[iconName] || ''}</span>` : ''}
                <span>${title}</span>
            </h2>`;
    };

    const renderSection = (id) => {
        if (data.sectionVisibility && data.sectionVisibility[id] === false) return '';
        if (id === 'profile') return `
            <section>
                ${getSectionHeader('Profile', 'profile')}
                <div class="text-sm leading-relaxed font-medium text-gray-600 quill-content">${data.personalInfo.summary || ''}</div>
            </section>`;
        if (id === 'experience') return `
            <section>
                ${getSectionHeader('Experience', 'experience')}
                <div class="space-y-8">
                    ${data.experience.map(exp => `
                        <div>
                            <div class="flex justify-between items-baseline mb-1">
                                <h3 class="text-base font-bold text-gray-900">${exp.jobTitle}</h3>
                                <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">${exp.duration}</span>
                            </div>
                            <p class="text-sm font-bold text-indigo-600 mb-3">${exp.company}</p>
                            <div class="text-xs text-gray-600 leading-relaxed font-medium quill-content">${exp.responsibilities}</div>
                        </div>
                    `).join('')}
                </div>
            </section>`;
        if (id === 'education') return `
            <section>
                ${getSectionHeader('Education', 'education')}
                <div class="space-y-4">
                    ${data.education.map(edu => `
                        <div>
                            <h4 class="text-sm font-bold text-gray-900">${edu.degree}</h4>
                            <p class="text-[10px] font-bold text-gray-500 uppercase mb-2">${edu.school} • ${edu.year}</p>
                            ${edu.description ? `<div class="text-xs text-gray-600 leading-relaxed font-medium quill-content">${edu.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </section>`;
        if (id === 'skills') return `
            <section>
                ${getSectionHeader('Skills', 'skills')}
                <p class="text-[11px] font-bold text-gray-700 leading-loose">
                    ${[...data.skills.technical, ...data.skills.soft].join(' • ')}
                </p>
            </section>`;
        if (id === 'references') return `
            ${data.referencesOnRequest || data.references.length > 0 ? `
            <section>
                ${getSectionHeader('References', 'references')}
                ${data.referencesOnRequest ? `<p class="text-xs italic text-gray-400">Available on request</p>` : `
                    <div class="grid grid-cols-2 gap-6">
                        ${data.references.map(ref => `
                            <div>
                                <h4 class="text-xs font-bold text-gray-800">${ref.name}</h4>
                                <p class="text-[9px] font-bold text-gray-400 uppercase">${ref.company}</p>
                            </div>
                        `).join('')}
                    </div>
                `}
            </section>
            ` : ''}`;
        if (id === 'interests') return `
            ${data.hobbies.length > 0 ? `
                <section>
                    ${getSectionHeader('Interests', 'interests')}
                    <p class="text-xs text-gray-700">${data.hobbies.join(', ')}</p>
                </section>
            ` : ''}`;
        return '';
    };

    const combinedOrder = [...data.sectionOrder.main, ...data.sectionOrder.sidebar].filter(id => id !== 'contact');

    return `
            <div class="minimalist-template animate-fade-in px-20 py-16 min-h-[1123px] text-gray-800 font-outfit">
                <header class="text-center mb-12">
                    <h1 class="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">${fullName}</h1>
                    <p class="text-lg font-bold text-indigo-600 uppercase tracking-widest mb-2 leading-none">${data.personalInfo.jobTitle || ''}</p>
                    ${data.personalInfo.headline ? `<p class="text-[11px] font-medium text-gray-400 italic mb-4 max-w-lg mx-auto leading-relaxed">${data.personalInfo.headline}</p>` : ''}
                    <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                        ${data.personalInfo.email ? `<span>${data.personalInfo.email}</span>` : ''}
                        ${data.personalInfo.phone ? `<span>•</span> <span>${data.personalInfo.phone}</span>` : ''}
                        ${locationStr ? `<span>•</span> <span>${locationStr}</span>` : ''}
                    </div>
                    <div class="flex justify-center gap-4 mt-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        ${data.personalInfo.linkedin ? `<span>LinkedIn: ${data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>` : ''}
                        ${data.personalInfo.website ? `<span>Portfolio: ${data.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>` : ''}
                    </div>
                </header>

                <div class="space-y-10 max-w-2xl mx-auto">
                    ${combinedOrder.map(renderSection).join('')}
                </div>

                <!-- Page Break Indicator (Visual Guide Only) -->
                <div class="mt-20 border-t-2 border-dashed border-gray-100 flex items-center justify-center relative">
                    <span class="absolute -top-3 bg-white px-4 text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">Potential Page Break</span>
                </div>
            </div>
    `;
}

// Section Addition Buttons
if (addExperienceBtn) addExperienceBtn.addEventListener('click', () => {
    addExperienceItem();
    // Expand the new item
    const lastItem = experienceList.lastElementChild;
    if (lastItem) {
        const content = lastItem.querySelector('.accordion-content');
        const arrow = lastItem.querySelector('.accordion-header svg');
        content.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
        lastItem.querySelector('.accordion-header').classList.add('bg-gray-50');
    }
});

if (addEducationBtn) addEducationBtn.addEventListener('click', () => {
    addEducationItem();
    // Expand the new item
    const lastItem = educationList.lastElementChild;
    if (lastItem) {
        const content = lastItem.querySelector('.accordion-content');
        const arrow = lastItem.querySelector('.accordion-header svg');
        content.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
        lastItem.querySelector('.accordion-header').classList.add('bg-gray-50');
    }
});

if (addHobbyBtn) addHobbyBtn.addEventListener('click', () => addHobbyItem());
if (addReferenceBtn) addReferenceBtn.addEventListener('click', () => addReferenceItem());
if (refOnRequestCheckbox) refOnRequestCheckbox.addEventListener('change', () => updatePreview());

const fontSelector = document.querySelector('[name="fontPairing"]');
const densitySelector = document.querySelector('[name="density"]');

['sidebarPos', 'sidebarStyle', 'photoStyle', 'showHeaderIcons'].forEach(name => {
    document.querySelectorAll(`[name="${name}"]`).forEach(el => {
        el.addEventListener('change', () => {
            updatePreview();
            triggerAutoSave();
        });
    });
});

document.querySelectorAll('input[name^="sectionVisibility."]').forEach(el => {
    el.addEventListener('change', () => {
        updatePreview();
        triggerAutoSave();
    });
});

if (fontSelector) fontSelector.addEventListener('change', (e) => {
    cvData.fontPairing = e.target.value;
    updatePreview();
    triggerAutoSave();
});

if (densitySelector) densitySelector.addEventListener('change', (e) => {
    cvData.density = e.target.value;
    updatePreview();
    triggerAutoSave();
});

// Initialize with existing data from cvData
if (typeof cvData !== 'undefined') {
    if (!cvData.sectionOrder) {
        cvData.sectionOrder = {
            main: ['profile', 'experience', 'interests', 'references'],
            sidebar: ['contact', 'details', 'skills', 'education']
        };
    }
    if (cvData.experience) cvData.experience.forEach(exp => addExperienceItem(exp));
    if (cvData.education) cvData.education.forEach(edu => addEducationItem(edu));
    if (cvData.hobbies) cvData.hobbies.forEach(hobby => addHobbyItem(hobby));
    if (cvData.references) cvData.references.forEach(ref => addReferenceItem(ref));
    updatePreview();
}

// Final Finish & Save Button
const finalSaveBtn = document.getElementById('final-save-btn');
if (finalSaveBtn) {
    finalSaveBtn.addEventListener('click', () => {
        saveBtn.click();
    });
}

// Auto-save & Status Logic
// (Status variables and function moved to top to prevent ReferenceError)


async function performSave() {
    updateSaveStatus('saving');
    try {
        const response = await fetch(`/cv-editor/${CV_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: document.getElementById('cv-title')?.innerText || 'Untitled CV',
                templateId: cvData.templateId || 'modern',
                data: cvData
            })
        });
        const result = await response.json();
        if (result.success) {
            updateSaveStatus('saved');
            return true;
        } else {
            updateSaveStatus('error');
            return false;
        }
    } catch (err) {
        updateSaveStatus('error');
        return false;
    }
}

async function handleExport() {
    const exportBtn = document.getElementById('export-btn');
    if (!exportBtn) return;
    
    const originalContent = exportBtn.innerHTML;
    exportBtn.innerHTML = '<span>Syncing...</span>';
    exportBtn.disabled = true;
    exportBtn.classList.add('opacity-75', 'cursor-not-allowed');

    // Force a save to ensure all data (especially photos) is on the server
    const saved = await performSave();
    
    if (saved) {
        exportBtn.innerHTML = '<span>Exporting...</span>';
        // Open export in new tab
        window.open(`/cv-editor/${CV_ID}/export`, '_blank');
        
        setTimeout(() => {
            exportBtn.innerHTML = originalContent;
            exportBtn.disabled = false;
            exportBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }, 2000);
    } else {
        exportBtn.innerHTML = '<span>Save Failed</span>';
        setTimeout(() => {
            exportBtn.innerHTML = originalContent;
            exportBtn.disabled = false;
            exportBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }, 3000);
    }
}

async function handleDOCXExport() {
    const exportBtn = document.getElementById('export-docx-btn');
    if (!exportBtn) return;
    
    const originalContent = exportBtn.innerHTML;
    exportBtn.innerHTML = '<span>Syncing...</span>';
    exportBtn.disabled = true;
    exportBtn.classList.add('opacity-75', 'cursor-not-allowed');

    // Force a save
    const saved = await performSave();
    
    if (saved) {
        exportBtn.innerHTML = '<span>Exporting...</span>';
        // Open export in new tab
        window.open(`/cv-editor/${CV_ID}/export/docx`, '_blank');
        
        setTimeout(() => {
            exportBtn.innerHTML = originalContent;
            exportBtn.disabled = false;
            exportBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }, 2000);
    } else {
        exportBtn.innerHTML = '<span>Save Failed</span>';
        setTimeout(() => {
            exportBtn.innerHTML = originalContent;
            exportBtn.disabled = false;
            exportBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }, 3000);
    }
}

function triggerAutoSave() {
    updateSaveStatus('unsaved');
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        performSave();
    }, 2500);
}

/**
 * AI Content Generation Handler
 */
async function handleAIGeneration(event) {
    const btn = event.currentTarget;
    const type = btn.dataset.type;
    const targetKey = btn.dataset.target;

    // Prevent double clicking while working or in undo state
    if (btn.classList.contains('ai-working') || btn.getAttribute('data-state') === 'undo') return;
    
    // Find the associated editor container
    let editorEl;
    if (targetKey) {
        editorEl = document.querySelector(`[name="${targetKey}"], [data-key="${targetKey}"]`);
    }
    
    // Fallback: search surrounding area for editors or standard inputs
    if (!editorEl) {
        const section = btn.closest('.col-span-2') || btn.closest('.experience-item') || btn.closest('div');
        editorEl = section ? section.querySelector('.quill-editor, #summary-editor, textarea, input') : null;
    }
    
    if (!editorEl) {
        console.error("AI: No target editor element found for", btn);
        return;
    }
    
    let inputData = "";
    const isSimpleInput = editorEl.tagName === 'TEXTAREA' || editorEl.tagName === 'INPUT';
    
    if (isSimpleInput) {
        inputData = editorEl.value.trim();
    } else {
        const quill = Quill.find(editorEl);
        if (quill) inputData = quill.getText().trim();
    }

    // For skills/headlines, we allow empty input as it's based on the Job Title
    if (type !== 'skills' && type !== 'headline' && (!inputData || inputData.length < 5)) {
        alert("Please write a few words first so the AI has something to improve!");
        return;
    }

    const originalContent = btn.innerHTML;
    const previousValue = isSimpleInput ? editorEl.value : Quill.find(editorEl).root.innerHTML;

    btn.innerHTML = '<span class="flex items-center space-x-1"><span>✨</span><span class="animate-pulse">Thinking...</span></span>';
    btn.disabled = true;
    btn.classList.add('opacity-80', 'bg-indigo-100');

    try {
        const jobTitleInput = document.querySelector('[name="personalInfo.jobTitle"]');
        const aiToneSelector = document.getElementById('ai-tone-selector');

        // Extract block-specific context for items (Education/Experience) so AI doesn't hallucinate missing details
        let blockContext = "";
        const eduContainer = btn.closest('.education-item');
        if (eduContainer && type === 'education') {
            const currentDegree = eduContainer.querySelector('[data-key="degree"]')?.value || 'Degree';
            const currentSchool = eduContainer.querySelector('[data-key="school"]')?.value || 'Institution';
            blockContext = `For Degree: ${currentDegree} at ${currentSchool}`;
        }
        
        const expContainer = btn.closest('.experience-item');
        if (expContainer && type === 'experience') {
            const currentRole = expContainer.querySelector('[data-key="jobTitle"]')?.value || 'Role';
            const currentCompany = expContainer.querySelector('[data-key="company"]')?.value || 'Company';
            blockContext = `For Role: ${currentRole} at ${currentCompany}`;
        }

        if (type === 'skills') {
            blockContext = targetKey === 'skills.technical' ? 'Technical Skills' : 'Soft Skills';
        }

        // Build richer context from current cvData
        const recentExperience = (cvData.experience || [])
            .slice(0, 3)
            .map(e => `${e.jobTitle || ''} at ${e.company || ''}`.trim())
            .filter(Boolean);

        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                input: inputData || "General responsibilities",
                stream: true,
                context: {
                    jobTitle: jobTitleInput ? jobTitleInput.value : (cvData.personalInfo?.jobTitle || 'Professional'),
                    targetTone: aiToneSelector ? aiToneSelector.value : 'Professional',
                    recentExperience: recentExperience,
                    targetArea: cvData.personalInfo?.jobTitle || '',
                    blockContext: blockContext
                }
            })
        });

        if (response.status === 429) {
            alert('You\'re generating too quickly! Please wait a moment before trying again.');
            btn.innerHTML = originalContent;
            btn.disabled = false;
            btn.classList.remove('opacity-80', 'bg-indigo-100');
            return;
        }

        const contentType = response.headers.get('content-type');
        let finalResult = '';

        if (contentType && contentType.includes('application/json')) {
            // Handled as JSON (e.g. fallback to smaller model or error)
            const data = await response.json();
            if (data.result) {
                finalResult = data.result;
            } else if (data.error) {
                throw new Error(data.error);
            }
        } else {
            // Handled as Text/Event-Stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            if (!isSimpleInput) {
                const quill = Quill.find(editorEl);
                quill.setText('');
            } else {
                editorEl.value = '';
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let newlineIndex;

                while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
                    const currentEvent = buffer.slice(0, newlineIndex);
                    buffer = buffer.slice(newlineIndex + 2);

                    const dataLine = currentEvent.split('\n').find(l => l.startsWith('data: '));
                    if (dataLine) {
                        const dataStr = dataLine.slice(6);
                        if (dataStr === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.text) {
                                finalResult += parsed.text;
                                if (isSimpleInput) {
                                    editorEl.value = finalResult;
                                    editorEl.scrollTop = editorEl.scrollHeight;
                                } else {
                                    const quill = Quill.find(editorEl);
                                    // Inject raw HTML gently (it updates constantly, so root.innerHTML is fast but strict)
                                    quill.root.innerHTML = finalResult;
                                }
                            }
                        } catch (e) {
                            // incomplete parsing chunk silently ignored until next buffer pass
                        }
                    }
                }
            }
        }

        if (finalResult) {
            if (isSimpleInput) {
                editorEl.value = finalResult;
                editorEl.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                const quill = Quill.find(editorEl);
                quill.setText('');
                quill.clipboard.dangerouslyPasteHTML(0, finalResult);
            }
            
            // Visual success feedback
            const container = editorEl.closest('.quill-editor, #summary-editor, textarea');
            container.classList.add('ai-success-flash');
            setTimeout(() => container.classList.remove('ai-success-flash'), 2000);

            // Temporarily change button to "Undo"
            btn.setAttribute('data-state', 'undo');
            btn.innerHTML = '<span>↩️ Undo AI</span>';
            btn.classList.remove('bg-indigo-50', 'text-indigo-600', 'bg-indigo-100');
            btn.classList.add('bg-orange-50', 'text-orange-600');
            btn.disabled = false;
            
            const undoHandler = (e) => {
                e.stopPropagation();
                if (isTextarea) {
                    editorEl.value = previousValue;
                    editorEl.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    const quill = Quill.find(editorEl);
                    quill.setText('');
                    quill.clipboard.dangerouslyPasteHTML(0, previousValue);
                }
                btn.removeAttribute('data-state');
                btn.innerHTML = originalContent;
                btn.classList.remove('bg-orange-50', 'text-orange-600');
                btn.classList.add('bg-indigo-50', 'text-indigo-600');
                btn.removeEventListener('click', undoHandler);
                updatePreview();
            };

            btn.addEventListener('click', undoHandler, { once: true });
            
            // Revert button back to original after 10 seconds if not clicked
            setTimeout(() => {
                if (btn.getAttribute('data-state') === 'undo') {
                    btn.removeAttribute('data-state');
                    btn.innerHTML = originalContent;
                    btn.classList.remove('bg-orange-50', 'text-orange-600');
                    btn.classList.add('bg-indigo-50', 'text-indigo-600');
                    btn.removeEventListener('click', undoHandler);
                }
            }, 10000);

            updatePreview();
            triggerAutoSave();
        } else if (data.error) {
            alert(data.error);
            btn.innerHTML = originalContent;
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert("Connection to AI assistant failed. Please check your internet.");
        btn.innerHTML = originalContent;
    } finally {
        if (btn.getAttribute('data-state') !== 'undo') {
            btn.innerHTML = originalContent;
            btn.disabled = false;
            btn.classList.remove('opacity-80', 'bg-indigo-100');
        } else {
             btn.disabled = false;
             btn.classList.remove('opacity-80', 'bg-indigo-100');
        }
    }
}

if (saveBtn) {
    saveBtn.addEventListener('click', performSave);
}

if (exportBtn) {
    exportBtn.addEventListener('click', handleExport);
}

// Global listener for AI generation buttons (handles dynamic elements)
document.addEventListener('click', (e) => {
    const aiBtn = e.target.closest('.ai-gen-btn');
    if (aiBtn) {
        handleAIGeneration({ currentTarget: aiBtn });
    }
});

// Helpers
function hexToRgb(hex) {
    // Remove '#' if present
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (hex.length === 3) { // e.g., #abc
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return `${r}, ${g}, ${b}`;
    } else if (hex.length === 6) { // e.g., #aabbcc
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
    // Default or error case
    return '79, 70, 229'; // A default color if hex is invalid
}

// Design Step Listeners
document.querySelectorAll('input[name="themeColor"], input[name="templateId"]').forEach(input => {
    input.addEventListener('change', () => updatePreview());
});
if (document.getElementById('custom-color-picker')) {
    document.getElementById('custom-color-picker').addEventListener('input', (e) => {
        // Debounce custom color picker to prevent preview lag
        clearTimeout(window.colorTimeout);
        window.colorTimeout = setTimeout(() => {
            updatePreview();
        }, 50);
    });
}

// Form Validation Logic
function validateField(input) {
    if (!input || !input.classList) return true;
    
    let isValid = true;
    if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(input.value);
    }
    
    // Add red border if invalid
    if (!isValid) {
        input.classList.add('border-red-400', 'bg-red-50');
        input.classList.remove('border-gray-200', 'bg-gray-50');
    } else {
        input.classList.remove('border-red-400', 'bg-red-50');
        input.classList.add('border-gray-200', 'bg-gray-50');
    }
    return isValid;
}

// Attach listeners (Delegation for dynamic fields)
editorForm.addEventListener('blur', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        validateField(e.target);
    }
}, true);

// Mobile Toggle Logic
const previewSection = document.getElementById('preview-section');
const togglePreviewBtn = document.getElementById('toggle-preview-mobile');

if (togglePreviewBtn) {
    togglePreviewBtn.addEventListener('click', () => {
        const isMobileView = window.innerWidth < 1024;
        if (!isMobileView) return;

        const isPreviewVisible = !previewSection.classList.contains('hidden');
        if (isPreviewVisible) {
            previewSection.classList.add('hidden');
            previewSection.classList.remove('flex', 'fixed', 'inset-0', 'z-40');
            togglePreviewBtn.querySelector('span').innerText = 'Preview';
        } else {
            previewSection.classList.remove('hidden');
            previewSection.classList.add('flex', 'fixed', 'inset-0', 'z-40');
            togglePreviewBtn.querySelector('span').innerText = 'Close';
        }
    });
}

updateSaveStatus('saved');
if (saveBtn) saveBtn.addEventListener('click', performSave);
if (exportBtn) exportBtn.addEventListener('click', handleExport);
if (exportDocxBtn) exportDocxBtn.addEventListener('click', handleDOCXExport);

// --- Share Button ---
const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        const isPublic = shareBtn.dataset.public === 'true';
        const newStatus = !isPublic;
        try {
            const res = await fetch(`/cv-editor/${CV_ID}/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: newStatus })
            });
            const result = await res.json();
            if (result.success) {
                shareBtn.dataset.public = result.isPublic;
                shareBtn.dataset.slug = result.publicSlug;
                if (result.isPublic) {
                    const url = `${window.location.origin}/p/${result.publicSlug}`;
                    alert(`Public link created and copied to clipboard!\n${url}`);
                    navigator.clipboard.writeText(url);
                    shareBtn.classList.remove('bg-violet-600', 'shadow-violet-100', 'hover:bg-violet-700');
                    shareBtn.classList.add('bg-green-600', 'shadow-green-100', 'hover:bg-green-700');
                    shareBtn.querySelector('span').innerText = 'Shared';
                } else {
                    alert('Your CV is now private and restricted.');
                    shareBtn.classList.remove('bg-green-600', 'shadow-green-100', 'hover:bg-green-700');
                    shareBtn.classList.add('bg-violet-600', 'shadow-violet-100', 'hover:bg-violet-700');
                    shareBtn.querySelector('span').innerText = 'Share';
                }
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred while changing sharing status.');
        }
    });
}

// --- AI Interview Prep Logic ---
const ipOpenBtn = document.getElementById('interview-prep-btn');
const ipModal = document.getElementById('interview-prep-modal');
const ipBackdrop = document.getElementById('interview-prep-backdrop');
const ipCloseBtn = document.getElementById('interview-prep-close-btn');
const ipRunBtn = document.getElementById('interview-prep-run-btn');
const ipResetBtn = document.getElementById('interview-prep-reset-btn');
const ipJobDesc = document.getElementById('interview-prep-job-desc');
const ipInputSec = document.getElementById('interview-prep-input-section');
const ipLoading = document.getElementById('interview-prep-loading');
const ipResults = document.getElementById('interview-prep-results');
const ipContainer = document.getElementById('interview-questions-container');

function openIpModal() { ipModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeIpModal() { ipModal.classList.add('hidden'); document.body.style.overflow = ''; }

async function runInterviewPrep() {
    const jd = ipJobDesc.value.trim();
    if (!jd) { alert('Please paste a job description first.'); return; }

    updatePreview(); // Fresh CV Data
    ipInputSec.classList.add('hidden');
    ipLoading.classList.remove('hidden');
    ipResults.classList.add('hidden');
    ipContainer.innerHTML = '';

    const cvText = [
        `[SUMMARY]\n${(cvData.personalInfo?.summary || '').replace(/<[^>]+>/g, '')}`,
        `[EXPERIENCE]\n${(cvData.experience || []).map(e => `${e.jobTitle} at ${e.company}: ${(e.responsibilities || '').replace(/<[^>]+>/g, ' ')}`).join(' | ')}`,
        `[SKILLS]\n${(cvData.skills?.technical || []).concat(cvData.skills?.soft || []).join(', ')}`,
        `[EDUCATION]\n${(cvData.education || []).map(e => `${e.degree} at ${e.school}`).join(' | ')}`
    ].join('\n\n');

    try {
        const res = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'interview-prep',
                input: cvText,
                jobTitle: jd // We'll pass the JD as jobTitle to the controller
            })
        });

        const data = await res.json();
        if (!data.result) throw new Error('No result');

        const lines = data.result.split('\n').filter(l => l.trim());
        const questions = [];
        let current = null;

        lines.forEach(line => {
            if (line.startsWith('Q:')) {
                if (current) questions.push(current);
                current = { q: line.replace('Q:', '').trim(), a: '', t: 'General' };
            } else if (line.startsWith('A:') && current) {
                current.a = line.replace('A:', '').trim();
            } else if (line.startsWith('T:') && current) {
                current.t = line.replace('T:', '').trim();
            }
        });
        if (current) questions.push(current);

        ipContainer.innerHTML = questions.map(q => `
            <div class="p-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-sm hover:shadow-md transition-all group text-left">
                <div class="flex items-center space-x-2 mb-3">
                    <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full">${q.t}</span>
                </div>
                <h4 class="text-xs font-extrabold text-gray-900 dark:text-white leading-relaxed mb-4">${q.q}</h4>
                <div class="pl-4 border-l-2 border-indigo-100 dark:border-slate-700">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                        <span class="mr-1">🧠</span> Coaching Framework
                    </p>
                    <p class="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed italic">${q.a}</p>
                </div>
            </div>
        `).join('');

        ipLoading.classList.add('hidden');
        ipResults.classList.remove('hidden');

    } catch (e) {
        console.error(e);
        alert('Could not generate questions. Please try again.');
        ipLoading.classList.add('hidden');
        ipInputSec.classList.remove('hidden');
    }
}

ipOpenBtn?.addEventListener('click', openIpModal);
ipCloseBtn?.addEventListener('click', closeIpModal);
ipBackdrop?.addEventListener('click', closeIpModal);
ipRunBtn?.addEventListener('click', runInterviewPrep);
ipResetBtn?.addEventListener('click', () => {
    ipResults.classList.add('hidden');
    ipInputSec.classList.remove('hidden');
    ipJobDesc.value = '';
});

/**
 * AI Growth Mentor: Profile Strength & Proactive Tips
 */
function calculateProfileStrength() {
    let score = 0;
    const data = cvData || {};
    
    // 1. Personal Info (15%)
    const pi = data.personalInfo || {};
    let piSub = 0;
    if (pi.firstName && pi.lastName) piSub += 5;
    if (pi.email && pi.phone) piSub += 5;
    if (pi.jobTitle && pi.headline) piSub += 5;
    else if (pi.jobTitle || pi.headline) piSub += 2.5; 
    score += piSub;
    
    // 2. Summary (20%)
    const summaryText = (pi.summary || '').replace(/<[^>]+>/g, '').trim();
    if (summaryText.length > 100) score += 20;
    else if (summaryText.length > 20) score += 10;
    
    // 3. Experience (30%)
    const exp = data.experience || [];
    if (exp.length >= 2) score += 30;
    else if (exp.length === 1) score += 15;
    
    // 4. Education (15%)
    const edu = data.education || [];
    if (edu.length >= 1) score += 15;
    
    // 5. Skills (20%)
    const skills = data.skills || {};
    let skillSub = 0;
    if (skills.technical && skills.technical.length >= 4) skillSub += 10;
    else if (skills.technical && skills.technical.length >= 1) skillSub += 5;
    
    if (skills.soft && skills.soft.length >= 3) skillSub += 10;
    else if (skills.soft && skills.soft.length >= 1) skillSub += 5;
    score += skillSub;
    
    // Safety clamp
    score = Math.min(100, Math.max(0, score));
    
    updateStrengthUI(score);
    return score;
}

function updateStrengthUI(score) {
    const bar = document.getElementById('strength-bar');
    const pct = document.getElementById('strength-percentage');
    const label = document.getElementById('strength-label');
    const tipBox = document.getElementById('proactive-tip-box');
    const tipText = document.getElementById('proactive-tip-text');
    
    if (!bar || !pct || !label) return;
    
    const prevScore = parseInt(pct.innerText) || 0;
    bar.style.width = score + '%';
    pct.innerText = score + '%';
    
    // Dynamic Labels & Tiers
    let level = 'Beginner';
    if (score < 30) level = 'Just Starting';
    else if (score < 60) level = 'Developing';
    else if (score < 90) level = 'Professional';
    else level = 'Elite Masterpiece';
    
    label.innerText = level;
    
    // Determine which section needs fixing for Magic Fix & Tip Text
    let fixType = '';
    let fixTarget = '';
    let fixLabel = '';
    let tip = '';

    const pi = cvData.personalInfo || {};
    const summaryText = (pi.summary || '').replace(/<[^>]+>/g, '').trim();

    if (summaryText.length < 20) {
        tip = 'Add your <strong>Job Title</strong> and a brief <strong>Summary</strong> to jump-start your profile!';
        fixType = 'summary';
        fixTarget = 'personalInfo.summary';
        fixLabel = 'Write Professional Summary';
    } else if (!cvData.skills?.technical || cvData.skills.technical.length < 3) {
        tip = 'You\'re almost there! Add at least <strong>4 Technical Skills</strong> to reach the top tier.';
        fixType = 'skills';
        fixTarget = 'skills.technical';
        fixLabel = 'Suggest Smart Skills';
    } else if (!cvData.education || cvData.education.length === 0) {
        tip = 'Education is key! At least one <strong>Degree</strong> or <strong>Professional Cert</strong> is highly recommended.';
        fixType = 'education-add';
        fixLabel = 'Suggest Smart Education';
    } else if (!cvData.skills?.soft || cvData.skills.soft.length < 3) {
        tip = 'Great tech stack! Now add a few <strong>Soft Skills</strong> (Leadership, Communication) to show your human impact.';
        fixType = 'soft-skills';
        fixTarget = 'skills.soft';
        fixLabel = 'Suggest Soft Skills';
    } else if (!cvData.experience || cvData.experience.length === 0) {
        tip = 'Your profile is taking shape! Add your first <strong>Experience</strong> item to build trust with recruiters.';
        fixType = 'experience';
        fixLabel = 'Suggest Draft Experience';
    } else if (score < 90) {
        const hasWeakExp = cvData.experience.some(e => (e.responsibilities || '').replace(/<[^>]+>/g, '').trim().length < 50);
        if (hasWeakExp) {
            tip = 'One of your <strong>Experience</strong> items looks a bit weak. Let me help you add some high-impact bullet points!';
            fixType = 'experience-enhance';
            fixLabel = 'Enhance Experience';
        } else {
            tip = 'Adding more <strong>Experience</strong> items with bullet points is the fastest way to get noticed.';
            fixType = 'experience-add'; // Just trigger normal generation
            fixLabel = 'Add Sample Experience';
        }
    } else if (score < 100) {
        tip = 'Your CV is strong! Want to beat the competition? Let me check for <strong>Hidden Skill Gaps</strong>.';
        fixType = 'skill-gap';
        fixLabel = 'Run Gap Analysis';
    } else {
        tip = 'Your CV is looking <strong>Elite Masterpiece</strong>. Ready to share it?';
    }

    if (tipText) tipText.innerHTML = `${tip} ${fixLabel ? `<button type="button" onclick="handleMagicFix('${fixType}', '${fixTarget}')" class="ml-2 px-2 py-0.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all text-[8px] font-black uppercase tracking-widest shadow-sm">✨ Magic Fix</button>` : ''}`;
    
    // Show tip if score changed or significant
    if (tipBox && score < 100) {
        tipBox.classList.remove('hidden');
    } else if (tipBox && score === 100) {
        tipText.innerHTML = "Perfect Score! You’re ready to apply. 🚀";
    }

    // Success flash if score increased
    if (score > prevScore && score > 0) {
        pct.classList.add('animate-bounce', 'text-green-500');
        setTimeout(() => pct.classList.remove('animate-bounce', 'text-green-500'), 1000);
    }
}

/**
 * Handle Magic Fix One-Click Optimization
 */
async function handleMagicFix(type, target) {
    const tipText = document.getElementById('proactive-tip-text');
    const originalTip = tipText.innerHTML;
    
    tipText.innerHTML = '<span class="flex items-center space-x-2"><span class="animate-spin text-indigo-500 text-xs">🌀</span><span class="animate-pulse">Co-pilot is working its magic...</span></span>';
    
    try {
        // Find the first relevant button to trigger the same UI logic
        const contextType = type === 'experience' ? 'experience-add' : type === 'experience-enhance' ? 'experience' : type;
        const specificType = `magic-fix-${contextType}`; // magic-fix-summary, magic-fix-skills, etc
        
        const mockBtn = document.createElement('button');
        mockBtn.dataset.type = specificType;
        mockBtn.dataset.target = target;
        mockBtn.className = 'ai-gen-btn hidden'; // invisible but present for logic
        
        // Pass the actual section being fixed as blockContext
        const contextLabel = type === 'summary' ? 'Summary' : type === 'skills' ? 'Technical Skills' : 'Experience';
        
        // Call the main generator with specific type
        
        let dynamicInput = (cvData.personalInfo.jobTitle || 'Professional');
        if (type === 'summary') dynamicInput = (cvData.personalInfo.summary || 'Write a summary');
        if (type === 'experience-enhance') {
            const firstExp = cvData.experience?.[0];
            dynamicInput = firstExp ? `${firstExp.jobTitle} at ${firstExp.company}: ${firstExp.responsibilities}` : dynamicInput;
        }
        if (type === 'skill-gap') {
            dynamicInput = (cvData.skills?.technical || []).join(', ');
        }
        if (type === 'education-add') {
            dynamicInput = cvData.personalInfo.jobTitle || 'Professional';
        }

        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: specificType,
                input: dynamicInput,
                context: {
                    jobTitle: cvData.personalInfo.jobTitle || 'Professional',
                    blockContext: contextLabel
                }
            })
        });

        const data = await response.json();
        if (data.result) {
            // Apply result based on target
            if (type === 'summary') {
                const summaryEditor = document.getElementById('summary-editor');
                if (summaryEditor) {
                    const quill = Quill.find(summaryEditor);
                    quill.root.innerHTML = data.result;
                }
            } else if (type === 'skills') {
                const skillsInput = document.querySelector('[name="skills.technical"]');
                if (skillsInput) skillsInput.value = data.result;
            } else if (type === 'soft-skills') {
                const softSkillsInput = document.querySelector('[name="skills.soft"]');
                if (softSkillsInput) softSkillsInput.value = data.result;
            } else if (type === 'experience' || type === 'experience-add') {
                const parts = data.result.split('|');
                if (parts.length >= 5) {
                    addExperienceItem({
                        company: parts[0],
                        jobTitle: parts[1],
                        startYear: parts[2],
                        endYear: parts[3],
                        responsibilities: parts[4],
                        isPresent: parts[3].toLowerCase() === 'present'
                    });
                }
            } else if (type === 'experience-enhance') {
                const firstExpEl = document.querySelector('.experience-item');
                if (firstExpEl) {
                    const quillEl = firstExpEl.querySelector('.quill-editor');
                    if (quillEl) {
                        const quill = Quill.find(quillEl);
                        if (quill) quill.root.innerHTML = data.result;
                    }
                }
            } else if (type === 'skill-gap') {
                const gaps = data.result.split(',').map(s => s.trim()).filter(s => s);
                if (gaps.length > 0) {
                    tipText.innerHTML = `
                        <div class="space-y-2">
                            <p class="text-xs font-bold text-gray-700">Recommended Skills for ${cvData.personalInfo.jobTitle}:</p>
                            <div class="flex flex-wrap gap-1.5">
                                ${gaps.map(g => `
                                    <button onclick="addSkillToCV('${g}')" class="px-2 py-1 bg-white border border-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all">+ ${g}</button>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    // Don't auto-update preview yet, wait for user to click
                    return; 
                }
            } else if (type === 'education-add') {
                const [degree, school, year, desc] = data.result.split('|').map(s => s.trim());
                if (degree && school) {
                    addEducationItem({
                        degree: degree,
                        school: school,
                        year: year || '2020',
                        description: desc || ''
                    });
                }
            }
            
            if (type !== 'skill-gap') {
                tipText.innerHTML = '<span class="text-green-500 font-black">Applied! Profile Strength boosted. ✨</span>';
                setTimeout(() => {
                    updatePreview();
                    calculateProfileStrength();
                }, 1000);
            }
        }
    } catch (e) {
        console.error(e);
        if (tipText) tipText.innerHTML = originalTip;
    }
}

// Global helper to add skill from mentor tips
window.addSkillToCV = function(skill) {
    const input = document.querySelector('[name="skills.technical"]');
    if (input) {
        const currentVals = (input.value || '').split(',').map(s => s.trim()).filter(s => s);
        if (!currentVals.includes(skill)) {
            currentVals.push(skill);
            input.value = currentVals.join(', ');
            updatePreview();
            calculateProfileStrength();
            
            const tipText = document.getElementById('proactive-tip-text');
            if (tipText) {
                tipText.innerHTML = `<span class="text-green-500 font-bold">Added ${skill}! ✨</span>`;
                setTimeout(() => calculateProfileStrength(), 1500);
            }
        }
    }
}

// Global initialization call
setTimeout(calculateProfileStrength, 1000);
