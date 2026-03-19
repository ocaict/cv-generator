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
const previewContent = document.getElementById('preview-content');
const toggleBtn = document.getElementById('toggle-additional-info');
const additionalPanel = document.getElementById('additional-info-panel');
const toggleIcon = document.getElementById('toggle-icon');
const saveStatusText = document.getElementById('save-status-text');
const saveStatusIndicator = document.getElementById('save-status-indicator');
const exportBtn = document.getElementById('export-btn');
let autoSaveTimeout;

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

function goToStep(step) {
    currentStep = parseInt(step);
    
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
        </div>
    `;
    educationList.appendChild(item);

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
            endYear: item.querySelector('[data-key="endYear"]').value
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
            endMonth, endYear,
            year: `${endMonth} ${endYear}`.trim() // combined for preview
        };
    });

    const data = {
        personalInfo: {
            // Explicitly map nested form data (personalInfo.xxx)
            firstName: formData.get('personalInfo.firstName'),
            lastName: formData.get('personalInfo.lastName'),
            jobTitle: formData.get('personalInfo.jobTitle'),
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
            photo: (typeof cvData !== 'undefined') ? cvData.personalInfo.photo : null
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
        skills: { 
            technical: (formData.get('skills.technical') || '').split(',').map(s => s.trim()).filter(s => s),
            soft: (formData.get('skills.soft') || '').split(',').map(s => s.trim()).filter(s => s)
        }
    };
    
    cvData = data;
    renderPreview(cvData);
    triggerAutoSave();
}

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

    if (TEMPLATE_ID === 'modern') {
        previewContent.innerHTML = `
            <div class="modern-template scale-90 origin-top">
                <header class="border-b-4 border-indigo-600 pb-8 mb-10 flex justify-between items-end">
                    <div>
                        <h1 class="text-5xl font-extrabold text-gray-900 mb-1 uppercase tracking-tighter">${fullName}</h1>
                        <p class="text-2xl font-bold text-indigo-600 uppercase tracking-widest leading-none">${data.personalInfo.jobTitle || 'Job Role'}</p>
                    </div>
                    ${data.personalInfo.photo ? `
                        <div class="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl mb-[-4px]">
                            <img src="${data.personalInfo.photo}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                </header>
                <div class="grid grid-cols-3 gap-10">
                    <aside class="col-span-1 border-r border-gray-100 pr-8">
                        <section class="mb-10">
                            <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Contact</h2>
                            <ul class="space-y-2 text-[10px] font-semibold text-gray-600">
                                <li class="flex items-center space-x-2">📧 <span>${data.personalInfo.email || 'email@example.com'}</span></li>
                                <li class="flex items-center space-x-2">📱 <span>${data.personalInfo.phone || '+1 234 567 890'}</span></li>
                                ${locationStr || data.personalInfo.zipCode ? `<li class="flex items-center space-x-2">📍 <span>${[data.personalInfo.address, data.personalInfo.city, data.personalInfo.zipCode].filter(x => x).join(', ')}</span></li>` : ''}
                                ${data.personalInfo.linkedin ? `<li class="flex items-center space-x-2">🔗 <span>${data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span></li>` : ''}
                                ${data.personalInfo.website ? `<li class="flex items-center space-x-2">🌍 <span>${data.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span></li>` : ''}
                            </ul>
                        </section>
                        
                        ${data.personalInfo.dateOfBirth || data.personalInfo.nationality || data.personalInfo.maritalStatus || data.personalInfo.drivingLicense ? `
                        <section class="mb-10">
                            <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Details</h2>
                            <ul class="space-y-1 text-[9px] text-gray-500 font-bold uppercase">
                                ${data.personalInfo.dateOfBirth ? `<li>Birth: <span class="text-gray-900">${data.personalInfo.dateOfBirth}</span></li>` : ''}
                                ${data.personalInfo.nationality ? `<li>Nat: <span class="text-gray-900">${data.personalInfo.nationality}</span></li>` : ''}
                                ${data.personalInfo.maritalStatus ? `<li>Status: <span class="text-gray-900">${data.personalInfo.maritalStatus}</span></li>` : ''}
                                ${data.personalInfo.drivingLicense ? `<li>DL: <span class="text-gray-900">${data.personalInfo.drivingLicense}</span></li>` : ''}
                            </ul>
                        </section>
                        ` : ''}

                        <section class="mb-10">
                            <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Skills</h2>
                            <div class="flex flex-wrap gap-1.5 mb-4">
                                ${data.skills.technical.map(skill => `<span class="px-2 py-0.5 bg-gray-100 text-[9px] font-bold text-gray-700 rounded uppercase tracking-wider">${skill}</span>`).join('')}
                            </div>
                            <div class="flex flex-wrap gap-1.5">
                                ${data.skills.soft.map(skill => `<span class="px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded uppercase tracking-wider">${skill}</span>`).join('')}
                            </div>
                        </section>
                        <section class="mb-10">
                            <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Education</h2>
                            <div class="space-y-4">
                                ${data.education.map(edu => `
                                    <div>
                                        <h4 class="text-xs font-bold text-gray-900">${edu.degree || 'Degree'}</h4>
                                        <p class="text-[10px] text-gray-400 font-bold uppercase">${edu.school || 'University'} • ${edu.year || ''}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    </aside>
                    <div class="col-span-2">
                        <section class="mb-10">
                            <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Profile</h2>
                            <div class="text-sm leading-relaxed text-gray-700 font-medium animate-fade-in">${data.personalInfo.summary || 'Summary...'}</div>
                        </section>
                        <section class="mb-10">
                             <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Experience</h2>
                             <div class="space-y-8">
                                ${data.experience.map(exp => `
                                    <div>
                                        <div class="flex justify-between items-start mb-1">
                                            <h4 class="text-sm font-bold text-gray-900">${exp.jobTitle || 'Role'}</h4>
                                            <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">${exp.duration || ''}</span>
                                        </div>
                                        <p class="text-xs font-bold text-gray-400 uppercase mb-2">${exp.company || 'Company'}</p>
                                        <div class="text-xs text-gray-600 leading-relaxed quill-content">${exp.responsibilities || ''}</div>
                                    </div>
                                `).join('')}
                             </div>
                        </section>

                        ${data.hobbies.length > 0 ? `
                        <section class="mb-10">
                            <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Interests</h2>
                            <div class="flex flex-wrap gap-2 text-xs text-gray-600 font-medium">
                                ${data.hobbies.join(' • ')}
                            </div>
                        </section>
                        ` : ''}

                        ${data.referencesOnRequest || data.references.length > 0 ? `
                        <section class="mb-10">
                            <h2 class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">References</h2>
                            ${data.referencesOnRequest ? `
                                <p class="text-xs italic text-gray-500">References available on request</p>
                            ` : `
                                <div class="grid grid-cols-2 gap-6">
                                    ${data.references.map(ref => `
                                        <div>
                                            <h4 class="text-xs font-bold text-gray-900">${ref.name}</h4>
                                            <p class="text-[10px] text-gray-400 font-bold uppercase">${ref.company}</p>
                                            <p class="text-[10px] text-indigo-600 mt-1">${ref.email} ${ref.phone ? '• ' + ref.phone : ''}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </section>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Classic
        previewContent.innerHTML = `
            <div class="classic-template text-center py-4">
                ${data.personalInfo.photo ? `
                    <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm mx-auto mb-6">
                        <img src="${data.personalInfo.photo}" class="w-full h-full object-cover">
                    </div>
                ` : ''}
                <h1 class="text-3xl font-serif font-bold text-gray-900 border-b border-gray-900 pb-2 mb-2 italic tracking-tighter">${fullName}</h1>
                <p class="text-[10px] text-gray-500 mb-8 font-serif uppercase tracking-widest">
                    ${data.personalInfo.email} | ${data.personalInfo.phone}
                    ${locationStr ? ` | ${locationStr}` : ''}
                    ${data.personalInfo.linkedin ? ` | ${data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}` : ''}
                </p>
                <div class="text-left space-y-8">
                     <section>
                        <h2 class="text-xs font-bold border-b border-gray-200 pb-1 mb-3 uppercase tracking-widest text-gray-900 font-outfit">Summary</h2>
                        <div class="text-sm leading-relaxed text-gray-700 font-medium">${data.personalInfo.summary || 'Summary...'}</div>
                     </section>
                     
                     <section>
                         <h2 class="text-xs font-bold border-b border-gray-200 pb-1 mb-3 uppercase tracking-widest text-gray-900 font-outfit">Skills</h2>
                         <p class="text-sm text-gray-700"><strong>Technical:</strong> ${data.skills.technical.join(', ')}</p>
                         <p class="text-sm text-gray-700 mt-1"><strong>Soft Skills:</strong> ${data.skills.soft.join(', ')}</p>
                     </section>

                     <section>
                        <h2 class="text-xs font-bold border-b border-gray-200 pb-1 mb-3 uppercase tracking-widest text-gray-900 font-outfit">Experience</h2>
                        <div class="space-y-6">
                            ${data.experience.map(exp => `
                                <div>
                                    <div class="flex justify-between text-sm font-bold">
                                        <span class="text-indigo-600">${exp.company}</span>
                                        <span class="text-gray-400 font-outfit">${exp.duration}</span>
                                    </div>
                                    <p class="italic text-sm text-gray-900 mb-2 font-bold">${exp.jobTitle}</p>
                                    <div class="text-xs text-gray-600 leading-relaxed quill-content">${exp.responsibilities}</div>
                                </div>
                            `).join('')}
                        </div>
                     </section>
                     <section>
                         <h2 class="text-xs font-bold border-b border-gray-200 pb-1 mb-3 uppercase tracking-widest text-gray-900 font-outfit">Education</h2>
                         <div class="space-y-4">
                             ${data.education.map(edu => `
                                 <div>
                                     <div class="flex justify-between text-sm font-bold">
                                         <span class="text-indigo-600">${edu.school}</span>
                                         <span class="text-gray-400 font-outfit">${edu.year}</span>
                                     </div>
                                     <p class="italic text-sm text-gray-900 font-bold">${edu.degree}</p>
                                 </div>
                             `).join('')}
                         </div>
                     </section>

                     ${data.hobbies.length > 0 ? `
                        <section>
                            <h2 class="text-xs font-bold border-b border-gray-200 pb-1 mb-3 uppercase tracking-widest text-gray-900 font-outfit">Interests</h2>
                            <p class="text-xs text-gray-700">${data.hobbies.join(', ')}</p>
                        </section>
                     ` : ''}

                     ${data.referencesOnRequest || data.references.length > 0 ? `
                        <section>
                            <h2 class="text-xs font-bold border-b border-gray-200 pb-1 mb-3 uppercase tracking-widest text-gray-900 font-outfit">References</h2>
                            ${data.referencesOnRequest ? `
                                <p class="text-xs italic text-gray-500">References available on request</p>
                            ` : `
                                <div class="grid grid-cols-2 gap-4">
                                    ${data.references.map(ref => `
                                        <div>
                                            <h4 class="text-xs font-bold text-gray-900 font-outfit">${ref.name}</h4>
                                            <p class="text-[10px] text-gray-400 font-bold uppercase">${ref.company}</p>
                                            <p class="text-[10px] text-indigo-600 mt-1">${ref.email} ${ref.phone ? '• ' + ref.phone : ''}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </section>
                     ` : ''}
                </div>
            </div>
        `;
    }
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

// Initialize with existing data from cvData
if (typeof cvData !== 'undefined') {
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
                title: document.querySelector('h1').innerText,
                templateId: TEMPLATE_ID,
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
    
    // Find the associated editor container
    let editorEl;
    if (targetKey) {
        editorEl = document.querySelector(`[name="${targetKey}"], [data-key="${targetKey}"]`);
    }
    
    // Fallback: search surrounding area for Quill editors
    if (!editorEl) {
        const section = btn.closest('.col-span-2') || btn.closest('.experience-item') || btn.closest('div');
        editorEl = section ? section.querySelector('.quill-editor, #summary-editor, textarea') : null;
    }
    
    if (!editorEl) {
        console.error("AI: No target editor element found for", btn);
        return;
    }
    
    let inputData = "";
    const isTextarea = editorEl.tagName === 'TEXTAREA';
    
    if (isTextarea) {
        inputData = editorEl.value.trim();
    } else {
        const quill = Quill.find(editorEl);
        if (quill) inputData = quill.getText().trim();
    }

    // For skills, we allow empty input as it's based on the Job Title
    if (type !== 'skills' && (!inputData || inputData.length < 5)) {
        alert("Please write a few words first so the AI has something to improve!");
        return;
    }

    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="animate-pulse px-1">✨</span>';
    btn.disabled = true;
    btn.classList.add('opacity-50');

    try {
        const jobTitleInput = document.querySelector('[name="personalInfo.jobTitle"]');
        const aiToneSelector = document.getElementById('ai-tone-selector');
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                input: inputData || "General responsibilities",
                context: {
                    jobTitle: jobTitleInput ? jobTitleInput.value : 'Professional',
                    targetTone: aiToneSelector ? aiToneSelector.value : 'Professional'
                }
            })
        });

        const data = await response.json();
        
        if (data.result) {
            if (isTextarea) {
                editorEl.value = data.result;
                editorEl.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                const quill = Quill.find(editorEl);
                quill.setText('');
                quill.clipboard.dangerouslyPasteHTML(0, data.result);
            }
            updatePreview();
        } else if (data.error) {
            alert(data.error);
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert("Connection to AI assistant failed. Please check your internet.");
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        btn.classList.remove('opacity-50');
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

// Initial status
updateSaveStatus('saved');
